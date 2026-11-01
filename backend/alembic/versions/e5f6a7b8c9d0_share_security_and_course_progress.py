"""share security fields + course_week_progress

Revision ID: e5f6a7b8c9d0
Revises: d4e5f6a7b8c9
Create Date: 2026-10-28 15:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e5f6a7b8c9d0"
down_revision: Union[str, None] = "d4e5f6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # --- SpeechShare security columns ---
    with op.batch_alter_table("speech_shares") as batch:
        batch.add_column(sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True))
        batch.add_column(sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True))
        batch.add_column(
            sa.Column("show_transcript", sa.Boolean(), nullable=False, server_default=sa.true())
        )

    # --- Course week progress (server-side) ---
    op.create_table(
        "course_week_progress",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("path_id", sa.String(length=64), nullable=False),
        sa.Column("week_id", sa.String(length=64), nullable=False),
        sa.Column("quiz_score", sa.Integer(), nullable=True),
        sa.Column("quiz_total", sa.Integer(), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("user_id", "path_id", "week_id", name="uq_user_path_week"),
    )
    op.create_index("ix_course_week_progress_user_id", "course_week_progress", ["user_id"])
    op.create_index("ix_course_week_progress_path_id", "course_week_progress", ["path_id"])


def downgrade() -> None:
    op.drop_index("ix_course_week_progress_path_id", table_name="course_week_progress")
    op.drop_index("ix_course_week_progress_user_id", table_name="course_week_progress")
    op.drop_table("course_week_progress")

    with op.batch_alter_table("speech_shares") as batch:
        batch.drop_column("show_transcript")
        batch.drop_column("revoked_at")
        batch.drop_column("expires_at")
