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


@router.post("/suggest", response_model=PracticeSuggestionResponse)
def suggest_practice(
    payload: PracticeSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = ai_service.suggest_practice_topic(db, current_user.id, payload.mode, payload.level)
    except Exception as exc:
        raise HTTPException(502, "خطا در دریافت پیشنهاد هوش مصنوعی.") from exc
    return result
