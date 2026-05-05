"""use 384 dim local embeddings

Revision ID: f6a7b8c9d0e1
Revises: e4f1a2b3c4d5
Create Date: 2026-05-04 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from pgvector.sqlalchemy import Vector


# revision identifiers, used by Alembic.
revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "e4f1a2b3c4d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("DELETE FROM user_map_positions")
    op.execute("DELETE FROM user_embeddings")
    op.execute("DELETE FROM thought_embeddings")
    op.alter_column(
        "thought_embeddings",
        "embedding",
        type_=Vector(384),
        existing_type=Vector(1536),
    )
    op.alter_column(
        "user_embeddings",
        "embedding",
        type_=Vector(384),
        existing_type=Vector(1536),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DELETE FROM user_map_positions")
    op.execute("DELETE FROM user_embeddings")
    op.execute("DELETE FROM thought_embeddings")
    op.alter_column(
        "thought_embeddings",
        "embedding",
        type_=Vector(1536),
        existing_type=Vector(384),
    )
    op.alter_column(
        "user_embeddings",
        "embedding",
        type_=Vector(1536),
        existing_type=Vector(384),
    )
