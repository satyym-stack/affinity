"""create embedding tables

Revision ID: b7c9d3e1f2a4
Revises: 9b1f6c2d4a80
Create Date: 2026-04-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from pgvector.sqlalchemy import Vector
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b7c9d3e1f2a4"
down_revision: Union[str, Sequence[str], None] = "9b1f6c2d4a80"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "thought_embeddings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("thought_id", sa.Integer(), nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("model_name", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["thought_id"], ["thoughts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("thought_id", name="uq_thought_embeddings_thought_id"),
    )
    op.create_index(
        op.f("ix_thought_embeddings_id"),
        "thought_embeddings",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_thought_embeddings_thought_id"),
        "thought_embeddings",
        ["thought_id"],
        unique=False,
    )

    op.create_table(
        "user_embeddings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("embedding", Vector(1536), nullable=False),
        sa.Column("model_name", sa.String(length=100), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", name="uq_user_embeddings_user_id"),
    )
    op.create_index(
        op.f("ix_user_embeddings_id"),
        "user_embeddings",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_user_embeddings_user_id"),
        "user_embeddings",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_user_embeddings_user_id"), table_name="user_embeddings")
    op.drop_index(op.f("ix_user_embeddings_id"), table_name="user_embeddings")
    op.drop_table("user_embeddings")

    op.drop_index(op.f("ix_thought_embeddings_thought_id"), table_name="thought_embeddings")
    op.drop_index(op.f("ix_thought_embeddings_id"), table_name="thought_embeddings")
    op.drop_table("thought_embeddings")
