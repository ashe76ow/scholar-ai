// ============================================
// POST /api/auth — Create user profile
// Owner: Backend Agent (B)
// ============================================
// Called after signup to create the Firestore
// user document with the UserProfile shape.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { UserProfile } from "@/types";

// Initialize Firebase Admin SDK (server-side only)
function getAdminFirestore() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return getFirestore();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email } = body;

    // Validate required fields
    if (!uid || !email) {
      return NextResponse.json(
        { error: "Missing uid or email", code: 400 },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();

    // Check if user already exists
    const existingDoc = await adminDb.collection("users").doc(uid).get();
    if (existingDoc.exists) {
      return NextResponse.json(
        { message: "User profile already exists" },
        { status: 200 }
      );
    }

    // Create the user profile document
    const userProfile: UserProfile = {
      uid,
      email,
      plan: "free",
      freeUsesRemaining: 5,
      totalGenerated: 0,
      createdAt: new Date().toISOString(),
    };

    await adminDb.collection("users").doc(uid).set(userProfile);

    return NextResponse.json(
      { message: "User profile created", uid },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error", code: 500 },
      { status: 500 }
    );
  }
}
