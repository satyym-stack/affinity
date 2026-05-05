"""create user map positions

Revision ID: e4f1a2b3c4d5
Revises: b7c9d3e1f2a4
Create Date: 2026-05-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e4f1a2b3c4d5"
down_revision: Union[str, Sequence[str], None] = "b7c9d3e1f2a4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "user_map_positions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("x", sa.Float(), nullable=False),
        sa.Column("y", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_map_positions_user_id"),
    )
    op.create_index(
        op.f("ix_user_map_positions_id"),
        "user_map_positions",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_map_positions_user_id"),
        "user_map_positions",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(
        op.f("ix_user_map_positions_user_id"),
        table_name="user_map_positions",
    )
    op.drop_index(
        op.f("ix_user_map_positions_id"),
        table_name="user_map_positions",
    )
    op.drop_table("user_map_positions")
