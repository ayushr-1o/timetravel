import os
import httpx
import hashlib
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from models.schemas import ArticleCreate

load_dotenv()

router = APIRouter(prefix="/articles", tags=["articles"])


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in environment")
    return create_client(url, key)


def build_dedupe_key(payload: ArticleCreate) -> str:
    if payload.url:
        return f"url:{str(payload.url).strip().lower()}"
    normalized = " ".join((payload.raw_text or "").strip().lower().split())
    return "text:" + hashlib.sha256(normalized.encode("utf-8")).hexdigest()


@router.get("/")
async def list_articles():
    supabase = get_supabase()
    response = (
        supabase.table("articles")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data


@router.get("/{article_id}")
async def get_article(article_id: str):
    supabase = get_supabase()

    article_res = (
        supabase.table("articles")
        .select("*")
        .eq("id", article_id)
        .execute()
    )

    if not article_res.data:
        raise HTTPException(status_code=404, detail="Article not found")

    claims_res = (
        supabase.table("claims")
        .select("*, source_suggestions(*)")
        .eq("article_id", article_id)
        .execute()
    )

    return {
        "article": article_res.data[0],
        "claims": claims_res.data
    }


@router.post("/")
async def create_article(payload: ArticleCreate):
    supabase = get_supabase()
    dedupe_key = build_dedupe_key(payload)

    existing_res = (
        supabase.table("articles")
        .select("*")
        .eq("dedupe_key", dedupe_key)
        .limit(1)
        .execute()
    )

    if existing_res.data:
        return existing_res.data[0]

    article_insert = {
        "url": str(payload.url) if payload.url else None,
        "raw_text": payload.raw_text,
        "source": payload.source,
        "published_at": payload.published_at.isoformat() if payload.published_at else None,
        "status": "processing",
        "dedupe_key": dedupe_key,
    }

    article_res = (
        supabase.table("articles")
        .insert(article_insert)
        .execute()
    )

    if not article_res.data:
        raise HTTPException(status_code=500, detail="Failed to create article")

    article = article_res.data[0]

    webhook_url = os.getenv("N8N_WEBHOOK_URL")
    print(f"DEBUG webhook_url = {webhook_url}")

    if webhook_url:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                print("DEBUG calling n8n...")
                resp = await client.post(
                    webhook_url,
                    json={
                        "article_id": article["id"],
                        "raw_text": payload.raw_text,
                        "source": payload.source,
                        "published_at": payload.published_at.isoformat() if payload.published_at else None
                    }
                )
                print(f"DEBUG n8n response: {resp.status_code} {resp.text}")
        except Exception as e:
            print(f"n8n trigger failed: {type(e).__name__}: {e}")

    return article