// ============================================
// Stripe Webhook API Route — POST /api/stripe/webhook
// Owner: Backend Agent (B)
// ============================================
// Phase 5 (B5.4): Handles Stripe webhook events.
// CRITICAL: Uses raw body for signature verification.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import getStripe from "@/lib/stripe";
import type Stripe from "stripe";

// ─── Firebase Admin Singleton ────────────────────────────────────────

function getAdminApp() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return { db: getFirestore() };
}

// ─── POST /api/stripe/webhook ────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { db } = getAdminApp();

  // ── 1. Read raw body (DO NOT parse as JSON) ───────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("[POST /api/stripe/webhook] Missing stripe-signature header");
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[POST /api/stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 500 }
    );
  }

  // ── 2. Verify Stripe signature ────────────────────────────────────
  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[POST /api/stripe/webhook] Signature verification failed:", message);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // ── 3. Handle events ──────────────────────────────────────────────
  try {
    switch (event.type) {
      // ── checkout.session.completed ─────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const firebaseUid = session.metadata?.firebaseUid;
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        if (!firebaseUid) {
          console.error(
            "[POST /api/stripe/webhook] checkout.session.completed: missing firebaseUid in metadata",
            { sessionId: session.id }
          );
          break;
        }

        console.log(
          `[POST /api/stripe/webhook] Upgrading user ${firebaseUid} to Pro`,
          { stripeCustomerId, sessionId: session.id }
        );

        await db.collection("users").doc(firebaseUid).update({
          plan: "pro",
          freeUsesRemaining: -1,
          ...(stripeCustomerId ? { stripeCustomerId } : {}),
        });

        break;
      }

      // ── customer.subscription.deleted ──────────────────────────────
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id;

        if (!customerId) {
          console.error(
            "[POST /api/stripe/webhook] customer.subscription.deleted: missing customer ID",
            { subscriptionId: subscription.id }
          );
          break;
        }

        console.log(
          `[POST /api/stripe/webhook] Reverting customer ${customerId} to free plan`,
          { subscriptionId: subscription.id }
        );

        // Look up the user by stripeCustomerId
        const usersSnapshot = await db
          .collection("users")
          .where("stripeCustomerId", "==", customerId)
          .limit(1)
          .get();

        if (usersSnapshot.empty) {
          console.error(
            `[POST /api/stripe/webhook] No user found with stripeCustomerId: ${customerId}`
          );
          break;
        }

        const userDoc = usersSnapshot.docs[0];

        await userDoc.ref.update({
          plan: "free",
          freeUsesRemaining: 5,
          stripeCustomerId: FieldValue.delete(),
        });

        break;
      }

      // ── Unhandled event types ──────────────────────────────────────
      default:
        console.log(`[POST /api/stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (handlerError) {
    console.error(
      `[POST /api/stripe/webhook] Error handling ${event.type}:`,
      handlerError
    );
    // Return 500 so Stripe retries
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  // ── 4. Always acknowledge ─────────────────────────────────────────
  return NextResponse.json({ received: true }, { status: 200 });
}
