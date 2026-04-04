"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full glassmorphism border-b ghost-border">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover-lift">
          <span className="text-body-lg font-bold">ScholarAI</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/features" className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
            Features
          </Link>
          <Link href="/pricing" className="text-body-md text-on-surface-variant hover:text-on-surface transition-colors">
            Pricing
          </Link>
          <div className="flex items-center gap-4 border-l ghost-border pl-6 ml-2">
            {!loading && user ? (
              <>
                <Link href="/dashboard" className="text-body-md font-medium text-on-surface hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <button 
                  onClick={signOut} 
                  className="text-body-md font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  Log out
                </button>
              </>
            ) : !loading ? (
              <>
                <Link href="/login" className="text-body-md font-medium text-on-surface hover:text-primary transition-colors">
                  Log in
                </Link>
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            ) : (
              <div className="w-16 h-8 animate-pulse bg-surface-container-high rounded" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
