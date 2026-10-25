from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# =========================================================
# Admin Schemas
# =========================================================

class AdminStatsResponse(BaseModel):
    total_users: int
    active_users: int
    deleted_users: int
    total_speeches: int
    completed_speeches: int
    active_subscriptions: int
    paid_transactions: int
    total_revenue_toman: int


class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    plan: str
    role: str
    active: bool
    email_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SetUserPlanRequest(BaseModel):
    plan: str


class SetUserActiveRequest(BaseModel):
    active: bool


# =========================================================
# Finance Schemas
# =========================================================

class FinanceSummaryResponse(BaseModel):
    period_start: datetime
    period_end: datetime
    total_revenue: int
    total_expenses: int
    manual_expenses: int
    ai_cost_toman: int
    net_profit: int
    profit_margin: float


class ExpenseCreateRequest(BaseModel):
    category: str
    title: str
    amount_toman: int
    description: Optional[str] = None
    expense_date: Optional[datetime] = None


class ExpenseResponse(BaseModel):
    id: str
    category: str
    title: str
    amount_toman: int
    description: Optional[str] = None
    expense_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    user_id: str
    transaction_id: str
    plan: str
    amount_toman: int
    issued_at: datetime
    user_name: Optional[str] = None
    user_email: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)