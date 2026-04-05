# TimeTravel ⏱️

> AI-powered freshness verification for news articles. Detect outdated claims, surface timeless rewrites, and keep journalism accurate over time.

## What it does

TimeTravel ingests a news article URL, scrapes the content, runs it through GPT-4o-mini, and flags claims that may have become stale — with a freshness score, sensitivity rating, and a suggested timeless rewrite for each claim.

## Live Features

| Page | Description |
|------|-------------|
| **Dashboard** | Overview of all submitted articles + stats |
| **Submit Article** | Add a news article URL for processing |
| **Article Detail** | View extracted claims per article |
| **Claim Review** | Approve or reject pending claims |
| **Time Sensitive** | High-risk claims with AI timeless rewrite suggestions |

## Folder Structure
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

## Setup & Running Locally

### Backend
``````bash
cd backend
pip install -r requirements.txt
cp .env.example .env        # fill in your keys
uvicorn main:app --reload
# Runs at http://localhost:8000
``````

### Frontend
``````bash
cd frontend
npm install
cp .env.example .env.local  # fill in your keys
npm run dev
# Runs at http://localhost:5173
``````

### Required Environment Variables

**backend/.env**
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key

text

**frontend/.env.local**
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

text

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend | React 18 + Vite + React Router v6 |
| Backend | FastAPI + Python |
| AI | GPT-4o-mini (OpenAI) |
| Scraping | BeautifulSoup + Requests |
| Database | Supabase (Postgres + JSONB) |
| Hosting | Railway (target) |

## Team

Built for the Prototyping final project, April 2026.
Team: Ayush Raj, Maximilian Voss, Mats Hoffmann, Wouter Louwman.