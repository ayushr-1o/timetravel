# Timetravel — Architecture

## Overview

Timetravel is a 4-layer system: a React frontend, a FastAPI backend, an n8n workflow engine, and a Supabase database. The AI layer runs through OpenRouter using Llama 3.1 8B, which is free and sufficient for structured claim extraction tasks.

## System diagram
User (browser)
│
▼
Next.js Frontend (Vercel)
│ submit article / poll for results
▼
FastAPI Backend (Railway)
│ store article → trigger n8n webhook
├──────────────────────────────────────
│ │
▼ ▼
Supabase (Postgres) n8n Workflow (Railway)
articles │
claims ├─ 1. Article Ingestion
source_suggestions ├─ 2. Claim Detector (LLM)
review_notes ├─ 3. Freshness Verifier (LLM + search)
├─ 4. Source Recommender (LLM)
└─ 5. Write results → Supabase


## Component responsibilities

### Frontend (Next.js)
- Article submission form (URL or text paste)
- Dashboard: article list sorted by risk
- Review view: inline highlighted claims + sidebar cards
- Pipeline view: live n8n workflow trace
- Polling the backend every 5s for updated results

### Backend (FastAPI)
- `POST /articles` — store article, trigger n8n webhook
- `GET /articles/{id}` — return article + claims + sources
- `PATCH /claims/{id}` — update review status (approve / flag / dismiss)
- Supabase client (python-supabase)

### n8n Workflow
See `n8n/workflow-notes.md` for full node breakdown.

### Database
See `database-schema.md` for table definitions.

## Deployment

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby (free) | $0 |
| Railway | Starter ($5 credit) | ~$0–5/mo |
| Supabase | Free tier | $0 |
| OpenRouter | Pay-per-token | ~$0 for demo |

## Environment variables

```env
# Backend (FastAPI)
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_KEY=your_anon_key
N8N_WEBHOOK_URL=https://your-n8n.railway.app/webhook/timetravel
OPENROUTER_API_KEY=sk-or-...

# Frontend (Next.js)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```