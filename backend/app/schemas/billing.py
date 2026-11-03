"""Pydantic schemas for billing endpoints."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel

from typing import Literal

from app.core.models import PaymentStatus, SubscriptionStatus


class CheckoutRequest(BaseModel):
    plan: str
    period: Literal["monthly", "yearly"] = "monthly"
    provider: Literal["demo", "zarinpal"] | None = None


class CheckoutResponse(BaseModel):
    payment_url: str
    authority: str
    transaction_id: str


class TransactionResponse(BaseModel):
    id: str
    plan: str
    amount_toman: int
    billing_period: str = "monthly"
    status: PaymentStatus
    provider: str
    ref_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class SubscriptionResponse(BaseModel):
    plan: str
    status: SubscriptionStatus
    starts_at: datetime
    expires_at: datetime
    auto_renew: bool

    model_config = {"from_attributes": True}


class NoActiveSubscriptionResponse(BaseModel):
    plan: str = "free"
    status: str = "none"
    message: str = "کاربر در حال حاضر اشتراک فعالی ندارد و از پلن رایگان استفاده می‌کند."
