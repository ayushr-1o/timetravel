# Timetravel — Implementation Blueprint

A complete technical and product blueprint for the Timetravel final project: a journalism accuracy system that detects time-sensitive claims in articles, highlights them, and suggests updated sources. Built for maximum professionalism on a free-first stack.

---

## 1. Project Overview

**What it does:** Timetravel ingests a news article (by URL or paste), passes it through an orchestrated n8n agent pipeline, and returns a highlighted reading interface showing which claims are potentially outdated, a staleness confidence score for each, and recommended updated sources.

**Audience:** Local news agencies and editorial teams who need to maintain the long-term accuracy of published articles.

**Demo story in one sentence:** *A journalist pastes an article from 2 years ago — Timetravel instantly shows which facts have aged, which need a rewrite, and where to find fresher sources.*

---

## 2. Free-First Tech Stack

| Layer | Tool | Free Tier Details |
|-------|------|-------------------|
| **Frontend** | Next.js 14 (App Router) deployed on Vercel | Unlimited hobby deploys, custom domain supported |
| **Database** | Supabase Postgres | 500 MB database, 1 GB file storage, auth included |
| **Auth** | Supabase Auth | Email + social login, no cost |
| **Workflow Engine** | n8n Cloud Starter OR self-hosted on Railway | n8n Cloud: free trial; self-hosted: Railway free tier |
| **Backend Functions** | Supabase Edge Functions (Deno) | 500K free invocations/month |
| **AI (LLM)** | OpenAI API (GPT-4o-mini) or Groq (free tier) | GPT-4o-mini: very cheap per token; Groq: fully free |
| **Web Search (Agents)** | Tavily Search API | 1,000 free searches/month |
| **Hosting Backend** | Railway or Render free tier (if needed) | Lightweight FastAPI or Node service |
| **Domain** | Vercel subdomain (`timetravel.vercel.app`) | Free, looks professional for demo |

**Cost estimate for demo use:** €0–€5 total across the project lifecycle.

---

## 3. Database Schema (Supabase Postgres)

### Tables

```sql
-- Articles submitted for analysis
CREATE TABLE articles (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT,
  body         TEXT NOT NULL,
  source_url   TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status       TEXT DEFAULT 'pending', -- pending | processing | complete | error
  user_id      UUID REFERENCES auth.users(id)
);

-- Individual claims extracted from articles
CREATE TABLE claims (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id    UUID REFERENCES articles(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,          -- exact claim text from article
  start_offset  INT,                    -- character offset for highlight
  end_offset    INT,
  staleness     TEXT DEFAULT 'unknown', -- stable | possibly_outdated | outdated | needs_review
  confidence    FLOAT,                  -- 0.0–1.0
  reasoning     TEXT,                   -- agent's explanation
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Source suggestions for flagged claims
CREATE TABLE source_suggestions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id    UUID REFERENCES claims(id) ON DELETE CASCADE,
  title       TEXT,
  url         TEXT,
  summary     TEXT,
  published   DATE,
  relevance   FLOAT
);

-- Review notes added by editors
CREATE TABLE review_notes (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  claim_id   UUID REFERENCES claims(id) ON DELETE CASCADE,
  note       TEXT,
  reviewer   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row-Level Security (RLS)

Enable RLS on all tables so users only access their own articles:

```sql
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own articles" ON articles
  FOR ALL USING (auth.uid() = user_id);
```

---

## 4. n8n Workflow — Node-by-Node

The n8n workflow is the backbone of Timetravel. It receives a webhook call from the frontend and orchestrates the full analysis pipeline.

### Workflow: `article-analysis`

```
[Webhook Trigger]
       ↓
[Set: Parse article body + metadata]
       ↓
[Code: Chunk article into paragraphs]
       ↓
[HTTP Request: Call Claim Detector Agent (LLM)]
       ↓
[Code: Parse claims JSON, filter high-confidence ones]
       ↓
[Loop over each claim]
   ↓
   [HTTP Request: Call Freshness Verifier Agent (LLM + Tavily Search)]
   ↓
   [IF: staleness == "outdated" OR "possibly_outdated"]
       ↓
       [HTTP Request: Call Source Recommender Agent (LLM + Tavily Search)]
       ↓
[Merge: Collect all claim results]
       ↓
[HTTP Request: POST results to Supabase (upsert claims + sources)]
       ↓
[HTTP Request: Update article status → "complete"]
       ↓
