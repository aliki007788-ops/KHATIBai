"""audience_sessions table

Revision ID: h8c9d0e1f2a3
Revises: g7b8c9d0e1f2
Create Date: 2026-10-28 18:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision = "h8c9d0e1f2a3"
down_revision = "g7b8c9d0e1f2"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "audience_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("duration_seconds", sa.Float(), nullable=False, server_default="0"),
        sa.Column("avg_energy", sa.Float(), nullable=False, server_default="0"),
        sa.Column("peak_energy", sa.Float(), nullable=False, server_default="0"),
        sa.Column("engagement_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("silence_seconds", sa.Float(), nullable=False, server_default="0"),
        sa.Column("audience_size", sa.Integer(), nullable=False, server_default="12"),
        sa.Column("mode", sa.String(32), nullable=False, server_default="standard"),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_audience_sessions_user_id", "audience_sessions", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_audience_sessions_user_id", table_name="audience_sessions")
    op.drop_table("audience_sessions")
