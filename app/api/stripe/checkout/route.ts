// ============================================
// Stripe Checkout API Route — POST /api/stripe/checkout
// Owner: Backend Agent (B)
// ============================================
// Phase 5 (B5.3): Creates a Stripe Checkout Session
// for the "ScholarAI Pro" subscription. The frontend
// redirects to the returned URL.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import getStripe from "@/lib/stripe";

// ─── Firebase Admin Singleton ────────────────────────────────────────

function getAdminApp() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return { auth: getAuth(), db: getFirestore() };
}

// ─── POST /api/stripe/checkout ───────────────────────────────────────

export async function POST(request: NextRequest) {
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
    console.error("[POST /api/stripe/checkout] Auth verification failed:", authError);
    return NextResponse.json(
      { error: "Invalid or expired authentication token", code: 401 },
      { status: 401 }
    );
  }

  // ── 2. Look up user email from Firestore ──────────────────────────
  let customerEmail: string | undefined;

  try {
    const userSnap = await db.collection("users").doc(uid).get();
    if (userSnap.exists) {
      customerEmail = userSnap.data()?.email;
    }
  } catch (firestoreError) {
    console.error("[POST /api/stripe/checkout] Firestore read error:", firestoreError);
    // Non-fatal — proceed without pre-filling email
  }

  // ── 3. Validate env ───────────────────────────────────────────────
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    console.error("[POST /api/stripe/checkout] STRIPE_PRO_PRICE_ID is not set");
    return NextResponse.json(
      { error: "Payment configuration error", code: 500 },
      { status: 500 }
    );
  }

  // ── 4. Determine origin ───────────────────────────────────────────
  const origin =
    request.headers.get("origin") ||
    request.nextUrl.origin ||
    "http://localhost:3000";

  // ── 5. Create Stripe Checkout Session ─────────────────────────────
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      metadata: {
        firebaseUid: uid,
      },
      success_url: `${origin}/dashboard?upgraded=true`,
      cancel_url: `${origin}/pricing`,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (stripeError) {
    console.error("[POST /api/stripe/checkout] Stripe session creation error:", stripeError);

    const message =
      stripeError instanceof Error
        ? stripeError.message
        : "Failed to create checkout session";

    return NextResponse.json(
      { error: message, code: 500 },
      { status: 500 }
    );
  }
}
