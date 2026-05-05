"""Thought repository layer."""
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.thoughts.models import Thought
from app.features.users.models import User


class ThoughtRepository:
    def create(self, db: Session, **kwargs) -> Thought:
        thought = Thought(**kwargs)
        db.add(thought)
        db.commit()
        db.refresh(thought)
        return thought

    def get_by_id(self, db: Session, thought_id: int) -> Thought | None:
        stmt = select(Thought).where(Thought.id == thought_id)
        return db.scalar(stmt)

    def list_by_user(self, db: Session, user_id: int) -> list[Thought]:
        stmt = (
            select(Thought)
            .where(Thought.user_id == user_id)
            .order_by(Thought.created_at.desc())
        )
        return list(db.scalars(stmt).all())

    def list_public(self, db: Session, limit: int = 20) -> list[Thought]:
        stmt = (
            select(Thought)
            .where(Thought.visibility == "public", Thought.status == "published")
            .order_by(Thought.created_at.desc())
            .limit(limit)
        )
        return list(db.scalars(stmt).all())

    def list_public_with_authors(self, db: Session, limit: int = 20) -> list[dict]:
        stmt = (
            select(
                Thought,
                User.username,
                User.display_name,
            )
            .join(User, User.id == Thought.user_id)
            .where(Thought.visibility == "public", Thought.status == "published")
            .order_by(Thought.created_at.desc())
            .limit(limit)
        )

        public_thoughts = []
        for thought, username, display_name in db.execute(stmt).all():
            public_thoughts.append(
                {
                    "id": thought.id,
                    "user_id": thought.user_id,
                    "content": thought.content,
                    "status": thought.status,
                    "visibility": thought.visibility,
                    "prompt_source": thought.prompt_source,
                    "created_at": thought.created_at,
                    "updated_at": thought.updated_at,
                    "username": username,
                    "display_name": display_name,
                }
            )

        return public_thoughts

    def update(self, db: Session, thought: Thought, **kwargs) -> Thought:
        for key, value in kwargs.items():
            setattr(thought, key, value)
        db.commit()
        db.refresh(thought)
        return thought

    def delete(self, db: Session, thought: Thought) -> None:
        db.delete(thought)
        db.commit()
