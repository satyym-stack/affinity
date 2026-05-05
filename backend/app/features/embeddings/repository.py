"""Embedding repository layer."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.features.embeddings.models import ThoughtEmbedding, UserEmbedding
from app.features.thoughts.models import Thought


class EmbeddingRepository:
    def get_thought_embedding_by_thought_id(
        self,
        db: Session,
        thought_id: int,
    ) -> ThoughtEmbedding | None:
        stmt = select(ThoughtEmbedding).where(ThoughtEmbedding.thought_id == thought_id)
        return db.scalar(stmt)

    def upsert_thought_embedding(
        self,
        db: Session,
        *,
        thought_id: int,
        embedding: list[float],
        model_name: str,
    ) -> ThoughtEmbedding:
        thought_embedding = self.get_thought_embedding_by_thought_id(db, thought_id)

        if thought_embedding:
            thought_embedding.embedding = embedding
            thought_embedding.model_name = model_name
        else:
            thought_embedding = ThoughtEmbedding(
                thought_id=thought_id,
                embedding=embedding,
                model_name=model_name,
            )
            db.add(thought_embedding)

        db.commit()
        db.refresh(thought_embedding)
        return thought_embedding

    def delete_thought_embedding_by_thought_id(self, db: Session, thought_id: int) -> None:
        thought_embedding = self.get_thought_embedding_by_thought_id(db, thought_id)
        if thought_embedding:
            db.delete(thought_embedding)
            db.commit()

    def get_eligible_thought_embeddings_for_user(
        self,
        db: Session,
        user_id: int,
    ) -> list[ThoughtEmbedding]:
        stmt = (
            select(ThoughtEmbedding)
            .join(Thought, Thought.id == ThoughtEmbedding.thought_id)
            .where(
                Thought.user_id == user_id,
                Thought.status == "published",
                Thought.visibility == "public",
            )
            .order_by(Thought.created_at.desc())
        )
        return list(db.scalars(stmt).all())

    def get_user_embedding_by_user_id(
        self,
        db: Session,
        user_id: int,
    ) -> UserEmbedding | None:
        stmt = select(UserEmbedding).where(UserEmbedding.user_id == user_id)
        return db.scalar(stmt)

    def upsert_user_embedding(
        self,
        db: Session,
        *,
        user_id: int,
        embedding: list[float],
        model_name: str,
    ) -> UserEmbedding:
        user_embedding = self.get_user_embedding_by_user_id(db, user_id)

        if user_embedding:
            user_embedding.embedding = embedding
            user_embedding.model_name = model_name
        else:
            user_embedding = UserEmbedding(
                user_id=user_id,
                embedding=embedding,
                model_name=model_name,
            )
            db.add(user_embedding)

        db.commit()
        db.refresh(user_embedding)
        return user_embedding

    def delete_user_embedding_by_user_id(self, db: Session, user_id: int) -> None:
        user_embedding = self.get_user_embedding_by_user_id(db, user_id)
        if user_embedding:
            db.delete(user_embedding)
            db.commit()
