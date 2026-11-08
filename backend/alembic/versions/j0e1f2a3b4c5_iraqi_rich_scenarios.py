"""iraqi scenarios: rich curriculum columns (idempotent)

Revision ID: j0e1f2a3b4c5
Revises: i9d0e1f2a3b4
Create Date: 2026-11-08 09:00:00.000000

فقط ستون‌هایی را اضافه می‌کند که هنوز در جدول نیستند (دیتابیس ممکن است بخشی از آن‌ها را از قبل داشته باشد).
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision = "j0e1f2a3b4c5"
down_revision = "i9d0e1f2a3b4"
branch_labels = None
depends_on = None

_COLUMNS = [
    ("slug", sa.String(64)),
    ("title_iq", sa.String(255)),
    ("situation", sa.Text()),
    ("objectives", sa.JSON()),
    ("success_criteria", sa.JSON()),
    ("common_mistakes", sa.JSON()),
    ("model_dialogue", sa.JSON()),
    ("cultural_note", sa.Text()),
    ("needs_review", sa.JSON()),
    ("difficulty", sa.Integer()),
    ("estimated_minutes", sa.Integer()),
    ("content_version", sa.Integer()),
]


def upgrade() -> None:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    existing = {c["name"] for c in insp.get_columns("iraqi_scenarios")}
    missing = [(n, t) for n, t in _COLUMNS if n not in existing]
    if missing:
        with op.batch_alter_table("iraqi_scenarios") as batch:
            for name, typ in missing:
                batch.add_column(sa.Column(name, typ, nullable=True))

    indexes = {i["name"] for i in sa.inspect(bind).get_indexes("iraqi_scenarios")}
    if "ix_iraqi_scenarios_slug" not in indexes:
        op.create_index("ix_iraqi_scenarios_slug", "iraqi_scenarios", ["slug"], unique=True)


def downgrade() -> None:
    # عمداً خالی: ستون‌ها ممکن است قبل از این مهاجرت هم وجود داشته باشند و حذفشان داده را از بین می‌برد.
    pass
