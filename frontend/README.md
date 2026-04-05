# TimeTravel

TimeTravel is a React + FastAPI application for extracting claims from articles, reviewing them, and rewriting time-sensitive excerpts into more timeless language.

## Features

- Submit article URLs for processing
- Extract claims from article content
- Review claims with approve/reject actions
- Group claim review by article to avoid confusion
- Rewrite excerpts using **Timeless Rewrite**
- View before/after changes for rewritten text
- Clean dashboard with no seeded history
- Railway-ready frontend and backend deployment

## Product Areas

### Dashboard
The dashboard provides a clean overview of the system and starts empty when no articles have been submitted.

### Submit Article
Paste an article URL to submit it for extraction and review.

### Claim Review
Claims are grouped under their source article so reviewers can clearly see which claims belong to which article.

### Timeless Rewrite
Paste an excerpt and the app rewrites it to remove time-sensitive phrasing. It also shows:
- the original version
- the rewritten version
- a before/after comparison of what changed
- a message when no timeless changes are needed

## Tech Stack

### Frontend
- React
- TypeScript
- Vite

### Backend
- FastAPI
- Python

### Data / Services
- Supabase
- OpenAI API

## Environment Variables

### Frontend
Create the frontend environment with:

```env
VITE_API_URL=https://timetravel-backend.up.railway.app
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend
Set these variables for the backend:

```env
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Local Development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

## Deployment

The project is deployed on Railway with separate frontend and backend services.

### Frontend deployment notes
- Vite uses `VITE_API_URL` for backend requests
- Docker build must expose `VITE_API_URL` at build time
- Frontend is served as a static app

### Backend deployment notes
- FastAPI must allow CORS for:
  - `http://localhost:5173`
  - `https://timetravel-frontend.up.railway.app`
- Do not include a trailing slash in the production frontend origin

## Recent Changes

- Replaced **Time Sensitive** with **Timeless Rewrite**
- Added before/after rewrite comparison
- Added “no timeless changes needed” response
- Grouped claim review by article
- Removed dead dashboard link
- Cleared historical seeded/demo data
- Fixed Railway frontend/backend connection issues
- Fixed production CORS configuration

## Notes

This is a prototype, but it is structured for real deployment and live testing.