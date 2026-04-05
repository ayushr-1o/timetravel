import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from supabase import create_client, Client
from models.schemas import ClaimReviewUpdate

load_dotenv()

router = APIRouter(prefix="/claims", tags=["claims"])


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in environment")
    return create_client(url, key)


@router.get("/{claim_id}")
async def get_claim(claim_id: str):
    supabase = get_supabase()

    res = (
        supabase.table("claims")
        .select("*, source_suggestions(*)")
        .eq("id", claim_id)
        .single()
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Claim not found")

    return res.data


@router.patch("/{claim_id}")
async def update_claim_review(claim_id: str, payload: ClaimReviewUpdate):
    supabase = get_supabase()

    update_data = payload.model_dump(exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    res = (
        supabase.table("claims")
        .update(update_data)
        .eq("id", claim_id)
        .execute()
    )

    if not res.data:
        raise HTTPException(status_code=404, detail="Claim not found")

    return res.data[0]