from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core import coach_ticket
from app.core.db import get_db
from app.core.models import User
from app.core.rate_limit import SlidingWindowLimiter
from app.routers.auth import get_current_user
from app.schemas.ai import PracticeSuggestionResponse
from app.services import ai as ai_service

logger = logging.getLogger("khatib.practice")

router = APIRouter(prefix="/api/practice", tags=["practice"])

# سقف مصرف: پیشنهاد هوش مصنوعی هزینه دارد و بلیت مربی زنده نباید انبوه گرفته شود.
_suggest_limiter = SlidingWindowLimiter(max_events=30, window_seconds=600)
_ticket_limiter = SlidingWindowLimiter(max_events=20, window_seconds=600)


class PracticeSuggestionRequest(BaseModel):
    mode: str = Field(pattern="^(free|script|impromptu|presentation)$")
    level: str = Field(default="intermediate", pattern="^(beginner|intermediate|advanced)$")
    hint: str | None = Field(default=None, max_length=200)
    previous_title: str | None = Field(default=None, max_length=200)


class CoachTicketResponse(BaseModel):
    ticket: str
    expires_in: int


@router.post("/suggest", response_model=PracticeSuggestionResponse)
def suggest_practice(
    payload: PracticeSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _suggest_limiter.allow(current_user.id):
        raise HTTPException(429, "تعداد درخواست‌های پیشنهاد موضوع زیاد است؛ چند دقیقه بعد دوباره تلاش کنید.")
    try:
        return ai_service.suggest_practice_topic(
            db,
            current_user.id,
            payload.mode,
            payload.level,
            hint=payload.hint,
            previous_title=payload.previous_title,
        )
    except ai_service.AIServiceError as exc:
        raise HTTPException(502, exc.user_facing_message) from exc
    except Exception as exc:
        logger.exception("practice suggestion failed")
        raise HTTPException(502, "خطا در دریافت پیشنهاد هوش مصنوعی.") from exc


@router.post("/coach-ticket", response_model=CoachTicketResponse)
def create_coach_ticket(current_user: User = Depends(get_current_user)):
    if not _ticket_limiter.allow(current_user.id):
        raise HTTPException(429, "درخواست‌های اتصال به مربی زنده زیاد است؛ کمی بعد دوباره تلاش کنید.")
    return CoachTicketResponse(
        ticket=coach_ticket.issue_ticket(current_user.id),
        expires_in=coach_ticket.TICKET_TTL_SECONDS,
    )
