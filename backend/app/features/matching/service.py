"""Matching service layer."""

from sqlalchemy.orm import Session

from app.features.matching.repository import MatchingRepository
from app.features.matching.schemas import NearbyUserResponse


class MatchingService:
    def __init__(self):
        self.repo = MatchingRepository()

    def get_nearby_users(
        self,
        db: Session,
        current_user_id: int,
        limit: int = 10,
    ) -> list[NearbyUserResponse]:
        user_embedding = self.repo.get_user_embedding_by_user_id(db, current_user_id)
        if not user_embedding:
            return []

        rows = self.repo.get_nearby_users(
            db,
            current_user_id=current_user_id,
            current_embedding=list(user_embedding.embedding),
            limit=limit,
        )

        return [
            NearbyUserResponse(
                user_id=row.user_id,
                username=row.username,
                display_name=row.display_name,
                distance=float(row.distance),
            )
            for row in rows
        ]
