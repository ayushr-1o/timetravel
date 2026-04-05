# TimeTravel — Implementation Blueprint

A complete technical and product blueprint for the TimeTravel final project: a journalism accuracy system that detects time-sensitive claims in articles, highlights them, and suggests timeless rewrites. Built for maximum professionalism on a free-first stack.

---

## 1. Project Overview

**What it does:** TimeTravel ingests a news article URL, scrapes the content, runs it through GPT-4o-mini, and flags claims that may have become stale — with a freshness score, sensitivity rating, and a suggested timeless rewrite for each claim.

**Audience:** Local news agencies and editorial teams who need to maintain the long-term accuracy of published articles.

**Demo story in one sentence:** *A journalist pastes a news article URL — TimeTravel instantly shows which facts have aged, which need a rewrite, and suggests a timeless version of each outdated claim.*

---

## 2. Actual Folder Structure
timetravel/
├── archive/
│ ├── n8n/
│ │ └── workflow-notes.md ← original n8n pipeline notes
│ └── prototype/
│ └── timetravel-app.html ← original interactive UI prototype
├── backend/
│ ├── models/
│ │ ├── _init_.py
│ │ └── schemas.py ← Pydantic request/response models
│ ├── routers/
│ │ ├── _init_.py
│ │ ├── articles.py ← article CRUD endpoints
│ │ └── claims.py ← claim review + time-sensitive endpoints
│ ├── .env.example ← copy to .env and fill in keys
│ ├── Dockerfile ← Railway deployment
│ ├── main.py ← FastAPI app entry point
│ └── requirements.txt
├── docs/
│ ├── README.md
│ ├── architecture.md
│ └── database-schema.md
├── frontend/
│ ├── public/
│ │ ├── favicon.svg
│ │ └── icons.svg
│ ├── src/
│ │ ├── assets/
│ │ ├── components/
│ │ │ └── Layout.tsx
│ │ ├── layouts/
│ │ │ └── AppLayout.tsx
│ │ ├── lib/
│ │ │ └── supabase.ts ← Supabase client init
│ │ ├── pages/
│ │ │ ├── ArticleDetail.tsx ← claims sidebar + extract button
│ │ │ ├── ClaimReview.tsx ← pending claims grid + approve/reject
│ │ │ ├── Dashboard.tsx ← stats + article list
│ │ │ ├── SubmitArticle.tsx ← URL submission form
│ │ │ └── TimeSensitive.tsx ← high-risk claims + timeless rewrites
│ │ ├── types/
│ │ │ └── article.ts ← TypeScript interfaces
│ │ ├── App.tsx
│ │ ├── App.css
│ │ ├── index.css
│ │ └── main.tsx
│ ├── .env.example
│ ├── index.html
│ ├── package.json
│ ├── tsconfig.json
│ └── vite.config.ts
└── README.md

text

---

## 3. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| **Frontend** | React 18 + Vite + React Router v6 | Deployed on Railway |
| **Backend** | FastAPI + Python | Deployed on Railway via Dockerfile |
| **AI** | GPT-4o-mini (OpenAI) | Claim extraction + timeless rewrites |
| **Scraping** | BeautifulSoup + Requests | Generic paragraph extraction |
| **Database** | Supabase Postgres | JSONB for extracted_claims |
| **Auth** | Supabase (available) | Email + social login |

**Cost estimate for demo use:** €0–€5 total.

---

## 4. Database Schema (Supabase Postgres)

Claims are stored as a JSONB array inside the `articles` table for prototype simplicity. Each claim object follows this structure:

