"""
Public share-link service — lets a user share one speech analysis as a
read-only public link (no login) so a coach/friend can view it and leave
feedback (peer review), without exposing any account-identifying data.

Security controls:
- optional expiry (expires_at)
- revoke (revoked_at)
- show_transcript flag
- in-memory rate limit on public comments
"""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.models import Speech, SpeechAnalysis, SpeechComment, SpeechShare
from app.core.rate_limit import SlidingWindowLimiter

# حداکثر ۵ نظر در هر ۱۰ دقیقه از یک IP/توکن (کلید ترکیبی)
_comment_limiter = SlidingWindowLimiter(max_events=5, window_seconds=600)


class ShareServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _generate_token() -> str:
    return secrets.token_urlsafe(16)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _is_active(share: SpeechShare) -> bool:
    if share.revoked_at is not None:
        return False
    if share.expires_at is not None and share.expires_at <= _now():
        return False
    return True


def create_or_get_share(
    db: Session,
    user_id: str,
    speech_id: str,
    *,
    expires_in_days: int | None = 7,
    show_transcript: bool = True,
) -> SpeechShare:
    speech = db.get(Speech, speech_id)
    if speech is None or speech.user_id != user_id:
        raise ShareServiceError("تمرین یافت نشد.", status_code=404)

    existing = db.execute(
        select(SpeechShare).where(SpeechShare.speech_id == speech_id)
    ).scalar_one_or_none()

    if existing is not None:
        if existing.revoked_at is not None:
            existing.revoked_at = None
        if expires_in_days is not None:
            existing.expires_at = _now() + timedelta(days=expires_in_days)
        else:
            existing.expires_at = None
        existing.show_transcript = show_transcript
        db.commit()
        db.refresh(existing)
        return existing

    expires_at = (_now() + timedelta(days=expires_in_days)) if expires_in_days else None
    share = SpeechShare(
        speech_id=speech_id,
        created_by=user_id,
        share_token=_generate_token(),
        expires_at=expires_at,
        show_transcript=show_transcript,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


def revoke_share(db: Session, user_id: str, speech_id: str) -> SpeechShare:
    share = db.execute(
        select(SpeechShare).where(SpeechShare.speech_id == speech_id)
    ).scalar_one_or_none()
    if share is None or share.created_by != user_id:
        raise ShareServiceError("لینک اشتراک‌گذاری یافت نشد.", status_code=404)
    share.revoked_at = _now()
    db.commit()
    db.refresh(share)
    return share


def update_share_settings(
    db: Session,
    user_id: str,
    speech_id: str,
    *,
    expires_in_days: int | None = None,
    show_transcript: bool | None = None,
    clear_expiry: bool = False,
) -> SpeechShare:
    share = db.execute(
        select(SpeechShare).where(SpeechShare.speech_id == speech_id)
    ).scalar_one_or_none()
    if share is None or share.created_by != user_id:
        raise ShareServiceError("لینک اشتراک‌گذاری یافت نشد.", status_code=404)

    if clear_expiry:
        share.expires_at = None
    elif expires_in_days is not None:
        share.expires_at = _now() + timedelta(days=expires_in_days)
    if show_transcript is not None:
        share.show_transcript = show_transcript
    if share.revoked_at is not None:
        share.revoked_at = None
    db.commit()
    db.refresh(share)
    return share


def get_share_by_token(db: Session, token: str) -> SpeechShare | None:
    return db.execute(
        select(SpeechShare).where(SpeechShare.share_token == token)
    ).scalar_one_or_none()


def get_public_view_data(db: Session, token: str) -> dict | None:
    share = get_share_by_token(db, token)
    if share is None or not _is_active(share):
        return None

    speech = db.get(Speech, share.speech_id)
    if speech is None:
        return None

    analysis = db.execute(
        select(SpeechAnalysis).where(SpeechAnalysis.speech_id == speech.id)
    ).scalar_one_or_none()

    comments = db.execute(
        select(SpeechComment)
        .where(SpeechComment.share_id == share.id)
        .order_by(SpeechComment.created_at.asc())
    ).scalars().all()

    transcript = speech.transcript if share.show_transcript else None
    input_text = speech.input_text if share.show_transcript else None

    return {
        "topic_label": speech.topic_label,
        "transcript": transcript,
        "input_text": input_text,
        "show_transcript": share.show_transcript,
        "overall_score": analysis.overall_score if analysis else None,
        "dimension_scores": analysis.dimension_scores if analysis else None,
        "dimension_details": analysis.dimension_details if analysis else None,
        "strengths": analysis.ai_strengths if analysis else None,
        "weaknesses": analysis.ai_weaknesses if analysis else None,
        "improvements": analysis.ai_improvements if analysis else None,
        "structure_notes": analysis.structure_notes if analysis else None,
        "next_practice": analysis.next_practice if analysis else None,
        "audio_metrics": analysis.audio_metrics if analysis else None,
        "created_at": speech.created_at,
        "expires_at": share.expires_at,
        "comments": list(comments),
    }


def add_comment(
    db: Session,
    token: str,
    author_name: str,
    content: str,
    *,
    rate_limit_key: str | None = None,
) -> SpeechComment:
    share = get_share_by_token(db, token)
    if share is None or not _is_active(share):
        raise ShareServiceError("لینک اشتراک‌گذاری نامعتبر یا منقضی است.", status_code=404)

    key = rate_limit_key or f"share:{token}"
    if not _comment_limiter.allow(key):
        raise ShareServiceError(
            "تعداد نظرات بیش از حد مجاز است. چند دقیقه دیگر دوباره تلاش کنید.",
            status_code=429,
        )

    comment_count = db.execute(
        select(func.count()).select_from(SpeechComment).where(SpeechComment.share_id == share.id)
    ).scalar() or 0
    if comment_count >= 50:
        raise ShareServiceError("ظرفیت نظرات این لینک پر شده است.", status_code=400)

    comment = SpeechComment(
        share_id=share.id,
        author_name=author_name.strip()[:100],
        content=content.strip()[:2000],
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


def get_owner_share_status(db: Session, user_id: str, speech_id: str) -> SpeechShare | None:
    share = db.execute(
        select(SpeechShare).where(SpeechShare.speech_id == speech_id)
    ).scalar_one_or_none()
    if share is None or share.created_by != user_id:
        return None
    return share
