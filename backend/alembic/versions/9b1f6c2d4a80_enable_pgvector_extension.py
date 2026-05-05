"""enable pgvector extension

Revision ID: 9b1f6c2d4a80
Revises: 8d7bbd7d6f35
Create Date: 2026-04-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "9b1f6c2d4a80"
down_revision: Union[str, Sequence[str], None] = "8d7bbd7d6f35"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP EXTENSION IF EXISTS vector")
