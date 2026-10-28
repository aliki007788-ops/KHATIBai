from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.share import (
    AddCommentRequest,
    CommentResponse,
    PublicSpeechView,
    ShareResponse,
)
from app.services import share_service
from app.services.share_service import ShareServiceError

router = APIRouter(tags=["share"])


@router.post("/api/speech/{speech_id}/share", response_model=ShareResponse)
def create_share(
    speech_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        share = share_service.create_or_get_share(db, current_user.id, speech_id)
    except ShareServiceError as exc:
        raise HTTPException(404, exc.message) from exc
    return ShareResponse(share_token=share.share_token, created_at=share.created_at)


@router.get("/api/public/speech/{token}", response_model=PublicSpeechView)
def get_public_speech(token: str, db: Session = Depends(get_db)):
    data = share_service.get_public_view_data(db, token)
    if data is None:
        raise HTTPException(404, "این لینک اشتراک‌گذاری یافت نشد یا دیگر معتبر نیست.")
    return PublicSpeechView(**data)


@router.post("/api/public/speech/{token}/comments", response_model=CommentResponse)
def add_public_comment(token: str, payload: AddCommentRequest, db: Session = Depends(get_db)):
    try:
        comment = share_service.add_comment(db, token, payload.author_name, payload.content)
    except ShareServiceError as exc:
        raise HTTPException(404, exc.message) from exc
    return CommentResponse.model_validate(comment)
