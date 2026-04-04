"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TopicForm from "@/components/TopicForm";
import OutputDisplay from "@/components/OutputDisplay";
import UsageCounter from "@/components/UsageCounter";
import type { GenerateRequest, GenerateResponse, ApiError } from "@/types";

export default function DashboardPage() {
  const { user, loading, refreshProfile } = useAuth();
  const router = useRouter();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleGenerate = async (request: GenerateRequest) => {
    setIsGenerating(true);
    setError("");
    setResponse(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error((data as ApiError).error || "Failed to generate research.");
      }

      setResponse(data as GenerateResponse);
      // Refresh profile to update remaining uses
      await refreshProfile();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 w-full">
      <div className="flex flex-col md:flex-row items-start md:items-end w-full justify-between gap-6 mb-12">
        <div>
          <h1 className="text-display-md text-on-surface mb-3">Research Dashboard</h1>
          <p className="text-body-lg text-outline">Configure your parameters and let our AI compile comprehensive research.</p>
        </div>
        <UsageCounter />
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-200 text-body-md flex items-center gap-3">
          <svg className="shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        <div className="lg:col-span-5 w-full sticky top-24">
          <TopicForm onSubmit={handleGenerate} isLoading={isGenerating} />
        </div>
        
        <div className="lg:col-span-7 w-full">
          <OutputDisplay response={response} isLoading={isGenerating} />
        </div>
      </div>
    </main>
  );
}
