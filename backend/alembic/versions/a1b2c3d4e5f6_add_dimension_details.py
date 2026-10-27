"""add dimension_details to speech_analyses

Revision ID: a1b2c3d4e5f6
Revises: dc82e8526380
Create Date: 2026-10-25 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = 'dc82e8526380'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "speech_analyses",
        sa.Column("dimension_details", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("speech_analyses", "dimension_details")
