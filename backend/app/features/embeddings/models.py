"""Embedding models."""

from datetime import datetime

from pgvector.sqlalchemy import Vector
from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.config import settings
from app.db.base import Base


class ThoughtEmbedding(Base):
    __tablename__ = "thought_embeddings"
    __table_args__ = (UniqueConstraint("thought_id", name="uq_thought_embeddings_thought_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    thought_id: Mapped[int] = mapped_column(
        ForeignKey("thoughts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    embedding: Mapped[list[float]] = mapped_column(
        Vector(settings.EMBEDDING_DIMENSIONS),
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class UserEmbedding(Base):
    __tablename__ = "user_embeddings"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_embeddings_user_id"),)

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    embedding: Mapped[list[float]] = mapped_column(
        Vector(settings.EMBEDDING_DIMENSIONS),
        nullable=False,
    )
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )
