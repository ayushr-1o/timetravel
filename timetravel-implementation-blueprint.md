# TimeTravel — Implementation Blueprint

A technical and product blueprint for TimeTravel: a journalism workflow tool that extracts claims from articles, supports editorial review, and rewrites time-sensitive excerpts into timeless language.

---

## 1. Project Overview

**What it does:** TimeTravel lets a user submit an article URL, scrape and analyze its content, extract time-sensitive claims, review those claims by article, and use AI to rewrite pasted excerpts so they read more timelessly.

**Audience:** Journalists, editorial teams, newsroom operators, and content reviewers who want to maintain article accuracy and reduce time-bound phrasing.

**Demo story in one sentence:** *A journalist submits an article, extracts claims for review, approves or rejects them by article, and uses Timeless Rewrite to turn dated wording into evergreen copy.*

---

## 2. Current Product Scope

The current prototype includes four main workflows:

1. **Dashboard**
   - Clean overview of the system
   - No seeded or demo history
   - Starts in a fresh state if the database is empty

2. **Submit Article**
   - User pastes an article URL
   - URL is stored and prepared for processing

3. **Claim Review**
   - Extracted claims are grouped under their source article
   - Each article section can be expanded/collapsed
   - Editors approve or reject claims individually

4. **Timeless Rewrite**
   - User pastes an excerpt directly
   - AI rewrites it to remove time-sensitive wording
   - UI shows original text, rewritten text, and a side-by-side before/after diff
   - If no rewrite is needed, the app explicitly says so

---

## 3. Actual Folder Structure

```text
timetravel/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── Dockerfile
│   ├── Caddyfile
│   ├── package.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── src/
│       ├── components/
│       │   └── Layout.tsx
│       ├── lib/
│       │   └── api.ts
│       ├── config.ts
│       ├── pages/
│       │   ├── Dashboard.tsx
│       │   ├── SubmitArticle.tsx
│       │   ├── ArticleDetail.tsx
│       │   ├── ClaimReview.tsx
│       │   └── TimelessRewrite.tsx
│       ├── App.tsx
│       └── main.tsx
└── README.md
```

---

## 4. Tech Stack

| Layer | Tool | Notes |
|-------|------|-------|
| Frontend | React + TypeScript + Vite | Static build served on Railway |
| Routing | React Router | Client-side page routing |
| Backend | FastAPI + Python | API service on Railway |
| AI | OpenAI GPT-4o-mini | Claim extraction and timeless rewriting |
| Scraping | Requests + BeautifulSoup | Article text extraction |
| Database | Supabase Postgres | Stores submitted articles and extracted claims |
| Hosting | Railway | Separate frontend and backend services |

---

## 5. Data Model

The prototype uses an `articles` table as the main source of truth.

### Articles table

```sql
CREATE TABLE articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  source TEXT,
  description TEXT,
  raw_text TEXT,
  extracted_claims JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending',
  processed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Claim object inside `extracted_claims`

```json
{
  "claim_text": "Exact claim sentence from article",
  "sensitivity": "low | medium | high",
  "freshness_score": 0.0,
  "analysis_notes": "Why this claim may become outdated",
  "status": "pending | approved | rejected",
  "sources": [
    { "title": "Source name", "url": "https://..." }
  ]
}
```

This keeps the schema simple for a prototype while still supporting extraction and review workflows.[user query]

---

## 6. API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/health` | Health check endpoint |
| POST | `/extract-claims` | Scrape article URL, extract claims, save to database |
| GET | `/claims/review` | Return pending claims for review |
| POST | `/claims/{article_id}/{claim_index}/status` | Update a claim to approved or rejected |
| POST | `/timeless-rewrite` | Rewrite a pasted excerpt to remove time-sensitive language |

---

## 7. AI Workflows

### Claim Extraction

The claim extraction flow:
1. Receives an article URL
2. Scrapes article text
3. Sends the content to GPT-4o-mini
4. Returns structured claim objects with:
   - claim text
   - sensitivity
   - freshness score
   - analysis notes
   - default review status
   - sources

### Timeless Rewrite

The timeless rewrite flow:
1. Receives a pasted excerpt
2. Sends it to GPT-4o-mini with instructions to remove time-sensitive wording
3. Returns:
   - original text
   - rewritten text
   - `changed: true/false`
   - a message indicating whether changes were needed
   - side-by-side diff rows for UI display

This is now a standalone user workflow rather than a derived “time-sensitive claims” page.[user query]

---

## 8. Frontend Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Clean overview and empty-state entry point |
| `/submit` | SubmitArticle | Submit a URL for article processing |
| `/articles/:id` | ArticleDetail | View article details and extract claims |
| `/review` | ClaimReview | Review pending claims grouped by article |
| `/timeless-rewrite` | TimelessRewrite | Rewrite pasted excerpts into timeless language |

---

## 9. UX Decisions

### Claim Review grouping
Claims are grouped by article rather than displayed in one flat list. This reduces ambiguity and makes it easier to understand which claim belongs to which source article.[user query]

### Timeless Rewrite comparison
The rewrite result displays:
- original text
- rewritten text
- side-by-side “before” and “after” changes

This makes the AI output more transparent for editorial use.[user query]

### Clean dashboard state
Historical demo data has been removed from the prototype so the app feels like a new product on first launch.[user query]

---

## 10. Deployment

## Frontend
The frontend is built with Vite and deployed as a static site on Railway.

### Required frontend environment variables

```env
VITE_API_URL=https://timetravel-backend.up.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend deployment note
Because Vite injects environment variables at build time, the frontend Dockerfile must expose `VITE_API_URL` during the build step.[web:126][user query]

## Backend
The backend is deployed separately on Railway using FastAPI.

### Required backend environment variables

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### CORS
The backend must allow:
- `http://localhost:5173`
- `https://timetravel-frontend.up.railway.app`

The production origin must **not** include a trailing slash, or CORS will fail.[user query][web:316]

---

## 11. Local Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## 12. Demo Flow

1. Open the dashboard
2. Submit an article URL
3. Open the article detail page
4. Run claim extraction
5. Go to Claim Review
6. Review grouped claims by article
7. Approve or reject one claim
8. Open Timeless Rewrite
9. Paste a time-bound excerpt
10. Show original vs rewritten text and the before/after diff

This demonstrates the full loop: **submission → extraction → review → timeless rewriting**.[user query]

---

## 13. Current State

The current prototype now includes:
- live Railway frontend and backend deployment
- working Supabase integration
- claim extraction
- grouped claim review
- timeless rewrite with visible before/after comparison
- cleaned data state with no old demo history
- fixed frontend/backend API connection
- fixed production CORS configuration

---

## 14. Product Value

What makes the prototype strong:

- Real article ingestion and scraping
- Structured claim extraction with AI
- Human review workflow for claims
- A dedicated timeless rewrite workflow
- Transparent rewrite comparison UI
- Simple deployable architecture
- Clean editorial-oriented interface

The app now behaves more like an editorial utility than a generic prototype shell.[user query]