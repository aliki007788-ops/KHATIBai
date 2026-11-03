from __future__ import annotations

from app.core.entitlements import require_section

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import User
from app.routers.auth import get_current_user
from app.schemas.meeting import CreateMeetingRequest, EndMeetingRequest, MeetingSessionResponse
from app.services import meeting_service
from app.services.meeting_service import MeetingServiceError

router = APIRouter(prefix="/api/meetings", tags=["meetings"], dependencies=[Depends(require_section("meetings"))])


def _to_resp(row) -> MeetingSessionResponse:
    return MeetingSessionResponse(
        id=row.id,
        provider=row.provider.value if hasattr(row.provider, "value") else str(row.provider),
        title=row.title,
        meeting_url=row.meeting_url,
        notes=row.notes,
        focus=row.focus,
        speech_id=row.speech_id,
        started_at=row.started_at,
        ended_at=row.ended_at,
        created_at=row.created_at,
    )


@router.post("", response_model=MeetingSessionResponse)
def create_meeting(
    payload: CreateMeetingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        row = meeting_service.create_session(
            db,
            current_user.id,
            title=payload.title,
            meeting_url=payload.meeting_url,
            notes=payload.notes,
            focus=payload.focus,
        )
    except MeetingServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return _to_resp(row)


@router.get("", response_model=list[MeetingSessionResponse])
def list_meetings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = meeting_service.list_sessions(db, current_user.id)
    return [_to_resp(r) for r in rows]


@router.post("/{session_id}/end", response_model=MeetingSessionResponse)
def end_meeting(
    session_id: str,
    payload: EndMeetingRequest | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    body = payload or EndMeetingRequest()
    try:
        row = meeting_service.end_session(
            db,
            current_user.id,
            session_id,
            notes=body.notes,
            speech_id=body.speech_id,
        )
    except MeetingServiceError as exc:
        raise HTTPException(exc.status_code, exc.message) from exc
    return _to_resp(row)