[Respond to Webhook: Return claim summary]
```

### Node Configuration Details

**Webhook Trigger**
- Method: POST
- Path: `/webhook/analyze-article`
- Authentication: Header Auth (shared secret)
- Response mode: Last node (so the pipeline runs fully before responding)

**Claim Detector — LLM Node**
- Model: GPT-4o-mini or Groq Llama3
- System prompt:
```
You are an editorial accuracy assistant. Given a news article, extract all claims 
that are potentially time-sensitive or could become outdated. 
Return ONLY a JSON array in this exact format:
[
  {
    "text": "exact claim text as it appears in the article",
    "reason": "why this might become outdated",
    "confidence": 0.85
  }
]
Focus on: statistics, leadership/political positions, ongoing events, legislation, 
market data, scientific consensus, and quotes attributed to roles (not names).
```
- Input: `{{ $json.article_body }}`
- Max tokens: 1500

**Freshness Verifier — HTTP Request (Tavily Search)**
- URL: `https://api.tavily.com/search`
- Method: POST
- Body:
```json
{
  "api_key": "{{ $credentials.tavilyApiKey }}",
  "query": "latest update {{ $json.claim_text }} 2025 2026",
  "search_depth": "basic",
  "max_results": 3
}
```
- Then: Pass Tavily results + original claim to a second LLM call to produce staleness verdict (`stable` / `possibly_outdated` / `outdated`) + short reasoning.

**Source Recommender — LLM Node**
- Takes: claim text + Tavily search results
- System prompt:
```
You are a research assistant for news editors. Given a potentially outdated 
news claim and recent search results, identify the 2 best updated sources.
Return JSON:
[
  {
    "title": "source headline",
    "url": "source url",
    "summary": "one sentence about why this updates the claim",
    "published": "YYYY-MM-DD or null",
    "relevance": 0.9
  }
]
```

---

## 5. Frontend — Page Structure

Built in Next.js 14 App Router. Design system: Nexus (warm beige + teal, newsroom-restrained aesthetic).

### Pages / Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + article submission form |
| `/dashboard` | List of all submitted articles with status |
| `/article/[id]` | Main review interface: highlighted article + claim sidebar |
| `/article/[id]/claim/[claimId]` | Drawer/panel: full claim detail, source suggestions, review notes |

### Key UI Components

**Article Highlighter (`<HighlightedArticle />`)**
- Renders article body as plain text
- Overlays `<mark>` spans at `[start_offset, end_offset]` positions for each flagged claim
- Color coding: amber = `possibly_outdated`, red = `outdated`, green = `stable`
- Clicking a highlight opens the claim sidebar

**Claim Sidebar (`<ClaimPanel />`)**
- Shows claim text, staleness badge, confidence bar, and agent reasoning
- Lists source suggestions as cards with title, URL, summary, and publication date
- "Add note" input for editorial review comments
- Status toggle: reviewer can mark as "reviewed" or "dismissed"

**Article Status Bar**
- Shows pipeline status: Pending → Analyzing → Complete / Error
- Loading skeleton while n8n workflow is running (poll `/api/articles/[id]/status` every 3s)
- Animated "pipeline running" indicator using subtle CSS pulse

**Dashboard**
- Card grid of submitted articles
- Each card: title, submission date, number of flagged claims, overall staleness score, status badge
- Filter by status (all / pending / complete / flagged)
- Empty state: "Submit your first article to begin" with animated arrow pointing to the CTA

### Claim Status Color System

| Status | Color token | Meaning |
|--------|-------------|---------|
| `stable` | `--color-success` | Claim appears accurate and current |
| `possibly_outdated` | `--color-warning` | May have changed, warrants review |
| `outdated` | `--color-error` | Strong evidence it needs updating |
| `needs_review` | `--color-blue` | Not enough data for agent verdict |

---

## 6. Agent Design — System Prompts & Responsibilities

### Agent 1: Claim Detector

**Role:** Extract time-sensitive factual claims from an article body.

**Input:** Full article text.

**Output:** JSON array of `{ text, reason, confidence }`.

**Scope rule:** Only flag claims that could actually change over time. Ignore narrative descriptions, author opinions, and historical facts with no living actors.

**Example output:**
```json
[
  {
    "text": "Germany's inflation rate stands at 7.2%",
    "reason": "Economic statistics change frequently",
    "confidence": 0.92
  },
  {
    "text": "Ursula von der Leyen chairs the European Commission",
    "reason": "Leadership positions change",
    "confidence": 0.88
  }
]
```

---

### Agent 2: Freshness Verifier

**Role:** Determine whether a specific claim is still accurate today.

**Input:** Claim text + 3 Tavily search result snippets (title, url, snippet).

**Output:** `{ staleness, confidence, reasoning }`.

**Staleness values:**
- `stable` — no evidence of change found
- `possibly_outdated` — search results suggest partial change
- `outdated` — clear evidence the claim is no longer accurate
- `needs_review` — insufficient data to determine

**Example output:**
```json
{
  "staleness": "outdated",
  "confidence": 0.87,
  "reasoning": "Multiple 2025 sources report Germany's inflation dropped to 2.4% in Q1 2025, significantly below the claimed 7.2%."
}
```

