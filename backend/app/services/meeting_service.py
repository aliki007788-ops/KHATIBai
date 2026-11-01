from __future__ import annotations

from datetime import datetime, timezone
from urllib.parse import urlparse

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import MeetingProvider, MeetingSession


class MeetingServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def _detect_provider(url: str) -> MeetingProvider:
    host = (urlparse(url).hostname or "").lower()
    if "zoom.us" in host or "zoom.com" in host:
        return MeetingProvider.zoom
    if "meet.google.com" in host:
        return MeetingProvider.meet
    return MeetingProvider.other


def create_session(
    db: Session,
    user_id: str,
    *,
    title: str,
    meeting_url: str,
    notes: str | None = None,
    focus: str | None = None,
) -> MeetingSession:
    url = meeting_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise MeetingServiceError("آدرس جلسه باید با http یا https شروع شود.")
    if len(url) > 1000:
        raise MeetingServiceError("آدرس جلسه خیلی بلند است.")

    row = MeetingSession(
        user_id=user_id,
        provider=_detect_provider(url),
        title=(title or "جلسه تمرین").strip()[:255],
        meeting_url=url,
        notes=(notes or None),
        focus=(focus or None),
        started_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_sessions(db: Session, user_id: str, limit: int = 30) -> list[MeetingSession]:
    rows = db.execute(
        select(MeetingSession)
        .where(MeetingSession.user_id == user_id)
        .order_by(MeetingSession.created_at.desc())
        .limit(limit)
    ).scalars().all()
    return list(rows)


def get_session(db: Session, user_id: str, session_id: str) -> MeetingSession | None:
    row = db.get(MeetingSession, session_id)
    if row is None or row.user_id != user_id:
        return None
    return row


def end_session(
    db: Session,
    user_id: str,
    session_id: str,
    *,
    notes: str | None = None,
    speech_id: str | None = None,
) -> MeetingSession:
    row = get_session(db, user_id, session_id)
    if row is None:
        raise MeetingServiceError("جلسه یافت نشد.", status_code=404)
    row.ended_at = datetime.now(timezone.utc)
    if notes is not None:
        row.notes = notes
    if speech_id is not None:
        row.speech_id = speech_id
    db.commit()
    db.refresh(row)
    return row
