// ============================================
// Auth API Route — POST /api/auth
// Owner: Backend Agent (B)
// ============================================
// Creates a Firestore user profile after signup.
// Called by auth-context.tsx after createUserWithEmailAndPassword
// or signInWithPopup (Google) when no profile exists yet.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { UserProfile } from "@/types";

// ---------- Firebase Admin (server-side) ----------

function getAdminDb() {
  if (getApps().length === 0) {
    // In production you'd use a service account; for now we use
    // the project ID to connect via Application Default Credentials
    // or just the client SDK from the server side.
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

// ---------- POST handler ----------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email } = body as { uid?: string; email?: string };

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing required fields: uid and email", code: 400 },
        { status: 400 }
      );
    }

    const adminDb = getAdminDb();
    const userRef = adminDb.collection("users").doc(uid);

    // Check if user already exists (idempotency)
    const existing = await userRef.get();
    if (existing.exists) {
      return NextResponse.json(
        { message: "User profile already exists" },
        { status: 200 }
      );
    }

    // Build the UserProfile document
    const userProfile: UserProfile = {
      uid,
      email,
      plan: "free",
      freeUsesRemaining: 5,
      totalGenerated: 0,
      createdAt: new Date().toISOString(),
    };

    await userRef.set(userProfile);

    return NextResponse.json(
      { message: "User profile created", uid },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/auth] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", code: 500 },
      { status: 500 }
    );
  }
}
