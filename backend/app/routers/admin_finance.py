from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.admin_dependencies import require_admin
from app.core.db import get_db
from app.core.models import (
    AIRequestLog,
    Expense,
    ExpenseCategory,
    Invoice,
    PaymentStatus,
    Transaction,
    User,
)
from app.schemas.admin import (
    ExpenseCreateRequest,
    ExpenseResponse,
    FinanceSummaryResponse,
    InvoiceResponse,
)

router = APIRouter(prefix="/api/admin/finance", tags=["admin-finance"])


# =========================================================
# خلاصه سود و زیان
# =========================================================

@router.get("/summary", response_model=FinanceSummaryResponse)
def finance_summary(
    start_date: Optional[datetime] = Query(default=None),
    end_date: Optional[datetime] = Query(default=None),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    start = start_date or now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = end_date or now

    total_revenue = db.execute(
        select(func.coalesce(func.sum(Transaction.amount_toman), 0)).where(
            Transaction.status == PaymentStatus.paid,
            Transaction.created_at >= start,
            Transaction.created_at <= end,
        )
    ).scalar() or 0

    manual_expenses = db.execute(
        select(func.coalesce(func.sum(Expense.amount_toman), 0)).where(
            Expense.expense_date >= start,
            Expense.expense_date <= end,
        )
    ).scalar() or 0

    ai_cost_usd = db.execute(
        select(func.coalesce(func.sum(AIRequestLog.cost_usd), 0)).where(
            AIRequestLog.created_at >= start,
            AIRequestLog.created_at <= end,
            AIRequestLog.status == "success",
        )
    ).scalar() or Decimal("0")

    USD_TO_TOMAN = 60000
    ai_cost_toman = int(ai_cost_usd * USD_TO_TOMAN)

    total_expenses = manual_expenses + ai_cost_toman
    net_profit = total_revenue - total_expenses
    profit_margin = (net_profit / total_revenue * 100) if total_revenue > 0 else 0

    return FinanceSummaryResponse(
        period_start=start,
        period_end=end,
        total_revenue=total_revenue,
        total_expenses=total_expenses,
        manual_expenses=manual_expenses,
        ai_cost_toman=ai_cost_toman,
        net_profit=net_profit,
        profit_margin=round(profit_margin, 2),
    )


# =========================================================
# هزینه‌ها
# =========================================================

@router.get("/expenses", response_model=list[ExpenseResponse])
def list_expenses(
    category: Optional[ExpenseCategory] = None,
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = select(Expense).order_by(Expense.expense_date.desc())
    if category:
        query = query.where(Expense.category == category)
    return db.execute(query.limit(limit)).scalars().all()


@router.post("/expenses", response_model=ExpenseResponse)
def create_expense(
    payload: ExpenseCreateRequest,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    expense = Expense(
        category=payload.category,
        title=payload.title,
        amount_toman=payload.amount_toman,
        description=payload.description,
        expense_date=payload.expense_date or datetime.now(timezone.utc),
        created_by=admin.id,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


# =========================================================
# فاکتورها
# =========================================================

@router.get("/invoices", response_model=list[InvoiceResponse])
def list_invoices(
    limit: int = Query(default=100, ge=1, le=500),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = select(Invoice).order_by(Invoice.issued_at.desc())
    return db.execute(query.limit(limit)).scalars().all()


@router.post("/invoices/{transaction_id}", response_model=InvoiceResponse)
def issue_invoice(
    transaction_id: str,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    transaction = db.get(Transaction, transaction_id)
    if not transaction:
        raise HTTPException(404, "تراکنش یافت نشد.")
    if transaction.status != PaymentStatus.paid:
        raise HTTPException(400, "فقط برای تراکنش‌های موفق می‌توان فاکتور صادر کرد.")

    existing = db.execute(
        select(Invoice).where(Invoice.transaction_id == transaction_id)
    ).scalar_one_or_none()
    if existing:
        return existing

    count = db.execute(select(func.count()).select_from(Invoice)).scalar() or 0
    invoice_number = f"INV-{datetime.now().year}-{count + 1:05d}"

    invoice = Invoice(
        invoice_number=invoice_number,
        user_id=transaction.user_id,
        transaction_id=transaction.id,
        plan=transaction.plan,
        amount_toman=transaction.amount_toman,
    )
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice


@router.get("/invoices/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: str,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    invoice = db.get(Invoice, invoice_id)
    if not invoice:
        raise HTTPException(404, "فاکتور یافت نشد.")

    # دریافت اطلاعات کاربر مربوط به فاکتور
    user = db.get(User, invoice.user_id)

    # ساخت پاسخ با اطلاعات کاربر
    return InvoiceResponse(
        id=invoice.id,
        invoice_number=invoice.invoice_number,
        user_id=invoice.user_id,
        transaction_id=invoice.transaction_id,
        plan=invoice.plan.value,
        amount_toman=invoice.amount_toman,
        issued_at=invoice.issued_at,
        user_name=user.name if user else None,
        user_email=user.email if user else None,
    )