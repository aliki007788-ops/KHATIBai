"""dynamic plans: plan_definitions table, string plan codes, billing_period

Revision ID: i9d0e1f2a3b4
Revises: h8c9d0e1f2a3
Create Date: 2026-11-01 19:00:00.000000

پلن‌های پیش‌فرض (free/basic/pro) هنگام اولین درخواست به API خودکار ساخته می‌شوند.
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision = "i9d0e1f2a3b4"
down_revision = "h8c9d0e1f2a3"
branch_labels = None
depends_on = None

_PLAN_COLUMNS = [("users", "plan"), ("subscriptions", "plan"), ("transactions", "plan"), ("invoices", "plan")]


def upgrade() -> None:
    bind = op.get_bind()

    op.create_table(
        "plan_definitions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("code", sa.String(50), nullable=False),
        sa.Column("name_fa", sa.String(100), nullable=False),
        sa.Column("description_fa", sa.String(300), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_popular", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("price_monthly_toman", sa.Integer(), nullable=True),
        sa.Column("price_yearly_toman", sa.Integer(), nullable=True),
        sa.Column("features", sa.JSON(), nullable=False),
        sa.Column("sections", sa.JSON(), nullable=False),
        sa.Column("max_speech_per_month", sa.Integer(), nullable=True),
        sa.Column("max_audio_seconds_per_month", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_plan_definitions_code", "plan_definitions", ["code"], unique=True)

    op.add_column(
        "transactions",
        sa.Column("billing_period", sa.String(10), nullable=False, server_default="monthly"),
    )

    # SQLite طول VARCHAR را اعمال نمی‌کند؛ فقط PostgreSQL نیاز به تغییر نوع ستون دارد.
    if bind.dialect.name == "postgresql":
        for table, col in _PLAN_COLUMNS:
            op.execute(
                f'ALTER TABLE {table} ALTER COLUMN {col} TYPE VARCHAR(50) USING {col}::text'
            )
        op.execute("DROP TYPE IF EXISTS planenum")


def downgrade() -> None:
    op.drop_column("transactions", "billing_period")
    op.drop_index("ix_plan_definitions_code", table_name="plan_definitions")
    op.drop_table("plan_definitions")
