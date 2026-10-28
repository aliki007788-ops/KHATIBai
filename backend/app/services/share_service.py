"""
Public share-link service — lets a user share one speech analysis as a
read-only public link (no login) so a coach/friend can view it and leave
feedback (peer review), without exposing any account-identifying data.
"""
from __future__ import annotations

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import Speech, SpeechAnalysis, SpeechComment, SpeechShare


class ShareServiceError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def _generate_token() -> str:
    return secrets.token_urlsafe(16)


def create_or_get_share(db: Session, user_id: str, speech_id: str) -> SpeechShare:
    speech = db.get(Speech, speech_id)
    if speech is None or speech.user_id != user_id:
        raise ShareServiceError("تمرین یافت نشد.")

    existing = db.execute(
        select(SpeechShare).where(SpeechShare.speech_id == speech_id)
    ).scalar_one_or_none()
    if existing is not None:
        return existing

    share = SpeechShare(speech_id=speech_id, created_by=user_id, share_token=_generate_token())
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


def get_share_by_token(db: Session, token: str) -> SpeechShare | None:
    return db.execute(
        select(SpeechShare).where(SpeechShare.share_token == token)
    ).scalar_one_or_none()


def get_public_view_data(db: Session, token: str) -> dict | None:
    share = get_share_by_token(db, token)
    if share is None:
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

    return {
        "topic_label": speech.topic_label,
        "transcript": speech.transcript,
        "input_text": speech.input_text,
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
        "comments": list(comments),
    }


def add_comment(db: Session, token: str, author_name: str, content: str) -> SpeechComment:
    share = get_share_by_token(db, token)
    if share is None:
        raise ShareServiceError("لینک اشتراک‌گذاری نامعتبر است.")

    comment = SpeechComment(share_id=share.id, author_name=author_name.strip(), content=content.strip())
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment
