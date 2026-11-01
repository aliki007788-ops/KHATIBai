from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.share import (
    AddCommentRequest,
    CommentResponse,
    CreateShareRequest,
    PublicSpeechView,
    ShareResponse,
    UpdateShareRequest,
)
from app.services import share_service
from app.services.share_service import ShareServiceError, _is_active

router = APIRouter(tags=["share"])


def _to_share_response(share) -> ShareResponse:
    return ShareResponse(
        share_token=share.share_token,
        created_at=share.created_at,
        expires_at=share.expires_at,
        revoked_at=share.revoked_at,
        show_transcript=share.show_transcript,
        is_active=_is_active(share),
    )


@router.post("/api/speech/{speech_id}/share", response_model=ShareResponse)
def create_share(
    speech_id: str,
    payload: CreateShareRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    body = payload or CreateShareRequest()
    try:
        share = share_service.create_or_get_share(
            db,
            current_user.id,
            speech_id,
            expires_in_days=body.expires_in_days,
            show_transcript=body.show_transcript,
        )
    except ShareServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return _to_share_response(share)


@router.get("/api/speech/{speech_id}/share", response_model=ShareResponse | None)
def get_share_status(
    speech_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    share = share_service.get_owner_share_status(db, current_user.id, speech_id)
    if share is None:
        return None
    return _to_share_response(share)


@router.patch("/api/speech/{speech_id}/share", response_model=ShareResponse)
def update_share(
    speech_id: str,
    payload: UpdateShareRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        share = share_service.update_share_settings(
            db,
            current_user.id,
            speech_id,
            expires_in_days=payload.expires_in_days,
            show_transcript=payload.show_transcript,
            clear_expiry=payload.clear_expiry,
        )
    except ShareServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return _to_share_response(share)


@router.delete("/api/speech/{speech_id}/share", response_model=ShareResponse)
def revoke_share(
    speech_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        share = share_service.revoke_share(db, current_user.id, speech_id)
    except ShareServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return _to_share_response(share)


@router.get("/api/public/speech/{token}", response_model=PublicSpeechView)
def get_public_speech(token: str, db: Session = Depends(get_db)):
    data = share_service.get_public_view_data(db, token)
    if data is None:
        raise HTTPException(404, "این لینک اشتراک‌گذاری یافت نشد یا دیگر معتبر نیست.")
    return PublicSpeechView(**data)


@router.post("/api/public/speech/{token}/comments", response_model=CommentResponse)
def add_public_comment(
    token: str,
    payload: AddCommentRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    client_ip = request.client.host if request.client else "unknown"
    rate_key = f"{token}:{client_ip}"
    try:
        comment = share_service.add_comment(
            db, token, payload.author_name, payload.content, rate_limit_key=rate_key
        )
    except ShareServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return CommentResponse.model_validate(comment)
