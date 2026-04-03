// ============================================
// ScholarAI Shared Types
// Owner: Deployment Agent (D)
// ============================================
// IMPORTANT: This file is the single source of truth.
// All agents import from here. No agent may redefine
// these types in their own files. If a change is needed,
// it must be made here by the Deployment agent.
// ============================================

export type OutputType = "essay" | "outline" | "research_summary";
export type CitationFormat = "mla" | "apa" | "chicago";
export type EducationLevel = "high_school" | "undergraduate" | "graduate";
export type UserPlan = "free" | "pro";

/** What the frontend sends to POST /api/generate */
export interface GenerateRequest {
  topic: string;
  outputType: OutputType;
  citationFormat: CitationFormat;
  educationLevel: EducationLevel;
  wordCount: number;
  additionalInstructions?: string;
}

/** What POST /api/generate returns */
export interface GenerateResponse {
  content: string;
  sources: Source[];
  outputType: OutputType;
  citationFormat: CitationFormat;
  timestamp: string;
}

/** A single source/citation */
export interface Source {
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  domain: string;
}

/** User profile stored in Firestore at users/{uid} */
export interface UserProfile {
  uid: string;
  email: string;
  plan: UserPlan;
  freeUsesRemaining: number;
  totalGenerated: number;
  stripeCustomerId?: string;
  createdAt: string;
}

/** A saved generation stored in Firestore at users/{uid}/history/{id} */
export interface HistoryItem {
  id: string;
  userId: string;
  request: GenerateRequest;
  response: GenerateResponse;
  createdAt: string;
}

/** Standard API error response shape */
export interface ApiError {
  error: string;
  code: number;
}
