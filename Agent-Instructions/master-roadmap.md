# ScholarAI — Master Build Roadmap

## Project Summary
**App Name:** ScholarAI
**Purpose:** AI-powered research & essay writing tool for HS and college students
**AI Model:** Gemini 3 Flash (`gemini-3-flash-preview`) with Google Search grounding
**Hosting:** Vercel
**Auth + DB:** Firebase (Auth + Firestore)
**Payments:** Stripe
**Design System:** "Digital Architect" editorial dark theme (see DESIGN.md)
**IDE:** Google Antigravity with Firebase, GitHub, and Stripe MCP servers

---

## The 4 Agents

| Agent | Code | Role | Scope |
|-------|------|------|-------|
| **Frontend Designer** | **F** | Owns the design system, all UI components, pages, layouts, and client-side interactivity | Everything the user sees and touches |
| **Backend Engineer** | **B** | Owns API routes, database schemas, server-side logic, auth flows, and payment processing | Everything that runs on the server |
| **AI Integration Specialist** | **A** | Owns the Gemini API integration, system prompts, grounding config, prompt templates, and output parsing | Everything related to the AI model |
| **Deployment & DevOps** | **D** | Owns project scaffolding, environment config, GitHub repo, Vercel deployment, CI/CD, and cross-agent integration | Everything that ships the app to production |

---

## Critical Rule: Agent Boundaries

Each agent works in designated files only. If a task touches another agent's territory, the roadmap explicitly calls it out as a **handoff**.

### File Ownership Map

```
scholar-ai/
├── app/
│   ├── layout.tsx                    ← F (Frontend)
│   ├── page.tsx                      ← F (Landing page)
│   ├── login/page.tsx                ← F (UI) + B (auth logic)
│   ├── signup/page.tsx               ← F (UI) + B (auth logic)
│   ├── dashboard/page.tsx            ← F (UI)
│   ├── history/page.tsx              ← F (UI)
│   ├── pricing/page.tsx              ← F (UI)
│   └── api/
│       ├── generate/route.ts         ← B (route) + A (prompt logic)
│       ├── auth/route.ts             ← B
│       ├── usage/route.ts            ← B
│       └── stripe/
│           ├── checkout/route.ts     ← B
│           └── webhook/route.ts      ← B
├── components/                       ← F (all components)
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── TopicForm.tsx
│   ├── OutputDisplay.tsx
│   ├── UsageCounter.tsx
│   ├── PricingCard.tsx
│   ├── HistoryList.tsx
│   └── AuthForm.tsx
├── lib/
│   ├── firebase.ts                   ← B
│   ├── gemini.ts                     ← A
│   ├── stripe.ts                     ← B
│   ├── auth-context.tsx              ← B
│   └── usage.ts                      ← B
├── prompts/
│   └── system-prompts.ts             ← A (owns entirely)
├── styles/
│   └── globals.css                   ← F (owns entirely)
├── types/
│   └── index.ts                      ← D (shared types all agents use)
├── .env.local                        ← D
├── .gitignore                        ← D
├── next.config.ts                    ← D
├── tailwind.config.ts                ← F + D
├── package.json                      ← D
└── vercel.json                       ← D
```

---

## Shared Contract: Types (Created by D in Phase 0)

All agents reference these shared types so their code connects cleanly. The Deployment agent creates this file first, and no other agent modifies it without consensus.

```typescript
// types/index.ts

export type OutputType = "essay" | "outline" | "research_summary";
export type CitationFormat = "mla" | "apa" | "chicago";
export type EducationLevel = "high_school" | "undergraduate" | "graduate";
export type UserPlan = "free" | "pro";

export interface GenerateRequest {
  topic: string;
  outputType: OutputType;
  citationFormat: CitationFormat;
  educationLevel: EducationLevel;
  wordCount: number;
  additionalInstructions?: string;
}

export interface GenerateResponse {
  content: string;
  sources: Source[];
  outputType: OutputType;
  citationFormat: CitationFormat;
  timestamp: string;
}

export interface Source {
  title: string;
  url: string;
  author?: string;
  publishedDate?: string;
  domain: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  plan: UserPlan;
  freeUsesRemaining: number;
  totalGenerated: number;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  userId: string;
  request: GenerateRequest;
  response: GenerateResponse;
  createdAt: string;
}
```

