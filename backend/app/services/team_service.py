"""
Team / B2B service — organizations, invite codes, member progress rollups.
"""
from __future__ import annotations

import random
import string

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import Organization, OrganizationMember, OrgRoleEnum, Speech, SpeechStatus, User
from app.services import progress_engine


class TeamServiceError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


def _generate_invite_code(db: Session, length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "".join(random.choices(alphabet, k=length))
        exists = db.execute(select(Organization).where(Organization.invite_code == code)).scalar_one_or_none()
        if exists is None:
            return code
    raise TeamServiceError("ساخت کد دعوت یکتا ممکن نشد، دوباره تلاش کنید.")


def get_membership(db: Session, user_id: str) -> OrganizationMember | None:
    return db.execute(
        select(OrganizationMember).where(OrganizationMember.user_id == user_id)
    ).scalar_one_or_none()


def create_organization(db: Session, owner_id: str, name: str) -> Organization:
    existing = get_membership(db, owner_id)
    if existing is not None:
        raise TeamServiceError("شما قبلاً عضو یک تیم هستید.")

    org = Organization(name=name, owner_id=owner_id, invite_code=_generate_invite_code(db))
    db.add(org)
    db.flush()

    membership = OrganizationMember(organization_id=org.id, user_id=owner_id, role=OrgRoleEnum.owner)
    db.add(membership)
    db.commit()
    db.refresh(org)
    return org


def join_organization(db: Session, user_id: str, invite_code: str) -> Organization:
    existing = get_membership(db, user_id)
    if existing is not None:
        raise TeamServiceError("شما قبلاً عضو یک تیم هستید.")

    org = db.execute(
        select(Organization).where(Organization.invite_code == invite_code.strip().upper())
    ).scalar_one_or_none()
    if org is None:
        raise TeamServiceError("کد دعوت نامعتبر است.")

    membership = OrganizationMember(organization_id=org.id, user_id=user_id, role=OrgRoleEnum.member)
    db.add(membership)
    db.commit()
    db.refresh(org)
    return org


def leave_organization(db: Session, user_id: str) -> None:
    membership = get_membership(db, user_id)
    if membership is None:
        raise TeamServiceError("شما عضو هیچ تیمی نیستید.")
    if membership.role == OrgRoleEnum.owner:
        raise TeamServiceError("مالک تیم نمی‌تواند تیم را ترک کند؛ ابتدا تیم را حذف یا مالکیت را منتقل کنید.")
    db.delete(membership)
    db.commit()


def member_count(db: Session, organization_id: str) -> int:
    return len(
        db.execute(
            select(OrganizationMember.id).where(OrganizationMember.organization_id == organization_id)
        ).all()
    )


def list_members_with_progress(db: Session, organization_id: str) -> list[dict]:
    rows = db.execute(
        select(OrganizationMember, User)
        .join(User, User.id == OrganizationMember.user_id)
        .where(OrganizationMember.organization_id == organization_id)
        .order_by(OrganizationMember.joined_at.asc())
    ).all()

    result: list[dict] = []
    for membership, user in rows:
        summary = progress_engine.compute_summary(db, user.id)

        last_active = db.execute(
            select(Speech.completed_at)
            .where(Speech.user_id == user.id, Speech.status == SpeechStatus.completed)
            .order_by(Speech.completed_at.desc())
            .limit(1)
        ).scalar_one_or_none()

        result.append({
            "user_id": user.id,
            "name": user.name,
            "email": user.email,
            "role": membership.role.value,
            "joined_at": membership.joined_at,
            "practice_count": summary.practice_count,
            "average_score": summary.average_score,
            "best_score": summary.best_score,
            "last_active_at": last_active,
        })
    return result
