"""مدیریت پلن‌ها توسط ادمین (ساخت، ویرایش، غیرفعال‌سازی، حذف)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.admin_dependencies import require_admin
from app.core.db import get_db
from app.core.models import AuditLog, PlanDefinition, User
from app.core.sections import SECTIONS
from app.routers.plans import to_public
from app.schemas.plans import PlanAdmin, PlanUpsert
from app.services import plan_service

router = APIRouter(prefix="/api/admin/plans", tags=["admin-plans"])


def _to_admin(db: Session, plan: PlanDefinition) -> PlanAdmin:
    users, subs = plan_service.plan_usage_counts(db, plan.code)
    return PlanAdmin(
        **to_public(plan).model_dump(),
        id=plan.id,
        is_active=plan.is_active,
        sort_order=plan.sort_order,
        user_count=users,
        subscription_count=subs,
        updated_at=plan.updated_at,
    )


@router.get("/sections")
def list_sections(_: User = Depends(require_admin)):
    return [{"key": k, "label": v} for k, v in SECTIONS.items()]


@router.get("", response_model=list[PlanAdmin])
def list_all(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return [_to_admin(db, p) for p in plan_service.list_plans(db, only_active=False)]


@router.post("", response_model=PlanAdmin, status_code=status.HTTP_201_CREATED)
def create(payload: PlanUpsert, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    if not payload.code:
        raise HTTPException(422, "کد پلن الزامی است.")
    try:
        plan = plan_service.create_plan(db, payload.model_dump())
    except plan_service.PlanServiceError as exc:
        raise HTTPException(exc.status_code, exc.message)
    db.add(AuditLog(user_id=admin.id, action="admin_plan_create", detail=f"plan={plan.code}"))
    db.commit()
    return _to_admin(db, plan)


@router.put("/{code}", response_model=PlanAdmin)
def update(code: str, payload: PlanUpsert, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    data = payload.model_dump()
    data.pop("code", None)  # کد پلن بعد از ساخت تغییر نمی‌کند
    try:
        plan = plan_service.update_plan(db, code, data)
    except plan_service.PlanServiceError as exc:
        raise HTTPException(exc.status_code, exc.message)
    db.add(AuditLog(user_id=admin.id, action="admin_plan_update", detail=f"plan={plan.code}"))
    db.commit()
    return _to_admin(db, plan)


@router.delete("/{code}", status_code=status.HTTP_204_NO_CONTENT)
def delete(code: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    try:
        plan_service.delete_plan(db, code)
    except plan_service.PlanServiceError as exc:
        raise HTTPException(exc.status_code, exc.message)
    db.add(AuditLog(user_id=admin.id, action="admin_plan_delete", detail=f"plan={code}"))
    db.commit()
    return None
