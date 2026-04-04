// ============================================
// Generate API Route — POST /api/generate
// Owner: Backend Agent (B)
// ============================================
// Phase 3 (B3.1–B3.3): Auth → Usage → Generate → Save → Return
// Includes rate limiting and structured error handling.
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { generateContent } from "@/lib/gemini";
import type {
  GenerateRequest,
  GenerateResponse,
  UserProfile,
  HistoryItem,
  OutputType,
  CitationFormat,
  EducationLevel,
} from "@/types";

// ─── Firebase Admin Singleton ────────────────────────────────────────

function getAdminApp() {
  if (getApps().length === 0) {
    initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
  return { auth: getAuth(), db: getFirestore() };
}

// ─── Rate Limiter (B3.2) ─────────────────────────────────────────────
// In-memory, per-user. Max 3 requests per 60-second rolling window.

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 3;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(uid: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(uid) ?? [];

  // Prune entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(uid, recent);
    return false; // rate limited
  }

  recent.push(now);
  rateLimitMap.set(uid, recent);
  return true; // allowed
}

// ─── Request Validation ──────────────────────────────────────────────

const VALID_OUTPUT_TYPES: OutputType[] = ["essay", "outline", "research_summary"];
const VALID_CITATION_FORMATS: CitationFormat[] = ["mla", "apa", "chicago"];
const VALID_EDUCATION_LEVELS: EducationLevel[] = [
  "high_school",
  "undergraduate",
  "graduate",
];

function validateRequest(body: unknown): {
  valid: boolean;
  error?: string;
  data?: GenerateRequest;
} {
  if (!body || typeof body !== "object") {
    return { valid: false, error: "Request body is required" };
  }

  const b = body as Record<string, unknown>;

  if (!b.topic || typeof b.topic !== "string" || b.topic.trim().length === 0) {
    return { valid: false, error: "topic is required and must be a non-empty string" };
  }

  if (!VALID_OUTPUT_TYPES.includes(b.outputType as OutputType)) {
    return {
      valid: false,
      error: `outputType must be one of: ${VALID_OUTPUT_TYPES.join(", ")}`,
    };
  }

  if (!VALID_CITATION_FORMATS.includes(b.citationFormat as CitationFormat)) {
    return {
      valid: false,
      error: `citationFormat must be one of: ${VALID_CITATION_FORMATS.join(", ")}`,
    };
  }

  if (!VALID_EDUCATION_LEVELS.includes(b.educationLevel as EducationLevel)) {
    return {
      valid: false,
      error: `educationLevel must be one of: ${VALID_EDUCATION_LEVELS.join(", ")}`,
    };
  }

  if (
    typeof b.wordCount !== "number" ||
    !Number.isInteger(b.wordCount) ||
    b.wordCount < 100 ||
    b.wordCount > 10000
  ) {
    return {
      valid: false,
      error: "wordCount must be an integer between 100 and 10,000",
    };
  }

  if (
    b.additionalInstructions !== undefined &&
    typeof b.additionalInstructions !== "string"
  ) {
    return {
      valid: false,
      error: "additionalInstructions must be a string if provided",
    };
  }

  return {
    valid: true,
    data: {
      topic: (b.topic as string).trim(),
      outputType: b.outputType as OutputType,
      citationFormat: b.citationFormat as CitationFormat,
      educationLevel: b.educationLevel as EducationLevel,
      wordCount: b.wordCount as number,
      additionalInstructions: b.additionalInstructions as string | undefined,
    },
  };
}

// ─── POST /api/generate ──────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const { auth, db } = getAdminApp();

  // ── 1. Verify Authentication ────────────────────────────────────────
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
    console.error("[POST /api/generate] Auth verification failed:", authError);
    return NextResponse.json(
      { error: "Invalid or expired authentication token", code: 401 },
      { status: 401 }
    );
  }

  // ── 2. Rate Limiting (B3.2) ─────────────────────────────────────────
  if (!checkRateLimit(uid)) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Maximum 3 requests per minute. Please wait and try again.",
        code: 429,
      },
      { status: 429 }
    );
  }

  // ── 3. Validate Request Body ────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body", code: 400 },
      { status: 400 }
    );
  }

  const validation = validateRequest(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.error!, code: 400 },
      { status: 400 }
    );
  }

  const generateRequest = validation.data;

  // ── 4. Check Usage ──────────────────────────────────────────────────
  const userRef = db.collection("users").doc(uid);
  let userProfile: UserProfile;

  try {
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json(
        { error: "User profile not found. Please sign up first.", code: 404 },
        { status: 404 }
      );
    }
    userProfile = userSnap.data() as UserProfile;
  } catch (firestoreError) {
    console.error("[POST /api/generate] Firestore read error:", firestoreError);
    return NextResponse.json(
      { error: "Failed to read user profile", code: 500 },
      { status: 500 }
    );
  }

  // Free plan users: check remaining uses
  if (userProfile.plan === "free" && userProfile.freeUsesRemaining <= 0) {
    return NextResponse.json(
      { error: "Free limit reached. Upgrade to Pro.", code: 403 },
      { status: 403 }
    );
  }

  // ── 5. Call Gemini via lib/gemini.ts ─────────────────────────────────
  let generatedResponse: GenerateResponse;

  try {
    generatedResponse = await generateContent(generateRequest);
  } catch (geminiError) {
    console.error("[POST /api/generate] Gemini API error:", geminiError);

    const message =
      geminiError instanceof Error
        ? geminiError.message
        : "AI generation failed unexpectedly";

    // Determine appropriate status code from the error message
    let statusCode = 500;
    if (message.includes("safety filters") || message.includes("SAFETY")) {
      statusCode = 422;
    } else if (message.includes("rate limit") || message.includes("QUOTA")) {
      statusCode = 503;
    } else if (message.includes("spending cap")) {
      statusCode = 503;
    }

    return NextResponse.json(
      { error: message, code: statusCode },
      { status: statusCode }
    );
  }

  // ── 6. Update Usage Counts ──────────────────────────────────────────
  try {
    const updateData: Record<string, unknown> = {
      totalGenerated: FieldValue.increment(1),
    };

    // Only decrement free uses for free-plan users
    if (userProfile.plan === "free") {
      updateData.freeUsesRemaining = FieldValue.increment(-1);
    }

    await userRef.update(updateData);
  } catch (usageError) {
    // Log but don't fail the request — the user already got their content
    console.error("[POST /api/generate] Failed to update usage counts:", usageError);
  }

  // ── 7. Save to History ──────────────────────────────────────────────
  try {
    const historyRef = userRef.collection("history").doc();
    const historyItem: HistoryItem = {
      id: historyRef.id,
      userId: uid,
      request: generateRequest,
      response: generatedResponse,
      createdAt: new Date().toISOString(),
    };

    await historyRef.set(historyItem);
  } catch (historyError) {
    // Log but don't fail — the content was already generated
    console.error("[POST /api/generate] Failed to save to history:", historyError);
  }

  // ── 8. Return Response ──────────────────────────────────────────────
  return NextResponse.json(generatedResponse, { status: 200 });
}
