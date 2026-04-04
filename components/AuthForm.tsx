"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  type: "login" | "signup";
}

export default function AuthForm({ type }: AuthFormProps) {
  const { signIn, signUp, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (type === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-lg glassmorphism ghost-border">
      <h2 className="text-headline-md mb-6 font-bold text-center">
        {type === "login" ? "Welcome Back" : "Create an Account"}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-label-md text-outline" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#0E0E0E] text-on-surface placeholder:text-outline-variant border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-label-md text-outline" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#0E0E0E] text-on-surface placeholder:text-outline-variant border ghost-border rounded-md px-4 py-3 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_2px_rgba(149,204,255,0.3)] transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || loading}
          className="btn-primary w-full mt-2"
        >
          {isSubmitting ? "Processing..." : (type === "login" ? "Log in" : "Sign up")}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-outline-variant opacity-30"></div>
        <span className="text-label-md text-outline">OR</span>
        <div className="h-[1px] flex-1 bg-outline-variant opacity-30"></div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting || loading}
        className="btn-secondary w-full mt-6 flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 8v8"></path>
          <path d="M8 12h8"></path>
        </svg>
        Continue with Google
      </button>

      <p className="mt-8 text-center text-body-lg text-outline">
        {type === "login" ? "Don't have an account? " : "Already have an account? "}
        <a href={type === "login" ? "/signup" : "/login"} className="text-primary hover:underline">
          {type === "login" ? "Sign up" : "Log in"}
        </a>
      </p>
    </div>
  );
}
