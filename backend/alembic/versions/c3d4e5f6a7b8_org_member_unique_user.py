"""each user can belong to at most one organization (unique organization_members.user_id)

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-10-28 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    duplicates = bind.execute(
        sa.text("SELECT user_id FROM organization_members GROUP BY user_id HAVING COUNT(*) > 1")
    ).fetchall()
    if duplicates:
        raise RuntimeError(
            "کاربرانی عضو بیش از یک تیم هستند و باید قبل از مایگریشن دستی اصلاح شوند: "
            + ", ".join(str(row[0]) for row in duplicates)
        )

    op.drop_index("ix_organization_members_user_id", table_name="organization_members")
    op.create_index("ix_organization_members_user_id", "organization_members", ["user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_organization_members_user_id", table_name="organization_members")
    op.create_index("ix_organization_members_user_id", "organization_members", ["user_id"], unique=False)
