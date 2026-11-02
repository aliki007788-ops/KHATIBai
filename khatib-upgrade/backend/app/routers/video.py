from __future__ import annotations

from app.core.entitlements import require_section

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.video import VideoAnalysisCreate, VideoAnalysisResponse
from app.services import video_service
from app.services.video_service import VideoServiceError

router = APIRouter(prefix="/api/video", tags=["video"], dependencies=[Depends(require_section("video"))])


@router.post("/analyses", response_model=VideoAnalysisResponse)
def create_video_analysis(
    payload: VideoAnalysisCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        row = video_service.create_analysis(db, current_user.id, payload.model_dump())
    except VideoServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return VideoAnalysisResponse.model_validate(row)


@router.get("/analyses", response_model=list[VideoAnalysisResponse])
def list_video_analyses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = video_service.list_analyses(db, current_user.id)
    return [VideoAnalysisResponse.model_validate(r) for r in rows]


@router.get("/analyses/{analysis_id}", response_model=VideoAnalysisResponse)
def get_video_analysis(
    analysis_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = video_service.get_analysis(db, current_user.id, analysis_id)
    if row is None:
        raise HTTPException(404, "تحلیل ویدیو یافت نشد.")
    return VideoAnalysisResponse.model_validate(row)
