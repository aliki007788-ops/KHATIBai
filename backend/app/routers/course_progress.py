from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.course_progress import MarkWeekRequest, PathProgressResponse, WeekProgressItem
from app.services import course_progress_service

router = APIRouter(prefix="/api/course-progress", tags=["course-progress"])


@router.get("/me", response_model=list[WeekProgressItem])
def get_all_my_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = course_progress_service.list_all_for_user(db, current_user.id)
    return [WeekProgressItem.model_validate(r) for r in rows]


@router.get("/{path_id}", response_model=PathProgressResponse)
def get_path_progress(
    path_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = course_progress_service.list_completed_weeks(db, current_user.id, path_id)
    items = [WeekProgressItem.model_validate(r) for r in rows]
    return PathProgressResponse(
        path_id=path_id,
        completed_week_ids=[r.week_id for r in rows],
        items=items,
    )


@router.post("/mark", response_model=WeekProgressItem)
def mark_week(
    payload: MarkWeekRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = course_progress_service.mark_week_complete(
        db,
        current_user.id,
        payload.path_id,
        payload.week_id,
        quiz_score=payload.quiz_score,
        quiz_total=payload.quiz_total,
    )
    return WeekProgressItem.model_validate(row)


@router.delete("/{path_id}/{week_id}")
def unmark_week(
    path_id: str,
    week_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ok = course_progress_service.unmark_week(db, current_user.id, path_id, week_id)
    if not ok:
        raise HTTPException(404, "این هفته در پیشرفت شما ثبت نشده است.")
    return {"ok": True}
