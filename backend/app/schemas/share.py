from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ShareResponse(BaseModel):
    share_token: str
    created_at: datetime


class AddCommentRequest(BaseModel):
    author_name: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=2000)


class CommentResponse(BaseModel):
    id: str
    author_name: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicSpeechView(BaseModel):
    """خروجی عمومی و فقط-خواندنیِ یک تحلیل — بدون هیچ داده شناسایی‌کننده کاربر (ایمیل/شناسه)."""

    topic_label: str | None
    transcript: str | None
    input_text: str | None
    overall_score: int | None
    dimension_scores: dict | None
    dimension_details: dict | None
    strengths: list[str] | None
    weaknesses: list[str] | None
    improvements: list[str] | None
    structure_notes: str | None
    next_practice: str | None
    audio_metrics: dict | None
    created_at: datetime
    comments: list[CommentResponse]
