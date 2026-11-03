"""
مدیریت پلن‌ها (ساخت/ویرایش توسط ادمین) و محاسبه‌ی قیمت و دسترسی‌ها.
"""
from __future__ import annotations

import threading
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.models import PlanDefinition, RoleEnum, Subscription, Transaction, User
from app.core.plans import PLAN_CATALOG, PlanLimits
from app.core.sections import SECTION_KEYS
from app.core.timeutil import as_utc

PERIOD_DAYS = {"monthly": 30, "yearly": 365}
FREE_CODE = "free"

_seed_lock = threading.Lock()
_seeded = False


class PlanServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


# قیمت سالانه = ۱۲ ماه با ۲۰٪ تخفیف (قابل ویرایش در داشبورد ادمین)
DEFAULT_PLANS: list[dict] = [
    dict(
        code="free", name_fa="رایگان", description_fa="شروع بدون هزینه", sort_order=0,
        price_monthly_toman=0, price_yearly_toman=0, is_popular=False,
        max_speech_per_month=5, max_audio_seconds_per_month=900,
        features=["۵ تحلیل در ماه", "دسترسی به سطح مبتدی", "تاریخچه ۷ روز اخیر", "پشتیبانی انجمن"],
    ),
    dict(
        code="basic", name_fa="پایه", description_fa="برای تمرین منظم", sort_order=1,
        price_monthly_toman=149_000, price_yearly_toman=1_430_000, is_popular=True,
        max_speech_per_month=50, max_audio_seconds_per_month=9000,
        features=["۵۰ تحلیل در ماه", "دسترسی تا سطح B1", "تاریخچه ۳۰ روز اخیر", "پشتیبانی ایمیل (۴۸ ساعته)"],
    ),
    dict(
        code="pro", name_fa="حرفه‌ای", description_fa="بدون محدودیت", sort_order=2,
        price_monthly_toman=299_000, price_yearly_toman=2_870_000, is_popular=False,
        max_speech_per_month=None, max_audio_seconds_per_month=None,
        features=["تحلیل نامحدود", "دسترسی کامل تا سطح C2", "تاریخچه نامحدود", "پشتیبانی ایمیل و تیکت (۲۴ ساعته)"],
    ),
]


def ensure_default_plans(db: Session) -> None:
    """اگر جدول پلن‌ها خالی است، پلن‌های پیش‌فرض را می‌سازد (idempotent)."""
    global _seeded
    if _seeded:
        return
    with _seed_lock:
        if _seeded:
            return
        count = db.execute(select(func.count()).select_from(PlanDefinition)).scalar() or 0
        if count == 0:
            for d in DEFAULT_PLANS:
                db.add(PlanDefinition(**d, is_active=True, sections=list(SECTION_KEYS)))
            db.commit()
        _seeded = True


def list_plans(db: Session, *, only_active: bool) -> list[PlanDefinition]:
    ensure_default_plans(db)
    q = select(PlanDefinition).order_by(PlanDefinition.sort_order, PlanDefinition.created_at)
    if only_active:
        q = q.where(PlanDefinition.is_active.is_(True))
    return list(db.execute(q).scalars().all())


def get_plan(db: Session, code: str) -> PlanDefinition | None:
    ensure_default_plans(db)
    return db.execute(select(PlanDefinition).where(PlanDefinition.code == str(code))).scalar_one_or_none()


def price_for(plan: PlanDefinition, period: str) -> int | None:
    if period == "monthly":
        return plan.price_monthly_toman
    if period == "yearly":
        return plan.price_yearly_toman
    return None


def limits_for(db: Session, code: str) -> PlanLimits:
    """محدودیت‌های ماهانه‌ی پلن؛ در نبود ردیف، به کاتالوگ ثابت قدیمی برمی‌گردد."""
    plan = get_plan(db, code)
    if plan is not None:
        return PlanLimits(
            max_speech_per_month=plan.max_speech_per_month,
            max_audio_seconds_per_month=plan.max_audio_seconds_per_month,
            price_toman=plan.price_monthly_toman or 0,
            label_fa=plan.name_fa,
        )
    for enum_plan, lim in PLAN_CATALOG.items():
        if enum_plan.value == str(code):
            return lim
    return PLAN_CATALOG[next(iter(PLAN_CATALOG))]


def effective_plan_code(user: User) -> str:
    """پلن مؤثر کاربر؛ اگر اشتراک منقضی شده باشد رایگان."""
    code = str(user.plan)
    if code != FREE_CODE:
        exp = as_utc(user.plan_expires_at)
        if exp is not None and exp <= datetime.now(timezone.utc):
            return FREE_CODE
    return code


def is_admin(user: User) -> bool:
    return user.role in (RoleEnum.admin, RoleEnum.superadmin)


def sections_for_user(db: Session, user: User) -> list[str]:
    if is_admin(user):
        return list(SECTION_KEYS)
    plan = get_plan(db, effective_plan_code(user))
    if plan is None:
        return list(SECTION_KEYS)  # پلن ناشناخته نباید کاربر را قفل کند
    return [s for s in (plan.sections or []) if s in SECTION_KEYS]


def plan_usage_counts(db: Session, code: str) -> tuple[int, int]:
    users = db.execute(select(func.count()).select_from(User).where(User.plan == code)).scalar() or 0
    subs = db.execute(select(func.count()).select_from(Subscription).where(Subscription.plan == code)).scalar() or 0
    return int(users), int(subs)


def apply_fields(plan: PlanDefinition, data: dict) -> None:
    for key in (
        "name_fa", "description_fa", "sort_order", "is_active", "is_popular",
        "price_monthly_toman", "price_yearly_toman", "features", "sections",
        "max_speech_per_month", "max_audio_seconds_per_month",
    ):
        if key in data:
            setattr(plan, key, data[key])


def create_plan(db: Session, data: dict) -> PlanDefinition:
    ensure_default_plans(db)
    code = data["code"]
    if get_plan(db, code) is not None:
        raise PlanServiceError("پلنی با این کد از قبل وجود دارد.", 409)
    plan = PlanDefinition(code=code, features=[], sections=[], name_fa="", description_fa="")
    apply_fields(plan, data)
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def update_plan(db: Session, code: str, data: dict) -> PlanDefinition:
    plan = get_plan(db, code)
    if plan is None:
        raise PlanServiceError("پلن یافت نشد.", 404)
    if code == FREE_CODE and data.get("is_active") is False:
        raise PlanServiceError("پلن رایگان نمی‌تواند غیرفعال شود.", 400)
    apply_fields(plan, data)
    db.commit()
    db.refresh(plan)
    return plan


def delete_plan(db: Session, code: str) -> None:
    plan = get_plan(db, code)
    if plan is None:
        raise PlanServiceError("پلن یافت نشد.", 404)
    if code == FREE_CODE:
        raise PlanServiceError("پلن رایگان قابل حذف نیست.", 400)
    users, subs = plan_usage_counts(db, code)
    txns = db.execute(select(func.count()).select_from(Transaction).where(Transaction.plan == code)).scalar() or 0
    if users or subs or txns:
        raise PlanServiceError(
            "این پلن کاربر، اشتراک یا تراکنش دارد و حذف نمی‌شود. به‌جای حذف، آن را غیرفعال کنید.", 409
        )
    db.delete(plan)
    db.commit()
