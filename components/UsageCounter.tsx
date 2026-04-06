"use client";

import { useAuth } from "@/lib/auth-context";

export default function UsageCounter() {
  const { profile, loading } = useAuth();

  if (loading || !profile) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ghost-border glassmorphism text-label-md">
      {profile.plan === "pro" ? (
        <>
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-[#95CCFF] to-[#2297E2]">
            Unlimited
          </span>
        </>
      ) : (
        <>
          <span
            className={`w-2 h-2 rounded-full ${
              profile.freeUsesRemaining > 0 ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <span className="text-outline">
            {profile.freeUsesRemaining} free uses left
          </span>
          {profile.freeUsesRemaining === 0 && (
            <a href="/pricing" className="text-primary hover:underline ml-2">
              Upgrade
            </a>
          )}
        </>
      )}
    </div>
  );
}