---

## Build Phases

Each phase must be fully complete and tested before the next phase begins. Within each phase, agents work in the order listed (to respect dependencies).

---

### PHASE 0: Project Scaffolding
**Owner: D (Deployment)**
**Dependencies: None**

| Step | Task | Details |
|------|------|---------|
| D0.1 | Create Next.js project | `npx create-next-app@latest scholar-ai --typescript --tailwind --app --src-dir=false` |
| D0.2 | Initialize GitHub repo | Use GitHub MCP to create repo `scholar-ai`, push initial code |
| D0.3 | Create folder structure | Create all folders from the file ownership map above (empty placeholder files are fine) |
| D0.4 | Create `types/index.ts` | Paste the shared types contract above — this is the source of truth for all agents |
| D0.5 | Create `.env.local` template | Add all env var placeholders (see Environment Variables section below) |
| D0.6 | Create `.gitignore` | Ensure `.env.local` and `node_modules` are excluded |
| D0.7 | Install shared dependencies | `npm install firebase @google/generative-ai stripe @stripe/stripe-js` |
| D0.8 | Configure Tailwind for design system | Set up `tailwind.config.ts` with the color tokens from DESIGN.md (surface, primary, etc.) |
| D0.9 | Deploy skeleton to Vercel | Connect GitHub repo to Vercel, verify blank site is live |

**Phase 0 Deliverable:** A deployed skeleton app on Vercel with all folders, shared types, and dependencies installed. Every agent can now start working in their designated files without conflicts.

---

### PHASE 1: Design System & Landing Page
**Owner: F (Frontend)**
**Dependencies: Phase 0 complete**

