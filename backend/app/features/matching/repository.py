"""Matching repository layer."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.embeddings.models import UserEmbedding
from app.features.users.models import User


class MatchingRepository:
    def get_user_embedding_by_user_id(
        self,
        db: Session,
        user_id: int,
    ) -> UserEmbedding | None:
        stmt = select(UserEmbedding).where(UserEmbedding.user_id == user_id)
        return db.scalar(stmt)

    def get_nearby_users(
        self,
        db: Session,
        current_user_id: int,
        current_embedding: list[float],
        limit: int,
    ):
        distance = UserEmbedding.embedding.cosine_distance(current_embedding)

        stmt = (
            select(
                User.id.label("user_id"),
                User.username,
                User.display_name,
                distance.label("distance"),
            )
            .join(UserEmbedding, UserEmbedding.user_id == User.id)
            .where(UserEmbedding.user_id != current_user_id)
            .order_by(distance)
            .limit(limit)
        )

        return db.execute(stmt).all()
