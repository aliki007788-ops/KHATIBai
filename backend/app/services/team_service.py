"""
Team / B2B service — organizations, invite codes, member progress rollups.
"""
from __future__ import annotations

import secrets
import string

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.models import Organization, OrganizationMember, OrgRoleEnum, Speech, SpeechStatus, User
from app.services import progress_engine


class TeamServiceError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


_ALREADY_MEMBER = "شما قبلاً عضو یک تیم هستید."
_NOT_MEMBER = "شما عضو هیچ تیمی نیستید."


def _generate_invite_code(db: Session, length: int = 8) -> str:
    alphabet = string.ascii_uppercase + string.digits
    for _ in range(20):
        code = "".join(secrets.choice(alphabet) for _ in range(length))
        exists = db.execute(select(Organization.id).where(Organization.invite_code == code)).first()
        if exists is None:
            return code
    raise TeamServiceError("ساخت کد دعوت یکتا ممکن نشد، دوباره تلاش کنید.")


def get_membership(db: Session, user_id: str) -> OrganizationMember | None:
    return db.execute(
        select(OrganizationMember).where(OrganizationMember.user_id == user_id)
    ).scalars().first()


def _get_member(db: Session, organization_id: str, user_id: str) -> OrganizationMember | None:
    return db.execute(
        select(OrganizationMember).where(
            OrganizationMember.organization_id == organization_id,
            OrganizationMember.user_id == user_id,
        )
    ).scalars().first()


def _require_membership(db: Session, user_id: str) -> OrganizationMember:
    membership = get_membership(db, user_id)
    if membership is None:
        raise TeamServiceError(_NOT_MEMBER)
    return membership


def create_organization(db: Session, owner_id: str, name: str) -> Organization:
    if get_membership(db, owner_id) is not None:
        raise TeamServiceError(_ALREADY_MEMBER)

    try:
        org = Organization(name=name, owner_id=owner_id, invite_code=_generate_invite_code(db))
        db.add(org)
        db.flush()
        db.add(OrganizationMember(organization_id=org.id, user_id=owner_id, role=OrgRoleEnum.owner))
        db.commit()
    except IntegrityError as exc:  # race: یکتایی user_id در دیتابیس
        db.rollback()
        raise TeamServiceError(_ALREADY_MEMBER) from exc
    db.refresh(org)
    return org


def join_organization(db: Session, user_id: str, invite_code: str) -> Organization:
    if get_membership(db, user_id) is not None:
        raise TeamServiceError(_ALREADY_MEMBER)

    org = db.execute(
        select(Organization).where(Organization.invite_code == invite_code.strip().upper())
    ).scalars().first()
    if org is None:
        raise TeamServiceError("کد دعوت نامعتبر است.")

    try:
        db.add(OrganizationMember(organization_id=org.id, user_id=user_id, role=OrgRoleEnum.member))
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise TeamServiceError(_ALREADY_MEMBER) from exc
    db.refresh(org)
    return org


def leave_organization(db: Session, user_id: str) -> None:
    membership = _require_membership(db, user_id)
    if membership.role == OrgRoleEnum.owner:
        raise TeamServiceError(
            "مالک تیم نمی‌تواند تیم را ترک کند؛ ابتدا مالکیت را به عضو دیگری منتقل کنید یا تیم را حذف کنید."
        )
    db.delete(membership)
    db.commit()


def delete_organization(db: Session, actor_id: str) -> None:
    membership = _require_membership(db, actor_id)
    if membership.role != OrgRoleEnum.owner:
        raise TeamServiceError("فقط مالک تیم می‌تواند تیم را حذف کند.")
    db.delete(membership.organization)  # اعضا با cascade حذف می‌شوند
    db.commit()


def transfer_ownership(db: Session, actor_id: str, target_user_id: str) -> None:
    actor = _require_membership(db, actor_id)
    if actor.role != OrgRoleEnum.owner:
        raise TeamServiceError("فقط مالک تیم می‌تواند مالکیت را منتقل کند.")
    if target_user_id == actor_id:
        raise TeamServiceError("شما همین حالا مالک تیم هستید.")
    target = _get_member(db, actor.organization_id, target_user_id)
    if target is None:
        raise TeamServiceError("این کاربر عضو تیم شما نیست.")

    target.role = OrgRoleEnum.owner
    actor.role = OrgRoleEnum.manager
    actor.organization.owner_id = target_user_id
    db.commit()


def set_member_role(db: Session, actor_id: str, target_user_id: str, role: OrgRoleEnum) -> None:
    actor = _require_membership(db, actor_id)
    if actor.role != OrgRoleEnum.owner:
        raise TeamServiceError("فقط مالک تیم می‌تواند نقش اعضا را تغییر دهد.")
    if role not in (OrgRoleEnum.manager, OrgRoleEnum.member):
        raise TeamServiceError("نقش نامعتبر است.")
    target = _get_member(db, actor.organization_id, target_user_id)
    if target is None:
        raise TeamServiceError("این کاربر عضو تیم شما نیست.")
    if target.role == OrgRoleEnum.owner:
        raise TeamServiceError("نقش مالک تیم از این مسیر قابل تغییر نیست؛ از «انتقال مالکیت» استفاده کنید.")
    target.role = role
    db.commit()


def remove_member(db: Session, actor_id: str, target_user_id: str) -> None:
    actor = _require_membership(db, actor_id)
    if actor.role not in (OrgRoleEnum.owner, OrgRoleEnum.manager):
        raise TeamServiceError("فقط مالک یا مدیر تیم می‌تواند عضوی را حذف کند.")
    if target_user_id == actor_id:
        raise TeamServiceError("برای خروج از تیم از گزینه‌ی «ترک تیم» استفاده کنید.")
    target = _get_member(db, actor.organization_id, target_user_id)
    if target is None:
        raise TeamServiceError("این کاربر عضو تیم شما نیست.")
    if target.role == OrgRoleEnum.owner:
        raise TeamServiceError("مالک تیم را نمی‌توان حذف کرد.")
    if actor.role == OrgRoleEnum.manager and target.role != OrgRoleEnum.member:
        raise TeamServiceError("مدیر فقط می‌تواند اعضای ساده را حذف کند.")
    db.delete(target)
    db.commit()


def regenerate_invite_code(db: Session, actor_id: str) -> Organization:
    actor = _require_membership(db, actor_id)
    if actor.role not in (OrgRoleEnum.owner, OrgRoleEnum.manager):
        raise TeamServiceError("فقط مالک یا مدیر تیم می‌تواند کد دعوت را عوض کند.")
    org = actor.organization
    org.invite_code = _generate_invite_code(db)
    db.commit()
    db.refresh(org)
    return org


def member_count(db: Session, organization_id: str) -> int:
    return db.execute(
        select(func.count(OrganizationMember.id)).where(OrganizationMember.organization_id == organization_id)
    ).scalar_one()


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