| Step | Task | Details |
|------|------|---------|
| F1.1 | Implement `globals.css` | Define all CSS custom properties from DESIGN.md: surface colors, primary/accent, typography scale, ghost borders, bloom effects, glassmorphism utilities |
| F1.2 | Import Manrope font | Add via `next/font/google` in `layout.tsx`, set as default |
| F1.3 | Build `layout.tsx` | App shell with the Navbar and Footer. True black (#000000) base background. No 1px borders anywhere — use tonal shifts only |
| F1.4 | Build `Navbar.tsx` | Logo "SCHOLAR AI" in display style with tight tracking (-0.02em). Nav links: Features, Pricing, Login, Sign Up CTA with gradient fill (primary → primary_container at 135°) |
| F1.5 | Build `Footer.tsx` | Minimal footer with links, matching the Stitch reference aesthetic (see screenshot) |
| F1.6 | Build Landing Page (`page.tsx`) | **Hero:** Asymmetric layout. Left side: `display-lg` headline ("RESEARCH WITH PRECISION" or similar), subtext in `body-lg` at lower opacity. Right side: visual/mockup. Two CTAs: "Start Researching" (gradient primary) and "View Pricing" (ghost/secondary). **Features section:** 3 feature cards using tonal layering (surface_container_low cards on surface background). No borders, use 32-48px spacing between items. **Testimonial/social proof section.** **CTA section** at bottom with large headline. |
| F1.7 | Add hover states & interactions | Buttons: 4px vertical lift + brightness increase. Cards: background transition to surface_container_high. Primary elements: "Obsidian Bloom" glow effect (primary outer shadow, 2px spread, 15px blur, 0.3 opacity) |
| F1.8 | Mobile responsiveness | Ensure all sections stack cleanly on mobile. Test at 375px, 768px, 1024px, 1440px |

**Phase 1 Deliverable:** A fully styled, responsive landing page that matches the "Digital Architect" design system and Stitch reference. No backend functionality yet — links to Login/Signup/Dashboard can be dead links.

**HANDOFF → D:** After F1.8, Deployment agent redeploys to Vercel to verify the landing page looks correct in production.

---

### PHASE 2: Authentication
**Agents: B (Backend) then F (Frontend)**
**Dependencies: Phase 1 complete**

#### Backend First (B)

| Step | Task | Details |
|------|------|---------|
| B2.1 | Create Firebase project | Use Firebase MCP. Enable Authentication (Email/Password + Google sign-in). Enable Firestore. |
| B2.2 | Add Firebase env vars | Add all Firebase config values to `.env.local` |
| B2.3 | Create `lib/firebase.ts` | Initialize Firebase app, export `auth` and `db` instances. Use `NEXT_PUBLIC_` env vars for client-side config |
| B2.4 | Create `lib/auth-context.tsx` | React context provider that wraps the app, tracks auth state (`user`, `loading`, `signIn`, `signUp`, `signOut`). Uses Firebase `onAuthStateChanged` listener |
| B2.5 | Create `app/api/auth/route.ts` | POST endpoint that creates a user profile document in Firestore when a new user signs up. Sets `freeUsesRemaining: 5`, `plan: "free"`, `totalGenerated: 0` |
| B2.6 | Set Firestore security rules | Users can only read/write their own document. History subcollection scoped to owning user |

#### Frontend Second (F)

| Step | Task | Details |
|------|------|---------|
| F2.1 | Build `AuthForm.tsx` | Reusable component for both login and signup. "Sunken" input fields (surface_container_lowest background). Focus state: primary underline with bloom glow. Labels: label-md with 0.1em tracking, uppercase. Google sign-in button (ghost style) |
| F2.2 | Build `login/page.tsx` | Uses AuthForm in "login" mode. Redirect to /dashboard on success |
| F2.3 | Build `signup/page.tsx` | Uses AuthForm in "signup" mode. Calls B2.5 API to create user profile, then redirects to /dashboard |
| F2.4 | Add auth protection to layout | Wrap `/dashboard` and `/history` routes so they redirect to `/login` if user isn't authenticated |
| F2.5 | Update Navbar | Show "Dashboard" link + user avatar/email when logged in. Show "Login / Sign Up" when logged out |

**Phase 2 Deliverable:** Users can sign up, log in, log out, and see their auth state in the navbar. A Firestore document is created for each new user. Unauthenticated users are redirected away from protected routes.

**HANDOFF → D:** Redeploy. Verify auth flow works in production (Firebase needs authorized domains configured for the Vercel URL).

---

### PHASE 3: AI Integration (The Core Engine)
**Agents: A (AI Specialist) then B (Backend) then F (Frontend)**
**Dependencies: Phase 2 complete**

#### AI Specialist First (A)

| Step | Task | Details |
|------|------|---------|
| A3.1 | Create `prompts/system-prompts.ts` | Write the master system prompt with all guardrails (see AI Guardrails section below). Export as named constants: `MASTER_SYSTEM_PROMPT`, `ESSAY_PROMPT`, `OUTLINE_PROMPT`, `RESEARCH_SUMMARY_PROMPT` |
| A3.2 | Create `lib/gemini.ts` | Initialize Gemini client with `@google/generative-ai`. Configure the model (`gemini-3-flash-preview`). Export a `generateContent` function that: (1) accepts a `GenerateRequest`, (2) selects the right prompt template, (3) builds the full prompt (system + template + user input), (4) calls Gemini with `tools: [{ googleSearch: {} }]` for grounding, (5) parses the response, (6) extracts source URLs from grounding metadata, (7) returns a `GenerateResponse` |
| A3.3 | Create source validation logic | Inside `lib/gemini.ts`, add a `validateSources` function that checks extracted URLs against blocked domains (reddit.com, medium.com, quora.com, twitter.com, x.com, tiktok.com, facebook.com, instagram.com). Filter out any that match. Log warnings for filtered sources |
| A3.4 | Create citation formatter | Inside `lib/gemini.ts`, add functions to format source metadata into MLA, APA, or Chicago citation strings. These get appended to the AI output as a Works Cited / References section |
| A3.5 | Test prompts locally | Use a simple Node script to call Gemini with each prompt template and verify: (a) output matches expected format, (b) sources are real and accessible, (c) citations are properly formatted, (d) blocked sources are filtered |

#### Backend Second (B)

| Step | Task | Details |
|------|------|---------|
| B3.1 | Create `app/api/generate/route.ts` | POST endpoint that: (1) verifies user is authenticated, (2) checks user has remaining uses (reads Firestore), (3) calls `generateContent` from A3.2, (4) decrements `freeUsesRemaining` in Firestore, (5) increments `totalGenerated`, (6) saves the request + response to user's history subcollection, (7) returns the `GenerateResponse` |
| B3.2 | Add rate limiting | Basic rate limiting: max 3 requests per minute per user. Store timestamps in memory or Firestore |
| B3.3 | Add error handling | Handle Gemini API errors gracefully (rate limits, content filtering, timeouts). Return user-friendly error messages |

#### Frontend Third (F)

| Step | Task | Details |
|------|------|---------|
| F3.1 | Build `TopicForm.tsx` | The main input form with: **Topic textarea** (sunken style, surface_container_lowest). **Output type selector** (Essay / Outline / Research Summary) — styled as tonal toggle buttons, not a dropdown. **Education level selector** (High School / Undergraduate / Graduate) — same toggle style. **Citation format selector** (MLA / APA / Chicago). **Word count** input (slider or number input, range 500-5000). **Additional instructions** optional textarea. **"Generate" button** (gradient primary, full width, with bloom on hover). Loading state: button shows spinner + "Researching..." text |
| F3.2 | Build `OutputDisplay.tsx` | Displays the AI response with: Proper heading hierarchy. In-text citations highlighted in primary color. Works Cited / References section at the bottom. **Action bar:** "Copy to Clipboard" button, "Download as .docx" button (stretch goal), "Regenerate" button. Smooth fade-in animation on content arrival |
| F3.3 | Build `UsageCounter.tsx` | Shows "X of 5 free generations remaining" for free users. Shows "Unlimited" badge for pro users. When uses hit 0, the Generate button is replaced with "Upgrade to Pro" CTA |
| F3.4 | Build `dashboard/page.tsx` | Combines TopicForm, OutputDisplay, and UsageCounter. Two-column layout on desktop (form left, output right). Single column on mobile (form top, output below). Uses tonal layering: form area on surface_container_low, output area on surface |
| F3.5 | Wire up the form to API | On form submit, POST to `/api/generate` with the `GenerateRequest` payload. Handle loading, success, and error states. Display the response in OutputDisplay |

**Phase 3 Deliverable:** The core product works end-to-end. Users can enter a topic, select options, click Generate, and receive an AI-written essay/outline/summary with real citations from the web. Usage is tracked and limited for free users.

**HANDOFF → D:** Redeploy. Test the full generation flow in production. Verify Gemini API key works in Vercel environment.

---

### PHASE 4: History
**Agents: B (Backend) then F (Frontend)**
**Dependencies: Phase 3 complete**

#### Backend (B)

| Step | Task | Details |
|------|------|---------|
| B4.1 | Create `app/api/history/route.ts` | GET endpoint that fetches the user's history from Firestore, ordered by `createdAt` descending. Supports pagination (limit 20 per page) |

#### Frontend (F)

| Step | Task | Details |
|------|------|---------|
| F4.1 | Build `HistoryList.tsx` | List of past generations. Each item shows: topic (truncated), output type badge, citation format, date, word count. No divider lines — use 32px vertical spacing per DESIGN.md. On hover: background shifts to surface_container_high |
| F4.2 | Build `history/page.tsx` | Full page listing history items. Click an item → expand to show full output (or navigate to a detail view). "Load more" button for pagination. Empty state: "No research yet. Start your first one!" with CTA to dashboard |
| F4.3 | Add "View in History" link | After generating content on the dashboard, show a subtle link: "Saved to history →" |

**Phase 4 Deliverable:** Users can view all their past generations, click to re-read them, and see metadata about each one.

**HANDOFF → D:** Redeploy and verify.

---

### PHASE 5: Payments
**Agents: B (Backend) then F (Frontend)**
**Dependencies: Phase 4 complete**

#### Backend (B)

| Step | Task | Details |
|------|------|---------|
| B5.1 | Create Stripe product | Use Stripe MCP (or Stripe Dashboard). Create a product "ScholarAI Pro" with a recurring price (e.g., $9.99/month). Record the price ID |
| B5.2 | Create `lib/stripe.ts` | Initialize Stripe with secret key. Export helper functions |
| B5.3 | Create `app/api/stripe/checkout/route.ts` | POST endpoint that creates a Stripe Checkout Session. Includes the user's Firebase UID in metadata. Redirects to Stripe's hosted checkout page. Success URL → `/dashboard?upgraded=true`. Cancel URL → `/pricing` |
| B5.4 | Create `app/api/stripe/webhook/route.ts` | Handles Stripe webhook events. On `checkout.session.completed`: read the Firebase UID from metadata, update the user's Firestore document to `plan: "pro"`, set `freeUsesRemaining: -1` (unlimited flag). On `customer.subscription.deleted`: revert to free plan |
| B5.5 | Update usage logic | Modify the generate endpoint (B3.1) to skip usage decrement for pro users |

#### Frontend (F)

| Step | Task | Details |
|------|------|---------|
| F5.1 | Build `PricingCard.tsx` | Two cards side by side: **Free** (5 generations/month, all output types, all citation formats) and **Pro** ($9.99/month — unlimited generations, priority speed, full history). Free card: surface_container_low background. Pro card: subtle gradient border using primary colors. Both cards: 0.5rem border radius, no hard borders |
| F5.2 | Build `pricing/page.tsx` | Hero: "Choose Your Plan" in display-md. Two PricingCards centered. FAQ section below (accordion style, no borders — tonal separation only) |
| F5.3 | Wire checkout button | Pro card's CTA calls `/api/stripe/checkout`. Redirects user to Stripe. On return with `?upgraded=true`, show a success toast/banner |
| F5.4 | Update UsageCounter | When plan is "pro", show an "Unlimited" badge styled with primary color instead of the counter |

**Phase 5 Deliverable:** Users can upgrade to Pro via Stripe Checkout. Their plan is updated in Firestore, and usage limits are removed. Downgrade handling works via webhook.

**HANDOFF → D:** Redeploy. Configure Stripe webhook endpoint in Stripe Dashboard pointing to the production Vercel URL. Test with Stripe test mode.

---

### PHASE 6: Polish & Launch Prep
**Agents: All**
**Dependencies: Phase 5 complete**

| Step | Agent | Task | Details |
|------|-------|------|---------|
| F6.1 | F | Loading & error states | Add skeleton loaders for dashboard and history. Add toast notifications for errors. Add empty states for all pages |
| F6.2 | F | Animations | Page transitions (subtle fade-in). Staggered content reveal on landing page. Smooth output streaming appearance |
| F6.3 | F | SEO & metadata | Add proper `<title>`, `<meta description>`, and Open Graph tags to all pages via Next.js metadata API |
| B6.1 | B | Security audit | Verify all Firestore rules are locked down. Verify API routes check auth. Verify Stripe webhook validates signatures. Ensure no API keys are exposed client-side |
| B6.2 | B | Error logging | Add basic error logging to all API routes (console.error with context). Consider adding Sentry later |
| A6.1 | A | Prompt tuning | Run 10+ test generations across all output types, education levels, and citation formats. Refine prompts based on output quality. Add edge case handling (very niche topics, controversial topics, topics with limited sources) |
| A6.2 | A | Add disclaimer | Add a static disclaimer to every output: "AI-generated content. Always verify sources before submitting academic work." |
| D6.1 | D | Final deployment | Verify all env vars are set in Vercel. Switch Stripe to live mode (when ready). Run full end-to-end test in production. Verify custom domain (if applicable) |
| D6.2 | D | Performance check | Run Lighthouse audit. Ensure landing page loads in < 3 seconds. Verify no console errors |

**Phase 6 Deliverable:** A polished, production-ready app that's ready for real users.

---

## AI Guardrails (Full Prompt — Owned by Agent A)

```
MASTER SYSTEM PROMPT:

You are ScholarAI, an academic research assistant for students. You produce
well-researched, properly cited academic content. Follow these rules strictly:

=== RESEARCH RULES ===
1. ONLY use information from reliable, authoritative sources:
   - Academic journals and publications (.edu domains)
   - Government sources (.gov domains)
   - Established news organizations (AP, Reuters, NYT, Washington Post, BBC, NPR, etc.)
   - Published books and textbooks
   - Reputable encyclopedias (Britannica, Stanford Encyclopedia of Philosophy)
   - Peer-reviewed scientific databases (PubMed, JSTOR, Google Scholar results)
   - Established nonprofit organizations (.org with editorial standards)

2. NEVER cite or use information from:
   - Reddit, Quora, Yahoo Answers, or any forum/discussion site
   - Personal blogs, Medium posts, Substack (unless by a recognized expert)
   - Social media (Twitter/X, TikTok, Instagram, Facebook, YouTube comments)
   - Unverified or anonymous sources
   - AI-generated content farms or SEO spam sites
   - Websites with excessive ads, clickbait, or no editorial standards
   - Wikipedia (acceptable for background reading, but never as a final citation)

3. For EVERY factual claim, provide the source URL.
4. If you cannot find a reliable source for a claim, DO NOT include it.
   Say: "I could not find a reliable source for [specific claim]."
5. Always prefer primary sources over secondary sources.
6. Prefer sources published within the last 5 years unless the topic
   requires historical context.
7. If sources conflict, explicitly note the disagreement and present both sides.

=== OUTPUT RULES ===
1. Always include a properly formatted bibliography/works cited at the end.
2. Use in-text citations throughout (not just at the end).
3. Format citations exactly according to the user's chosen style (MLA, APA, or Chicago).
4. Number all sources and use consistent reference markers.
5. Never fabricate, hallucinate, or invent sources. If unsure, say so.
6. If the Grounding API returns a source you cannot verify, flag it as
   "[Source could not be independently verified]".

=== TONE & LEVEL RULES ===
- High School: Clear, accessible language. Define technical terms.
  Shorter sentences. 3-5 paragraph essays.
- Undergraduate: More sophisticated vocabulary. Deeper analysis expected.
  Engage with counterarguments. 5-8 paragraph essays.
- Graduate: Expert-level discourse. Nuanced argumentation.
  Engage with methodology and theoretical frameworks. Extensive citations.

=== CONTENT RULES ===
1. Be factual and balanced. Present multiple perspectives when relevant.
2. Do not write opinions unless the assignment explicitly asks for an opinion piece.
3. Use proper academic tone appropriate to the education level.
4. Include a clear thesis statement for essays.
5. Synthesize information across sources — never copy/paste from any single source.
6. Avoid filler phrases and padding. Every sentence should add value.
```

---

## Environment Variables (`.env.local`)

```bash
# ===========================
# Firebase (B agent sets these in Phase 2)
# ===========================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ===========================
# Gemini (A agent sets this in Phase 3)
# ===========================
GOOGLE_GEMINI_API_KEY=

# ===========================
# Stripe (B agent sets these in Phase 5)
# ===========================
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

---

## How to Use This Roadmap in Antigravity

For each phase:
1. Open the relevant agent prompt file (see below)
2. Paste it into Antigravity as the agent's instructions
3. Tell the agent which step to work on (e.g., "Complete step F1.1 through F1.4")
4. Review the output, test locally
5. When all steps in a phase are done, have the D agent redeploy
6. Verify in production before moving to the next phase

The individual agent prompt files are provided separately.
