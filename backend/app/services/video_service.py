from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import VideoAnalysis


def create_analysis(db: Session, user_id: str, data: dict) -> VideoAnalysis:
    row = VideoAnalysis(user_id=user_id, **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def list_analyses(db: Session, user_id: str, limit: int = 20) -> list[VideoAnalysis]:
    rows = db.execute(
        select(VideoAnalysis)
        .where(VideoAnalysis.user_id == user_id)
        .order_by(VideoAnalysis.created_at.desc())
        .limit(limit)
    ).scalars().all()
    return list(rows)


def get_analysis(db: Session, user_id: str, analysis_id: str) -> VideoAnalysis | None:
    row = db.get(VideoAnalysis, analysis_id)
    if row is None or row.user_id != user_id:
        return None
    return row
