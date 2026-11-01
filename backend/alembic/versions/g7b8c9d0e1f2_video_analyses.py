"""video_analyses table

Revision ID: g7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-10-28 17:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision = "g7b8c9d0e1f2"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "video_analyses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("speech_id", sa.String(36), sa.ForeignKey("speeches.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(255), nullable=True),
        sa.Column("duration_seconds", sa.Float(), nullable=False, server_default="0"),
        sa.Column("frames_sampled", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("face_presence_pct", sa.Float(), nullable=False, server_default="0"),
        sa.Column("eye_contact_pct", sa.Float(), nullable=False, server_default="0"),
        sa.Column("looking_away_pct", sa.Float(), nullable=False, server_default="0"),
        sa.Column("stability_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("overall_score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("engine", sa.String(64), nullable=False, server_default="browser"),
        sa.Column("metrics_json", sa.JSON(), nullable=True),
        sa.Column("tips", sa.JSON(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_video_analyses_user_id", "video_analyses", ["user_id"])

def downgrade() -> None:
    op.drop_index("ix_video_analyses_user_id", table_name="video_analyses")
    op.drop_table("video_analyses")
