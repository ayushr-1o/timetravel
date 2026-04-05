# Timetravel — n8n Workflow

## Overview

The Timetravel pipeline runs in n8n and is triggered by a webhook from the FastAPI backend whenever a new article is submitted. It processes the article through 4 nodes sequentially and writes results back to Supabase.

## Trigger

- **Type:** Webhook (POST)
- **Path:** `/webhook/timetravel`
- **Payload:** `{ article_id, raw_text, source, published_at }`

## Nodes

### 1. Article Ingestion
- **Type:** Code (JavaScript)
- **Task:** Clean and chunk the article text. Remove HTML, normalize whitespace, split into paragraphs.
- **Output:** `{ paragraphs: string[], token_count: number }`

### 2. Claim Detector
- **Type:** HTTP Request → OpenRouter API
- **Model:** `meta-llama/llama-3.1-8b-instruct`
- **System prompt:**
You are a journalism fact-checker. Given an article, identify all time-sensitive factual claims — statements about prices, statistics, policy positions, rankings, or named facts that could change over time. Return a JSON array of claims, each with: { text, char_start, char_end, sensitivity: "high"|"medium"|"low" }.
- **Output:** Array of claim objects

### 3. Freshness Verifier
- **Type:** Loop (one iteration per claim) → HTTP Request → OpenRouter
- **Model:** `meta-llama/llama-3.1-8b-instruct`
- **System prompt:**
You are a fact-checker verifying whether a specific claim in a news article is still accurate as of today. Given the claim text and original article date, assess: Is this claim still accurate? Has the situation changed? Return JSON: { status: "stable"|"uncertain"|"stale", freshness_score: 0-100, analysis: string }.

- **Rate limit:** 1 request/second to avoid OpenRouter throttling

### 4. Source Recommender
- **Type:** Loop (for stale/uncertain claims only) → HTTP Request → OpenRouter
- **Model:** `meta-llama/llama-3.1-8b-instruct`
- **System prompt:**
Given a stale or uncertain claim from a news article, suggest 2 updated sources that would replace or update this claim. Return JSON array: [{ title, url_hint, published_approx, reliability: "high"|"medium"|"low", summary }].


### 5. Write to Supabase
- **Type:** HTTP Request (Supabase REST API)
- **Actions:**
1. `PATCH /articles/{id}` — update status to "done", set risk_level, claim_count, stale_count
2. `POST /claims` (bulk) — insert all claims with freshness scores
3. `POST /source_suggestions` (bulk) — insert source suggestions per claim
4. `PATCH /articles/{id}` — set status to "done"

## Error handling

- If OpenRouter returns an error, retry once after 2 seconds
- If Supabase write fails, set article status to "error" and log the node name
- Timeout: 120 seconds total workflow execution

## Deployment

Deploy n8n on Railway using the official Docker image:

```dockerfile
FROM n8nio/n8n:latest
```

Set environment variables in Railway:
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=your_password
N8N_HOST=0.0.0.0
N8N_PORT=5678
WEBHOOK_URL=https://your-n8n.railway.app