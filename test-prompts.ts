// ============================================
// ScholarAI Local Prompt Test Script
// Owner: AI Integration Specialist (A)
// ============================================
// DEVELOPMENT ONLY — does not ship to production.
// Run with: npx tsx test-prompts.ts
// ============================================

// Load .env.local (tsx doesn't load it automatically like Next.js)
import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex);
    const value = trimmed.substring(eqIndex + 1);
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  console.log(`✅ Loaded .env.local (GEMINI_API_KEY=${process.env.GEMINI_API_KEY ? "set" : "MISSING"})`);
} catch {
  console.warn("⚠️  Could not load .env.local — ensure env vars are set manually.");
}

import { generateContent } from "@/lib/gemini";
import type { GenerateRequest, GenerateResponse, OutputType, CitationFormat, EducationLevel } from "@/types";

// ─── Blocked domain check ────────────────────────────────────────────

const BLOCKED_DOMAINS = [
  "reddit.com", "quora.com", "answers.yahoo.com",
  "medium.com", "substack.com",
  "twitter.com", "x.com", "tiktok.com",
  "instagram.com", "facebook.com",
  "pinterest.com", "tumblr.com",
  "en.wikipedia.org",
];

function checkNoBlockedSources(response: GenerateResponse): boolean {
  for (const source of response.sources) {
    for (const blocked of BLOCKED_DOMAINS) {
      if (source.domain.includes(blocked)) {
        console.error(`  ❌ BLOCKED domain found in sources: ${source.domain} (${source.url})`);
        return false;
      }
    }
  }
  return true;
}

function checkDisclaimer(response: GenerateResponse): boolean {
  return response.content.includes("AI-generated content");
}

function checkSourcesAreRealURLs(response: GenerateResponse): boolean {
  for (const source of response.sources) {
    try {
      new URL(source.url);
    } catch {
      console.error(`  ❌ Invalid URL in sources: ${source.url}`);
      return false;
    }
  }
  return true;
}

function checkCitationFormat(response: GenerateResponse): boolean {
  // Basic check: the response mentions the citation format or contains
  // expected section headers
  const format = response.citationFormat;
  if (format === "mla") {
    return response.content.includes("Works Cited") || response.content.includes("MLA");
  }
  if (format === "apa") {
    return response.content.includes("References") || response.content.includes("APA");
  }
  if (format === "chicago") {
    return response.content.includes("Bibliography") || response.content.includes("References") || response.content.includes("Chicago");
  }
  return true;
}

// ─── Test Cases ──────────────────────────────────────────────────────

interface TestCase {
  name: string;
  request: GenerateRequest;
}

const TEST_CASES: TestCase[] = [
  // Essay tests
  {
    name: "Essay / MLA / Undergraduate",
    request: {
      topic: "The impact of artificial intelligence on higher education",
      outputType: "essay",
      citationFormat: "mla",
      educationLevel: "undergraduate",
      wordCount: 1000,
    },
  },
  {
    name: "Essay / APA / Graduate",
    request: {
      topic: "Climate change effects on global food security",
      outputType: "essay",
      citationFormat: "apa",
      educationLevel: "graduate",
      wordCount: 1500,
    },
  },
  {
    name: "Essay / Chicago / High School",
    request: {
      topic: "The causes and effects of the American Civil War",
      outputType: "essay",
      citationFormat: "chicago",
      educationLevel: "high_school",
      wordCount: 800,
    },
  },

  // Outline tests
  {
    name: "Outline / MLA / Graduate",
    request: {
      topic: "Quantum computing applications in cryptography",
      outputType: "outline",
      citationFormat: "mla",
      educationLevel: "graduate",
      wordCount: 500,
    },
  },
  {
    name: "Outline / APA / High School",
    request: {
      topic: "The effects of social media on teen mental health",
      outputType: "outline",
      citationFormat: "apa",
      educationLevel: "high_school",
      wordCount: 400,
    },
  },

  // Research summary tests
  {
    name: "Research Summary / Chicago / Undergraduate",
    request: {
      topic: "CRISPR gene editing: ethical implications and current applications",
      outputType: "research_summary",
      citationFormat: "chicago",
      educationLevel: "undergraduate",
      wordCount: 1200,
    },
  },
  {
    name: "Research Summary / APA / Graduate",
    request: {
      topic: "The effectiveness of cognitive behavioral therapy for anxiety disorders",
      outputType: "research_summary",
      citationFormat: "apa",
      educationLevel: "graduate",
      wordCount: 1500,
    },
  },

  // Edge cases
  {
    name: "Edge Case: Niche Topic",
    request: {
      topic: "The role of mycorrhizal networks in old-growth forest ecosystems",
      outputType: "essay",
      citationFormat: "apa",
      educationLevel: "graduate",
      wordCount: 1000,
    },
  },
  {
    name: "Edge Case: Controversial Topic",
    request: {
      topic: "The debate over universal basic income: economic and social perspectives",
      outputType: "research_summary",
      citationFormat: "mla",
      educationLevel: "undergraduate",
      wordCount: 1000,
    },
  },
  {
    name: "Edge Case: With Additional Instructions",
    request: {
      topic: "Renewable energy adoption in developing nations",
      outputType: "essay",
      citationFormat: "apa",
      educationLevel: "undergraduate",
      wordCount: 1200,
      additionalInstructions:
        "Focus specifically on solar and wind energy. Include at least one case study from Sub-Saharan Africa.",
    },
  },
];

