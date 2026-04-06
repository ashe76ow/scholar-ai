"use client";

import { useState } from "react";
import PricingCard from "@/components/PricingCard";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function PricingPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [loadingPro, setLoadingPro] = useState(false);

  // FAQ state
  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription at any time from your account settings. You will retain Pro access until the end of your billing cycle.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We actively accept all major credit cards and debit cards via Stripe.",
    },
    {
      q: "What happens when I run out of free generations?",
      a: "If you're on the Free plan, you will need to wait until the next month for your uses to reset, or upgrade to Pro for unlimited generation.",
    },
    {
      q: "Is my data private?",
      a: "Yes. Your research topics and history are strictly private to your account and are never shared with third parties or used to train public models.",
    },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleFreeClick = () => {
    if (!user) {
      router.push("/signup");
    } else {
      router.push("/dashboard");
    }
  };

  const handleProClick = async () => {
    if (!user) {
      router.push("/signup?returnUrl=/pricing");
      return;
    }

    if (profile?.plan === "pro") {
      router.push("/dashboard");
      return;
    }

    setLoadingPro(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong initializing checkout.");
    } finally {
      setLoadingPro(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 w-full">
      <div className="text-center mb-16">
        <h1 className="text-display-md text-on-surface mb-4">Choose Your Plan</h1>
        <p className="text-body-lg text-outline max-w-2xl mx-auto">
          Scale your academic research capabilities with our flexible plans designed for every stage of your academic journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
        <PricingCard
          planName="Free"
          price="5 generations/month"
          features={[
            "All output types",
            "All citation formats",
            "Basic history",
          ]}
          ctaText={user ? "Go to Dashboard" : "Get Started"}
          ctaAction={handleFreeClick}
          isFeatured={false}
        />

        <PricingCard
          planName="Pro"
          price="$9.99/month"
          features={[
            "Everything in Free + Unlimited generations",
            "Priority speed",
            "Full history access",
          ]}
          ctaText={
            profile?.plan === "pro"
              ? "You are Pro"
              : loadingPro
              ? "Redirecting..."
              : "Upgrade to Pro"
          }
          ctaAction={handleProClick}
          isFeatured={true}
        />
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-display-md text-center mb-8">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-surface-container-low rounded-lg transition-all"
            >
              <button
                className="w-full text-left p-6 flex justify-between items-center focus:outline-none bg-[#1B1B1B] rounded-lg"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span className="text-body-lg font-bold text-on-surface">{faq.q}</span>
                <svg
                  className={`w-6 h-6 text-outline transition-transform duration-300 ${
                    openFaq === idx ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-6 pt-0 text-body-md text-outline bg-[#1B1B1B] rounded-b-lg -mt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
