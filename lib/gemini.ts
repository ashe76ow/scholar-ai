// ============================================
// ScholarAI Core AI Engine
// Owner: AI Integration Specialist (A)
// ============================================
// Exports ONE function: generateContent()
// The Backend imports this and calls it.
// This file handles all Gemini API interaction,
// source validation, and citation formatting.
// ============================================
// SDK: @google/genai (new unified SDK)
// Model: gemini-3-flash-preview
// Grounding: Google Search
// ============================================

import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import type { GenerateRequest, GenerateResponse, Source } from "@/types";
import {
  MASTER_SYSTEM_PROMPT,
  EDUCATION_LEVEL_CONTEXTS,
  OUTPUT_TYPE_PROMPTS,
  DISCLAIMER,
} from "@/prompts/system-prompts";

// ─── Gemini Client ───────────────────────────────────────────────────
// The new SDK auto-reads GEMINI_API_KEY from env, but we pass it
// explicitly to ensure clarity and fail-fast if missing.

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "[ScholarAI] GEMINI_API_KEY is not set. Cannot call Gemini API."
    );
  }
  return new GoogleGenAI({ apiKey });
}

const MODEL_ID = "gemini-3-flash-preview";

// ─── Blocked Domains ─────────────────────────────────────────────────
// Sources from these domains are silently filtered out of every response.

const BLOCKED_DOMAINS = [
  "reddit.com",
  "quora.com",
  "answers.yahoo.com",
  "medium.com",
  "substack.com",
  "twitter.com",
  "x.com",
  "tiktok.com",
  "instagram.com",
  "facebook.com",
  "pinterest.com",
  "tumblr.com",
  "en.wikipedia.org",
];

// ─── Source Validation ───────────────────────────────────────────────

function validateSources(sources: Source[]): Source[] {
  return sources.filter((source) => {
    const blocked = BLOCKED_DOMAINS.some((domain) =>
      source.domain.includes(domain)
    );
    if (blocked) {
      console.warn(`[ScholarAI] Filtered blocked source: ${source.url}`);
    }
    return !blocked;
  });
}

// ─── Domain Extraction ───────────────────────────────────────────────

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// ─── Citation Formatters ─────────────────────────────────────────────
// Format a Source into a properly styled citation string.

export function formatMLA(source: Source): string {
  const author = source.author || "Unknown Author";
  const title = `"${source.title}."`;
  const domain = source.domain;
  const date = source.publishedDate
    ? new Date(source.publishedDate).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "n.d.";
  const url = source.url;

  return `${author}. ${title} *${domain}*, ${date}. ${url}.`;
}

export function formatAPA(source: Source): string {
  const author = source.author || "Unknown Author";
  const date = source.publishedDate
    ? `(${new Date(source.publishedDate).getFullYear()})`
    : "(n.d.)";
  const title = source.title;
  const url = source.url;

  return `${author} ${date}. ${title}. Retrieved from ${url}`;
}

export function formatChicago(source: Source): string {
  const author = source.author || "Unknown Author";
  const title = `"${source.title}."`;
  const domain = source.domain;
  const date = source.publishedDate
    ? new Date(source.publishedDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "n.d.";
  const url = source.url;

  return `${author}. ${title} ${domain}. ${date}. ${url}.`;
}

const CITATION_FORMATTERS: Record<string, (source: Source) => string> = {
  mla: formatMLA,
  apa: formatAPA,
  chicago: formatChicago,
};

// ─── Prompt Builder ──────────────────────────────────────────────────

function buildPrompt(request: GenerateRequest): string {
  // 1. Master system prompt
  let prompt = MASTER_SYSTEM_PROMPT;

  // 2. Education level context
  prompt += `\n\n=== EDUCATION LEVEL ===\n${EDUCATION_LEVEL_CONTEXTS[request.educationLevel]}`;

  // 3. Output type prompt (with template replacements)
  const outputPrompt = OUTPUT_TYPE_PROMPTS[request.outputType]
    .replace(/{wordCount}/g, String(request.wordCount))
    .replace(/{citationFormat}/g, request.citationFormat.toUpperCase());

  prompt += `\n\n=== OUTPUT INSTRUCTIONS ===\n${outputPrompt}`;

  // 4. User topic
  prompt += `\n\nTOPIC: ${request.topic}`;

  // 5. Additional instructions (if provided)
  if (request.additionalInstructions) {
    prompt += `\n\nADDITIONAL INSTRUCTIONS: ${request.additionalInstructions}`;
  }

  return prompt;
}

// ─── Main Export ─────────────────────────────────────────────────────

export async function generateContent(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const ai = getClient();
  const fullPrompt = buildPrompt(request);

  try {
    // Call Gemini with Google Search grounding and medium thinking
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: fullPrompt,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 8192,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MEDIUM,
        },
        tools: [{ googleSearch: {} }],
      },
    });

    // ── Extract text ───────────────────────────────────────────────
    let content = response.text ?? "";

    if (!content) {
      throw new Error(
        "[ScholarAI] Gemini returned an empty response. The topic may have been blocked by safety filters."
      );
    }

    // ── Extract grounding sources ──────────────────────────────────
    const sources: Source[] = [];
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          const url = chunk.web.uri;
          const domain = chunk.web.domain || extractDomain(url);

          sources.push({
            title: chunk.web.title || "Untitled Source",
            url,
            domain,
          });
        }
      }
    }

    // ── Validate sources (filter blocked domains) ──────────────────
    const validatedSources = validateSources(sources);

    // ── Ensure disclaimer is present ───────────────────────────────
    if (!content.includes("AI-generated content")) {
      content += `\n\n${DISCLAIMER}`;
    }

    // ── Build formatted bibliography if sources available ──────────
    if (validatedSources.length > 0) {
      const formatter = CITATION_FORMATTERS[request.citationFormat];
      if (
        formatter &&
        !content.includes("Works Cited") &&
        !content.includes("References")
      ) {
        const bibliography = validatedSources
          .map((source) => formatter(source))
          .join("\n\n");

        const sectionTitle =
          request.citationFormat === "mla" ? "Works Cited" : "References";

        content += `\n\n## ${sectionTitle}\n\n${bibliography}`;
      }
    }

    return {
      content,
      sources: validatedSources,
      outputType: request.outputType,
      citationFormat: request.citationFormat,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    // Re-throw our own errors
    if (error instanceof Error && error.message.startsWith("[ScholarAI]")) {
      throw error;
    }

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes("SAFETY")) {
        throw new Error(
          "[ScholarAI] Content was blocked by safety filters. Please rephrase your topic and try again."
        );
      }
      if (error.message.includes("spending cap")) {
        throw new Error(
          "[ScholarAI] The Google Cloud project has exceeded its spending cap. Please increase the cap in Google Cloud Console → Billing."
        );
      }
      if (error.message.includes("QUOTA") || error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED")) {
        throw new Error(
          "[ScholarAI] API rate limit reached. Please try again in a moment."
        );
      }
      throw new Error(`[ScholarAI] AI generation failed: ${error.message}`);
    }

    throw new Error(
      "[ScholarAI] An unexpected error occurred during generation."
    );
  }
}