// ─── Runner ──────────────────────────────────────────────────────────

async function runTest(testCase: TestCase, index: number): Promise<boolean> {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log(`${"═".repeat(60)}`);
  console.log(
    `  Topic: ${testCase.request.topic.substring(0, 60)}...`
  );
  console.log(`  Type: ${testCase.request.outputType}`);
  console.log(`  Format: ${testCase.request.citationFormat}`);
  console.log(`  Level: ${testCase.request.educationLevel}`);
  console.log(`  Words: ${testCase.request.wordCount}`);
  if (testCase.request.additionalInstructions) {
    console.log(`  Extra: ${testCase.request.additionalInstructions.substring(0, 50)}...`);
  }
  console.log();

  try {
    const startTime = Date.now();
    const response = await generateContent(testCase.request);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`  ⏱️  Generation took ${elapsed}s`);
    console.log(`  📝 Content length: ${response.content.length} chars`);
    console.log(`  🔗 Sources returned: ${response.sources.length}`);

    // Run checks
    let allPassed = true;

    const disclaimerOk = checkDisclaimer(response);
    console.log(`  ${disclaimerOk ? "✅" : "❌"} Disclaimer present`);
    allPassed &&= disclaimerOk;

    const blockedOk = checkNoBlockedSources(response);
    console.log(`  ${blockedOk ? "✅" : "❌"} No blocked domains in sources`);
    allPassed &&= blockedOk;

    const urlsOk = checkSourcesAreRealURLs(response);
    console.log(`  ${urlsOk ? "✅" : "❌"} All source URLs are valid`);
    allPassed &&= urlsOk;

    const citationOk = checkCitationFormat(response);
    console.log(`  ${citationOk ? "✅" : "❌"} Citation format matches requested style`);
    allPassed &&= citationOk;

    // Log source domains
    if (response.sources.length > 0) {
      console.log(`  📚 Source domains:`);
      for (const source of response.sources.slice(0, 5)) {
        console.log(`     - ${source.domain}: ${source.title?.substring(0, 50) || "N/A"}`);
      }
      if (response.sources.length > 5) {
        console.log(`     ... and ${response.sources.length - 5} more`);
      }
    }

    // Print first 300 chars of output
    console.log(`\n  📄 Output preview:\n${"-".repeat(40)}`);
    console.log(`  ${response.content.substring(0, 300).replace(/\n/g, "\n  ")}...`);

    console.log(`\n  ${allPassed ? "✅ PASSED" : "❌ FAILED"}`);
    return allPassed;
  } catch (error) {
    console.error(`  ❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║          ScholarAI Prompt Testing Suite                 ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\nRunning ${TEST_CASES.length} test cases...\n`);

  // Select a subset of tests to run (default: first 3 for quick testing)
  // Pass "all" as first CLI arg to run all tests
  const runAll = process.argv.includes("--all");
  const casesToRun = runAll ? TEST_CASES : TEST_CASES.slice(0, 3);

  if (!runAll) {
    console.log(
      `⚡ Quick mode: running ${casesToRun.length} / ${TEST_CASES.length} tests. Use --all for full suite.\n`
    );
  }

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < casesToRun.length; i++) {
    const ok = await runTest(casesToRun[i], i);
    if (ok) passed++;
    else failed++;

    // Brief pause between requests to avoid rate limiting
    if (i < casesToRun.length - 1) {
      console.log("\n  ⏳ Waiting 2s before next test...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${casesToRun.length}`);
  console.log(`${"═".repeat(60)}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
