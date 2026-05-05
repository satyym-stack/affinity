"""Map repository layer."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.embeddings.models import UserEmbedding
from app.features.map.models import UserMapPosition
from app.features.users.models import User


class MapRepository:
    def list_users_with_embeddings(self, db: Session):
        stmt = (
            select(
                User.id.label("user_id"),
                User.username,
                User.display_name,
                UserEmbedding.embedding,
            )
            .join(UserEmbedding, UserEmbedding.user_id == User.id)
            .order_by(User.id)
        )
        return db.execute(stmt).all()

    def get_position_by_user_id(
        self,
        db: Session,
        user_id: int,
    ) -> UserMapPosition | None:
        stmt = select(UserMapPosition).where(UserMapPosition.user_id == user_id)
        return db.scalar(stmt)

    def upsert_position(
        self,
        db: Session,
        *,
        user_id: int,
        x: float,
        y: float,
    ) -> UserMapPosition:
        position = self.get_position_by_user_id(db, user_id)

        if position:
            position.x = x
            position.y = y
        else:
            position = UserMapPosition(user_id=user_id, x=x, y=y)
            db.add(position)

        return position

    def commit_positions(self, db: Session) -> None:
        db.commit()

    def list_map_users(self, db: Session):
        stmt = (
            select(
                User.id.label("user_id"),
                User.username,
                User.display_name,
                UserMapPosition.x,
                UserMapPosition.y,
            )
            .join(UserMapPosition, UserMapPosition.user_id == User.id)
            .order_by(User.id)
        )
        return db.execute(stmt).all()