``````sql
-- Articles table (single source of truth)
CREATE TABLE articles (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT,
  source           TEXT,                          -- original article URL
  description      TEXT,
  raw_text         TEXT,                          -- scraped article body
  extracted_claims JSONB DEFAULT '[]'::jsonb,     -- array of claim objects
  status           TEXT DEFAULT 'pending',        -- pending | done
  processed_at     TIMESTAMPTZ,
  submitted_at     TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for fast JSONB queries
CREATE INDEX IF NOT EXISTS idx_articles_extracted_claims_gin
  ON articles USING GIN (extracted_claims);

CREATE INDEX IF NOT EXISTS idx_articles_status
  ON articles (status);
``````

### Claim Object Schema (inside extracted_claims JSONB)

``````json
{
  "claim_text": "exact claim sentence from article",
  "sensitivity": "low | medium | high",
  "freshness_score": 0.0,
  "analysis_notes": "why this claim may become outdated",
  "status": "pending | approved | rejected",
  "sources": [
    { "title": "Source name", "url": "https://..." }
  ]
}
``````

---

## 5. API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check |
| POST | `/extract-claims` | Scrape URL → GPT → save claims to Supabase |
| GET | `/claims/review?status_filter=pending` | Flat list of claims by status |
| POST | `/claims/{article_id}/{claim_index}/status` | Approve or reject a claim |
| GET | `/claims/time-sensitive` | High-sensitivity + low-freshness claims + GPT timeless rewrites |

---

## 6. AI Pipeline — GPT-4o-mini Prompts

### Claim Extractor (in `/extract-claims`)

Receives scraped article text, returns 3–8 time-sensitive claims:
Extract 3-8 verifiable, time-sensitive claims from this article text.

Return ONLY a valid JSON array:
[
{ "claim_text": "exact claim sentence",
"sensitivity": "high | medium | low",
"freshness_score": 0.0-1.0,
"analysis_notes": "why this claim may become outdated",
"status": "pending",
"sources": [{"title": "Source", "url": "<url>"}]
} ]

text

**Freshness score guide:** 0.0 = highly stale, 1.0 = very fresh/timeless.

### Timeless Rewrite Generator (in `/claims/time-sensitive`)

Receives a single time-bound claim, returns one generalized sentence:
Rewrite this time-bound claim timelessly (no dates, numbers, or fiscal years):
"<claim_text>"

Return ONLY one generalized sentence:

text

**Example:**
- Original: *"Trump is seeking $152m to reopen Alcatraz for the 2027 fiscal year."*
- Timeless: *"Presidential budget proposals for federal prison infrastructure are subject to annual Congressional approval."*

---

## 7. Frontend — Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Stats cards + article list + LIVE badge |
| `/submit` | SubmitArticle | URL input form |
| `/articles/:id` | ArticleDetail | Scraped text + claims sidebar + Extract button |
| `/review` | ClaimReview | Grid of pending claims with Approve/Reject |
| `/time-sensitive` | TimeSensitive | High-risk claims + timeless rewrite suggestions |

### Claim Status Color System

| Status | Color | Meaning |
|--------|-------|---------|
| `pending` | Orange | Awaiting editorial review |
| `approved` | Green | Confirmed still accurate |
| `rejected` | Red | Marked as outdated/incorrect |

### Sensitivity Badge Colors

| Level | Color | Meaning |
|-------|-------|---------|
| `high` | Red | Changes frequently (stats, budgets, positions) |
| `medium` | Orange | May change over months |
| `low` | Gray | Relatively stable |

---

## 8. Hosting & Deployment (Railway)

### Backend (FastAPI)

``````dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
``````

**Railway env vars:**
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
OPENAI_API_KEY=...

text

### Frontend (React/Vite)

Build command: `npm run build`
Output dir: `dist/`

**Railway env vars:**
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=...

text

---

## 9. Local Setup

### Backend
``````bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in keys
uvicorn main:app --reload
# → http://localhost:8000
``````

### Frontend
``````bash
cd frontend
npm install
cp .env.example .env.local  # fill in keys
npm run dev
# → http://localhost:5173
``````

---

## 10. Demo Script

Walk through this exact sequence for the final presentation:

1. Open Dashboard — clean dark nav, LIVE badge, stats cards.
2. Click **Submit Article** — paste a real BBC/Reuters URL.
3. Submit → article appears in dashboard with status `pending`.
4. Click article → **Article Detail** page → click **Extract Claims**.
5. Claims appear in sidebar — sensitivity badges (HIGH/MEDIUM), freshness scores.
6. Navigate to **Claim Review** — grid of 7 cards with Approve/Reject buttons.
7. Approve a claim — card disappears from pending list instantly.
8. Navigate to **Time Sensitive** — high-risk claims with green timeless rewrite boxes.
9. Show the before/after: *"Trump is seeking $152m..."* → *"Presidential budget proposals are subject to Congressional approval."*

This takes 90 seconds and demonstrates: **ingestion → extraction → editorial review → timeless rewriting**. That is the full product loop.

---

## 11. What Makes This Extraordinary

- **Real scraping** — BeautifulSoup extracts live article text from any public URL, not mocked data.
- **GPT-powered claim intelligence** — each claim has sensitivity, freshness score, and analysis notes from a real LLM call.
- **Timeless rewrite suggestions** — the Time Sensitive page shows not just *what* is outdated but *how to fix it*, making it a genuine editorial tool.
- **JSONB flexibility** — storing claims as JSONB arrays allows prototype-speed iteration without schema migrations.
- **Approve/reject workflow** — Claim Review mirrors a real editorial moderation flow with instant DB updates.
- **Staleness progress bars** — visual risk indicators make data scannable at a glance.
- **Consistent inline styles** — no Tailwind dependency, works identically across all environments.
