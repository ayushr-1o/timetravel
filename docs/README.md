# Timetravel

> AI-powered freshness verification for news articles. Detect outdated claims, surface better sources, and keep journalism accurate over time.

## What it does

Timetravel ingests a news article, runs it through a 3-agent AI pipeline, and flags claims that may have become stale — with suggested updated sources and a freshness score for each claim.

## Folder structure
timetravel/
├── prototype/
│ └── timetravel-app.html ← interactive UI prototype (open in browser)
├── docs/
│ ├── README.md ← this file
│ ├── architecture.md ← full stack blueprint
│ └── database-schema.md ← Supabase table definitions
└── n8n/
└── workflow-notes.md ← n8n pipeline node configuration


## Running the prototype

No server needed. Just open `prototype/timetravel-app.html` in any modern browser. All views (Dashboard, Review, Pipeline) are interactive with mock data.

## Team

Built for the Prototyping final project at [your school], March 2026.  
Team: [your name], Max, Mats, Wouter.

## Tech stack (production target)

| Layer | Tool |
|---|---|
| Frontend | Next.js → Vercel |
| Backend | FastAPI → Railway |
| Workflow | n8n → Railway (Docker) |
| Database | Supabase (Postgres) |
| AI | OpenRouter (Llama 3.1 8B) |