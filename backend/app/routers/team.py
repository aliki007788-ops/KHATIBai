from __future__ import annotations

import csv
import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.models import OrgRoleEnum, User
from app.core.rate_limit import SlidingWindowLimiter
from app.routers.auth import get_current_user
from app.schemas.team import (
    CreateOrganizationRequest,
    JoinOrganizationRequest,
    MemberProgressResponse,
    OrganizationResponse,
    SetMemberRoleRequest,
    TargetUserRequest,
)
from app.services import team_service
from app.services.csv_utils import csv_safe
from app.services.team_service import TeamServiceError

router = APIRouter(prefix="/api/team", tags=["team"])

# جلوگیری از حدس‌زدن کد دعوت (brute force) — per-process
_join_limiter = SlidingWindowLimiter(max_events=10, window_seconds=600)

_MANAGER_ROLES = (OrgRoleEnum.owner, OrgRoleEnum.manager)


def _to_org_response(org, role: str, db: Session) -> OrganizationResponse:
    return OrganizationResponse(
        id=org.id,
        name=org.name,
        invite_code=org.invite_code,
        role=role,
        member_count=team_service.member_count(db, org.id),
        created_at=org.created_at,
    )


def _require_membership(db: Session, user_id: str):
    membership = team_service.get_membership(db, user_id)
    if membership is None:
        raise HTTPException(404, "شما عضو هیچ تیمی نیستید.")
    return membership


def _run(action, *args):
    """اجرای عملیات سرویس و تبدیل TeamServiceError به پاسخ ۴۰۰."""
    try:
        return action(*args)
    except TeamServiceError as exc:
        raise HTTPException(400, exc.message) from exc


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
    org = _run(team_service.create_organization, db, current_user.id, payload.name)
    return _to_org_response(org, OrgRoleEnum.owner.value, db)


@router.post("/join", response_model=OrganizationResponse)
def join_team(
    payload: JoinOrganizationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not _join_limiter.allow(current_user.id):
        raise HTTPException(429, "تعداد تلاش‌ها زیاد است؛ چند دقیقه بعد دوباره امتحان کنید.")
    org = _run(team_service.join_organization, db, current_user.id, payload.invite_code)
    return _to_org_response(org, OrgRoleEnum.member.value, db)


@router.post("/leave")
def leave_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _run(team_service.leave_organization, db, current_user.id)
    return {"ok": True}


@router.post("/delete")
def delete_team(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _run(team_service.delete_organization, db, current_user.id)
    return {"ok": True}


@router.post("/transfer")
def transfer_team_ownership(
    payload: TargetUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _run(team_service.transfer_ownership, db, current_user.id, payload.user_id)
    return {"ok": True}


@router.post("/members/role")
def set_team_member_role(
    payload: SetMemberRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _run(team_service.set_member_role, db, current_user.id, payload.user_id, OrgRoleEnum(payload.role))
    return {"ok": True}


@router.post("/members/remove")
def remove_team_member(
    payload: TargetUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _run(team_service.remove_member, db, current_user.id, payload.user_id)
    return {"ok": True}


@router.post("/invite/regenerate", response_model=OrganizationResponse)
def regenerate_team_invite(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = _run(team_service.regenerate_invite_code, db, current_user.id)
    membership = _require_membership(db, current_user.id)
    return _to_org_response(org, membership.role.value, db)


@router.get("/members", response_model=list[MemberProgressResponse])
def get_members(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = _require_membership(db, current_user.id)
    rows = team_service.list_members_with_progress(db, membership.organization_id)
    # حریم خصوصی: ایمیل اعضا فقط برای مالک/مدیر نمایش داده می‌شود.
    if membership.role not in _MANAGER_ROLES:
        for row in rows:
            row["email"] = None
    return [MemberProgressResponse(**row) for row in rows]


@router.get("/export.csv")
def export_members_csv(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    membership = _require_membership(db, current_user.id)
    if membership.role not in _MANAGER_ROLES:
        raise HTTPException(403, "فقط مالک یا مدیر تیم می‌تواند گزارش را دانلود کند.")

    rows = team_service.list_members_with_progress(db, membership.organization_id)

    buffer = io.StringIO()
    buffer.write("\ufeff")  # BOM تا اکسل متن فارسی را درست نشان دهد
    writer = csv.writer(buffer)
    writer.writerow([
        "نام", "ایمیل", "نقش", "تعداد تمرین", "میانگین امتیاز", "بهترین امتیاز", "آخرین فعالیت",
    ])
    for row in rows:
        writer.writerow([
            csv_safe(row["name"] or ""),
            csv_safe(row["email"] or ""),
            row["role"],
            row["practice_count"],
            row["average_score"] if row["average_score"] is not None else "",
            row["best_score"] if row["best_score"] is not None else "",
            row["last_active_at"].isoformat() if row["last_active_at"] else "",
        ])

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=khatib-team-report.csv"},
    )
