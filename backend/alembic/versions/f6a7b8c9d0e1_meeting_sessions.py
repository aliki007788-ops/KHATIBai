"""meeting_sessions table

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-10-28 16:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "meeting_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.Enum("zoom", "meet", "other", name="meetingprovider"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("meeting_url", sa.String(1000), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("focus", sa.String(64), nullable=True),
        sa.Column("speech_id", sa.String(36), sa.ForeignKey("speeches.id", ondelete="SET NULL"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_meeting_sessions_user_id", "meeting_sessions", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_meeting_sessions_user_id", table_name="meeting_sessions")
    op.drop_table("meeting_sessions")
    op.execute("DROP TYPE IF EXISTS meetingprovider")
