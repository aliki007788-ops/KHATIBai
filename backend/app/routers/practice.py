from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.ai import PracticeSuggestionResponse
from app.services import ai as ai_service

router = APIRouter(prefix="/api/practice", tags=["practice"])


class PracticeSuggestionRequest(BaseModel):
    mode: str = Field(pattern="^(free|script|impromptu|presentation)$")
    level: str = Field(default="intermediate", pattern="^(beginner|intermediate|advanced)$")
    # درخواست دلخواه کاربر برای موضوع (گفتگوی پیشنهاد-و-تأیید)
    hint: str | None = Field(default=None, max_length=300)
    # عنوان پیشنهاد قبلی، وقتی کاربر می‌خواهد نسخه‌ی دیگری بسازد
    previous_title: str | None = Field(default=None, max_length=200)


@router.post("/suggest", response_model=PracticeSuggestionResponse)
def suggest_practice(
    payload: PracticeSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = ai_service.suggest_practice_topic(
            db, current_user.id, payload.mode, payload.level,
            hint=payload.hint, previous_title=payload.previous_title,
        )
    except Exception as exc:
        raise HTTPException(502, "خطا در دریافت پیشنهاد هوش مصنوعی.") from exc
    return result
