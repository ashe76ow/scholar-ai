// ============================================
// Stripe Client — lib/stripe.ts
// Owner: Backend Agent (B)
// ============================================
// Phase 5 (B5.2): Server-side Stripe instance.
// Import this from API routes only — never from
// client components.
// ============================================

import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to .env.local."
      );
    }
    _stripe = new Stripe(key, {
      typescript: true,
    });
  }
  return _stripe;
}

export default getStripe;
