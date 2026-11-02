from __future__ import annotations

import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.core.sections import SECTION_KEYS

_CODE_RE = re.compile(r"^[a-z][a-z0-9_-]{1,29}$")


class PlanLimitsOut(BaseModel):
    max_speech_per_month: int | None
    max_audio_seconds_per_month: int | None


class PlanPublic(BaseModel):
    code: str
    name_fa: str
    description_fa: str
    is_popular: bool
    price_monthly_toman: int | None
    price_yearly_toman: int | None
    yearly_discount_percent: int
    features: list[str]
    sections: list[str]
    limits: PlanLimitsOut


class PlanAdmin(PlanPublic):
    id: str
    is_active: bool
    sort_order: int
    user_count: int
    subscription_count: int
    updated_at: datetime


class PlanUpsert(BaseModel):
    code: str | None = None  # فقط هنگام ساخت
    name_fa: str = Field(min_length=1, max_length=100)
    description_fa: str = Field(default="", max_length=300)
    sort_order: int = Field(default=0, ge=0, le=1000)
    is_active: bool = True
    is_popular: bool = False
    price_monthly_toman: int | None = Field(default=None, ge=0, le=100_000_000)
    price_yearly_toman: int | None = Field(default=None, ge=0, le=1_000_000_000)
    features: list[str] = Field(default_factory=list, max_length=20)
    sections: list[str] = Field(default_factory=list)
    max_speech_per_month: int | None = Field(default=None, ge=0, le=1_000_000)
    max_audio_seconds_per_month: int | None = Field(default=None, ge=0, le=100_000_000)

    @field_validator("code")
    @classmethod
    def _code(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().lower()
        if not _CODE_RE.match(v):
            raise ValueError("کد پلن باید انگلیسی کوچک، ۲ تا ۳۰ کاراکتر (حروف، عدد، - و _) باشد.")
        return v

    @field_validator("features")
    @classmethod
    def _features(cls, v: list[str]) -> list[str]:
        out = [x.strip() for x in v if x and x.strip()]
        if any(len(x) > 200 for x in out):
            raise ValueError("هر ویژگی حداکثر ۲۰۰ کاراکتر است.")
        return out

    @field_validator("sections")
    @classmethod
    def _sections(cls, v: list[str]) -> list[str]:
        bad = [s for s in v if s not in SECTION_KEYS]
        if bad:
            raise ValueError(f"بخش نامعتبر: {', '.join(bad)}")
        return list(dict.fromkeys(v))


class PaymentOption(BaseModel):
    id: Literal["demo", "zarinpal"]
    label: str
    test_mode: bool


class PaymentOptionsResponse(BaseModel):
    providers: list[PaymentOption]
    default: str | None


class MyEntitlements(BaseModel):
    plan: str
    plan_name_fa: str
    expires_at: datetime | None
    sections: list[str]
    limits: PlanLimitsOut
    is_admin: bool
