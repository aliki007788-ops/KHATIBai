from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import OrgRoleEnum, User
from app.routers.auth import get_current_user
from app.schemas.team import (
    CreateOrganizationRequest,
    JoinOrganizationRequest,
    MemberProgressResponse,
    OrganizationResponse,
)
from app.services import team_service
from app.services.team_service import TeamServiceError

router = APIRouter(prefix="/api/team", tags=["team"])


def _to_org_response(org, role: str, db: Session) -> OrganizationResponse:
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        invite_code=org.invite_code,
        role=role,
        member_count=team_service.member_count(db, org.id),
        created_at=org.created_at,
    )


@router.get("/me", response_model=OrganizationResponse | None)
def get_my_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = team_service.get_membership(db, current_user.id)
    if membership is None:
        return None
    return _to_org_response(membership.organization, membership.role.value, db)


@router.post("/create", response_model=OrganizationResponse)
def create_team(
    payload: CreateOrganizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        org = team_service.create_organization(db, current_user.id, payload.name)
    except TeamServiceError as exc:
        raise HTTPException(400, exc.message) from exc
    return _to_org_response(org, OrgRoleEnum.owner.value, db)


@router.post("/join", response_model=OrganizationResponse)
def join_team(
    payload: JoinOrganizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        org = team_service.join_organization(db, current_user.id, payload.invite_code)
    except TeamServiceError as exc:
        raise HTTPException(400, exc.message) from exc
    return _to_org_response(org, OrgRoleEnum.member.value, db)


@router.post("/leave")
def leave_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        team_service.leave_organization(db, current_user.id)
    except TeamServiceError as exc:
        raise HTTPException(400, exc.message) from exc
    return {"ok": True}


def _require_membership(db: Session, user_id: str):
    membership = team_service.get_membership(db, user_id)
    if membership is None:
        raise HTTPException(404, "شما عضو هیچ تیمی نیستید.")
    return membership


@router.get("/members", response_model=list[MemberProgressResponse])
def get_members(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = _require_membership(db, current_user.id)
    rows = team_service.list_members_with_progress(db, membership.organization_id)
    return [MemberProgressResponse(**row) for row in rows]


@router.get("/export.csv")
def export_members_csv(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = _require_membership(db, current_user.id)
    if membership.role not in (OrgRoleEnum.owner, OrgRoleEnum.manager):
        raise HTTPException(403, "فقط مالک یا مدیر تیم می‌تواند گزارش را دانلود کند.")

    rows = team_service.list_members_with_progress(db, membership.organization_id)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow([
        "نام", "ایمیل", "نقش", "تعداد تمرین", "میانگین امتیاز", "بهترین امتیاز", "آخرین فعالیت",
    ])
    for row in rows:
        writer.writerow([
            row["name"] or "",
            row["email"],
            row["role"],
            row["practice_count"],
            row["average_score"] if row["average_score"] is not None else "",
            row["best_score"] if row["best_score"] is not None else "",
            row["last_active_at"].isoformat() if row["last_active_at"] else "",
        ])

    buffer.seek(0)
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=khatib-team-report.csv"},
    )
