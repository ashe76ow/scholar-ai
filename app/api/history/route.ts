// ============================================
// History API Route — GET /api/history
// Owner: Backend Agent (B)
// ============================================
// Phase 4 (B4.1): Returns paginated generation history
// for an authenticated user.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import type { HistoryItem } from "@/types";

// ─── Firebase Admin Singleton ────────────────────────────────────────

function getAdminApp() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return { auth: getAuth(), db: getFirestore() };
}

// ─── GET /api/history ────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { auth, db } = getAdminApp();

  // ── 1. Verify Authentication ──────────────────────────────────────
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header", code: 401 },
      { status: 401 }
    );
  }

  const idToken = authHeader.split("Bearer ")[1];
  let uid: string;

  try {
    const decoded = await auth.verifyIdToken(idToken);
    uid = decoded.uid;
  } catch (authError) {
    console.error("[GET /api/history] Auth verification failed:", authError);
    return NextResponse.json(
      { error: "Invalid or expired authentication token", code: 401 },
      { status: 401 }
    );
  }

  // ── 2. Parse Pagination Params ────────────────────────────────────
  const searchParams = request.nextUrl.searchParams;

  let page = parseInt(searchParams.get("page") || "1", 10);
  let limit = parseInt(searchParams.get("limit") || "20", 10);

  // Clamp to safe bounds
  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const offset = (page - 1) * limit;

  // ── 3. Query Firestore ────────────────────────────────────────────
  try {
    const historyRef = db
      .collection("users")
      .doc(uid)
      .collection("history");

    const snapshot = await historyRef
      .orderBy("createdAt", "desc")
      .offset(offset)
      .limit(limit + 1) // Fetch one extra to determine hasMore
      .get();

    const docs = snapshot.docs;
    const hasMore = docs.length > limit;

    // Slice to the requested limit (drop the extra probe document)
    const items: HistoryItem[] = docs
      .slice(0, limit)
      .map((doc) => doc.data() as HistoryItem);

    // ── 4. Return Response ────────────────────────────────────────────
    return NextResponse.json({ items, hasMore }, { status: 200 });
  } catch (firestoreError) {
    console.error("[GET /api/history] Firestore query error:", firestoreError);
    return NextResponse.json(
      { error: "Failed to retrieve history", code: 500 },
      { status: 500 }
    );
  }
}
