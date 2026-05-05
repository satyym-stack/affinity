"""Map position models."""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserMapPosition(Base):
    __tablename__ = "user_map_positions"
    __table_args__ = (
        UniqueConstraint("user_id", name="uq_user_map_positions_user_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    x: Mapped[float] = mapped_column(Float, nullable=False)
    y: Mapped[float] = mapped_column(Float, nullable=False)
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
