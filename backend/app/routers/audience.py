from __future__ import annotations
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.audience import AudienceSessionCreate, AudienceSessionResponse
from app.services import audience_service

router = APIRouter(prefix="/api/audience", tags=["audience"])

@router.post("/sessions", response_model=AudienceSessionResponse)
def create_session(
    payload: AudienceSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = audience_service.create(db, current_user.id, payload.model_dump())
    return AudienceSessionResponse.model_validate(row)

@router.get("/sessions", response_model=list[AudienceSessionResponse])
def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = audience_service.list_for_user(db, current_user.id)
    return [AudienceSessionResponse.model_validate(r) for r in rows]
