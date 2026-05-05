"""User repository layer."""

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.features.thoughts.models import Thought
from app.features.users.models import User


class UserRepository:
    def create(self, db: Session, **kwargs) -> User:
        user = User(**kwargs)
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def get_by_id(self, db: Session, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        return db.scalar(stmt)

    def get_by_email(self, db: Session, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return db.scalar(stmt)

    def get_by_username(self, db: Session, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        return db.scalar(stmt)

    def search(self, db: Session, query: str, limit: int = 10) -> list[User]:
        search_text = f"%{query.strip()}%"
        stmt = (
            select(User)
            .where(
                or_(
                    User.username.ilike(search_text),
                    User.display_name.ilike(search_text),
                )
            )
            .order_by(User.display_name.asc(), User.username.asc())
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    def list_public_thoughts_by_user(
        self,
        db: Session,
        user_id: int,
    ) -> list[Thought]:
        stmt = (
            select(Thought)
            .where(
                Thought.user_id == user_id,
                Thought.status == "published",
                Thought.visibility == "public",
            )
            .order_by(Thought.created_at.desc())
        )
        return list(db.scalars(stmt).all())
