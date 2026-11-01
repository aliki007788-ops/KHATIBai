"""Server-side course path progress — replaces browser localStorage."""
from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import CourseWeekProgress


class CourseProgressError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def list_completed_weeks(db: Session, user_id: str, path_id: str) -> list[CourseWeekProgress]:
    rows = db.execute(
        select(CourseWeekProgress)
        .where(CourseWeekProgress.user_id == user_id, CourseWeekProgress.path_id == path_id)
        .order_by(CourseWeekProgress.completed_at.asc())
    ).scalars().all()
    return list(rows)


def list_all_for_user(db: Session, user_id: str) -> list[CourseWeekProgress]:
    rows = db.execute(
        select(CourseWeekProgress)
        .where(CourseWeekProgress.user_id == user_id)
        .order_by(CourseWeekProgress.completed_at.asc())
    ).scalars().all()
    return list(rows)


def mark_week_complete(
    db: Session,
    user_id: str,
    path_id: str,
    week_id: str,
    *,
    quiz_score: int | None = None,
    quiz_total: int | None = None,
) -> CourseWeekProgress:
    existing = db.execute(
        select(CourseWeekProgress).where(
            CourseWeekProgress.user_id == user_id,
            CourseWeekProgress.path_id == path_id,
            CourseWeekProgress.week_id == week_id,
        )
    ).scalar_one_or_none()

    if existing is not None:
        if quiz_score is not None:
            existing.quiz_score = quiz_score
        if quiz_total is not None:
            existing.quiz_total = quiz_total
        db.commit()
        db.refresh(existing)
        return existing

    row = CourseWeekProgress(
        user_id=user_id,
        path_id=path_id,
        week_id=week_id,
        quiz_score=quiz_score,
        quiz_total=quiz_total,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def unmark_week(db: Session, user_id: str, path_id: str, week_id: str) -> bool:
    existing = db.execute(
        select(CourseWeekProgress).where(
            CourseWeekProgress.user_id == user_id,
            CourseWeekProgress.path_id == path_id,
            CourseWeekProgress.week_id == week_id,
        )
    ).scalar_one_or_none()
    if existing is None:
        return False
    db.delete(existing)
    db.commit()
    return True
