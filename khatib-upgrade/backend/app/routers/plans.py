"""API عمومی پلن‌ها: لیست تعرفه، گزینه‌های پرداخت و دسترسی‌های کاربر."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.core.models import PlanDefinition, User
from app.routers.auth import get_current_user
from app.schemas.plans import (
    MyEntitlements,
    PaymentOption,
    PaymentOptionsResponse,
    PlanLimitsOut,
    PlanPublic,
)
from app.services import plan_service

router = APIRouter(prefix="/api/plans", tags=["plans"])


def yearly_discount_percent(plan: PlanDefinition) -> int:
    m, y = plan.price_monthly_toman, plan.price_yearly_toman
    if not m or not y:
        return 0
    full = m * 12
    if full <= 0 or y >= full:
        return 0
    return round((1 - y / full) * 100)


def to_public(plan: PlanDefinition) -> PlanPublic:
    return PlanPublic(
        code=plan.code,
        name_fa=plan.name_fa,
        description_fa=plan.description_fa,
        is_popular=plan.is_popular,
        price_monthly_toman=plan.price_monthly_toman,
        price_yearly_toman=plan.price_yearly_toman,
        yearly_discount_percent=yearly_discount_percent(plan),
        features=list(plan.features or []),
        sections=list(plan.sections or []),
        limits=PlanLimitsOut(
            max_speech_per_month=plan.max_speech_per_month,
            max_audio_seconds_per_month=plan.max_audio_seconds_per_month,
        ),
    )


@router.get("", response_model=list[PlanPublic])
def list_public_plans(db: Session = Depends(get_db)):
    return [to_public(p) for p in plan_service.list_plans(db, only_active=True)]


@router.get("/payment-options", response_model=PaymentOptionsResponse)
def payment_options():
    providers: list[PaymentOption] = []
    if settings.zarinpal_available:
        providers.append(
            PaymentOption(id="zarinpal", label="زرین‌پال", test_mode=settings.zarinpal_sandbox)
        )
    if settings.demo_payment_allowed:
        providers.append(PaymentOption(id="demo", label="پرداخت آزمایشی (بدون برداشت)", test_mode=True))
    return PaymentOptionsResponse(providers=providers, default=providers[0].id if providers else None)


@router.get("/me", response_model=MyEntitlements)
def my_entitlements(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    code = plan_service.effective_plan_code(user)
    plan = plan_service.get_plan(db, code)
    limits = plan_service.limits_for(db, code)
    return MyEntitlements(
        plan=code,
        plan_name_fa=plan.name_fa if plan else code,
        expires_at=user.plan_expires_at,
        sections=plan_service.sections_for_user(db, user),
        limits=PlanLimitsOut(
            max_speech_per_month=limits.max_speech_per_month,
            max_audio_seconds_per_month=limits.max_audio_seconds_per_month,
        ),
        is_admin=plan_service.is_admin(user),
    )
