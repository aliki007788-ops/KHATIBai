"""add speech_shares and speech_comments (peer review / public feedback links)

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-10-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "speech_shares",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("speech_id", sa.String(length=36), sa.ForeignKey("speeches.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_by", sa.String(length=36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("share_token", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_speech_shares_speech_id", "speech_shares", ["speech_id"], unique=True)
    op.create_index("ix_speech_shares_share_token", "speech_shares", ["share_token"], unique=True)

    op.create_table(
        "speech_comments",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("share_id", sa.String(length=36), sa.ForeignKey("speech_shares.id", ondelete="CASCADE"), nullable=False),
        sa.Column("author_name", sa.String(length=100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_speech_comments_share_id", "speech_comments", ["share_id"])


def downgrade() -> None:
    op.drop_index("ix_speech_comments_share_id", table_name="speech_comments")
    op.drop_table("speech_comments")
    op.drop_index("ix_speech_shares_share_token", table_name="speech_shares")
    op.drop_index("ix_speech_shares_speech_id", table_name="speech_shares")
    op.drop_table("speech_shares")