---

### Agent 3: Source Recommender

**Role:** Identify the 2 best updated sources to replace or supplement a flagged claim.

**Input:** Original claim + staleness verdict + Tavily search results.

**Output:** JSON array of `{ title, url, summary, published, relevance }`.

**Quality filter prompt addition:**
```
Prefer: recent publications (2025–2026), reputable outlets, primary sources (official data, peer-reviewed studies).
Avoid: paywalled content where possible, opinion pieces, social media.
```

---

## 7. Hosting & Deployment

### Frontend (Vercel)
1. Push repo to GitHub.
2. Connect to Vercel (free hobby plan).
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `N8N_WEBHOOK_URL`
   - `N8N_WEBHOOK_SECRET`
4. Auto-deploys on every push to `main`.

### n8n
- **Option A (easiest for demo):** n8n Cloud free trial — instant setup, visual editor accessible via browser. Import workflow JSON.
- **Option B (more control):** Self-host on Railway free tier. Use official `n8nio/n8n` Docker image. Set `N8N_BASIC_AUTH_ACTIVE=true`.

### Supabase
- Create a new project at supabase.com (free tier).
- Run the schema SQL from Section 3 in the Supabase SQL Editor.
- Enable RLS and set up service role key for Edge Functions.

### Environment Variables Checklist
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...          # server-side only
N8N_WEBHOOK_URL=https://...n8n.io/webhook/analyze-article
N8N_WEBHOOK_SECRET=your-shared-secret
OPENAI_API_KEY=...                     # or GROQ_API_KEY
TAVILY_API_KEY=...
```

---

## 8. Build Order

Follow this sequence to avoid building an impressive backend before the visible product is credible.

### Phase 1 — Shell (Days 1–2)
- [ ] Scaffold Next.js app, design system, Supabase connection
- [ ] Build article submission form → saves to `articles` table with status `pending`
- [ ] Build dashboard page with article card grid and status badges
- [ ] Build `/article/[id]` layout with skeleton loader and placeholder claims panel

### Phase 2 — Highlight Interface (Days 3–4)
- [ ] Build `<HighlightedArticle />` with color-coded `<mark>` spans
- [ ] Build `<ClaimPanel />` sidebar with mock/hardcoded claim data
- [ ] Wire up claim selection, status toggle, and review note input
- [ ] Polish empty states, loading states, and error states

### Phase 3 — n8n Pipeline (Days 5–6)
- [ ] Set up Supabase project and run schema SQL
- [ ] Build n8n workflow with mocked LLM responses (use IF nodes with static JSON)
- [ ] Connect webhook: form submission → n8n → Supabase → frontend polls status
- [ ] Replace mock responses with real LLM + Tavily calls, agent by agent

### Phase 4 — Integration & Polish (Days 7–8)
- [ ] End-to-end test with 3 real articles
- [ ] Cache results to avoid re-running workflows on demo
- [ ] Deploy to Vercel + configure n8n production environment
- [ ] Record a 60-second demo video of the full flow

---

## 9. Demo Script

For the final presentation, walk through this exact sequence to show the full system in the best light:

1. Open the landing page — clean, editorial aesthetic. Paste in a real 2023 article URL.
2. Submit → watch the status bar animate through "Analyzing."
3. Article appears with highlighted claims — some amber, one red.
4. Click the red highlight: show the outdated verdict, confidence score, agent reasoning.
5. Scroll the source panel — show two updated sources with titles, dates, and relevance scores.
6. Add a quick review note: "Updated figure from ECB press release."
7. Mark claim as "reviewed" — badge updates.
8. Switch to dashboard — show the article card with "3 claims reviewed, 1 remaining."

This takes 90 seconds and demonstrates: **ingestion → orchestration → agent analysis → editorial review**. That is the full product loop.

---

## 10. What Makes This Extraordinary

The difference between a good prototype and an extraordinary one is the sum of details no one explicitly notices but everyone feels:

- **Article highlighting is character-accurate** — spans align precisely to the original text using offset indexing, not keyword matching.
- **Confidence is visible** — each claim shows a numerical confidence score and a one-sentence agent rationale, so editors trust the system rather than just following it.
- **The pipeline is observable** — the status bar shows exactly where in the workflow the article is. This makes n8n visible without exposing its complexity.
- **Review is editorial, not just technical** — note-taking, reviewer attribution, and claim dismissal make it feel like a real newsroom tool, not a demo.
- **It loads fast** — skeleton screens replace spinners. The article interface renders immediately; claims fill in as they arrive.
- **Light and dark mode** — newsroom editors work at all hours. Both modes are polished.
- **The empty state teaches** — the first-visit empty dashboard is not a blank screen but a short explanation of what Timetravel does and an animated CTA to submit the first article.
