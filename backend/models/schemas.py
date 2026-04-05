from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal, List
from datetime import date, datetime

ReviewStatus = Literal["unreviewed", "approved", "flagged", "dismissed"]
ClaimStatus = Literal["pending", "stable", "uncertain", "stale"]
ArticleStatus = Literal["pending", "processing", "done", "error"]

class ArticleCreate(BaseModel):
    url: Optional[HttpUrl] = None
    raw_text: str
    source: Optional[str] = None
    published_at: Optional[date] = None

class ClaimReviewUpdate(BaseModel):
    review_status: Optional[str] = None
    status: Optional[str] = None
    analysis_notes: Optional[str] = None

class SourceSuggestionOut(BaseModel):
    id: str
    title: str
    url: Optional[str] = None
    published: Optional[date] = None
    reliability: Optional[str] = None
    summary: Optional[str] = None

class ClaimOut(BaseModel):
    id: str
    article_id: str
    claim_text: str
    status: ClaimStatus
    review_status: ReviewStatus
    freshness_score: Optional[int] = None
    analysis_notes: Optional[str] = None
    char_start: Optional[int] = None
    char_end: Optional[int] = None
    source_suggestions: List[SourceSuggestionOut] = []

class ArticleOut(BaseModel):
    id: str
    created_at: datetime
    url: Optional[str] = None
    raw_text: str
    source: Optional[str] = None
    published_at: Optional[date] = None
    status: ArticleStatus
    risk_level: Optional[str] = None
    claim_count: int = 0
    stale_count: int = 0