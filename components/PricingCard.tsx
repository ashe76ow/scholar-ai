"use client";

import React from "react";

export interface PricingCardProps {
  planName: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaAction: () => void;
  isFeatured?: boolean;
}

export default function PricingCard({
  planName,
  price,
  features,
  ctaText,
  ctaAction,
  isFeatured = false,
}: PricingCardProps) {
  const outerClasses = isFeatured
    ? "p-[1px] rounded-lg bg-gradient-to-br from-[#95CCFF] to-[#2297E2] shadow-[0_0_15px_2px_rgba(149,204,255,0.1)] w-full"
    : "p-[1px] rounded-lg bg-transparent w-full"; // Transparent for free, keep padding for alignment

  return (
    <div className={outerClasses}>
      <div className="relative flex flex-col p-8 rounded-lg w-full h-full bg-[#1B1B1B]">
        <div className="flex flex-col mb-8 gap-2">
          <h3 className="text-headline-md text-on-surface">{planName}</h3>
          <p className="text-display-md text-on-surface">{price}</p>
        </div>

        <ul className="flex flex-col gap-8 mb-10 flex-grow">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-4 text-body-lg text-on-surface">
              <svg
                className="shrink-0 text-primary w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={ctaAction}
          className={`w-full py-4 text-center rounded text-body-lg font-bold transition-all ${
            isFeatured
              ? "btn-primary hover-lift hover:bloom-effect text-white"
              : "btn-secondary text-on-surface ghost-border hover-lift hover:bg-[#242424]"
          }`}
        >
          {ctaText}
        </button>
      </div>
    </div>
  );
}
