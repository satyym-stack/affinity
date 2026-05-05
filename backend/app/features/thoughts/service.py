"""Thought service layer."""
from sqlalchemy.orm import Session

from app.features.embeddings.service import EmbeddingService
from app.features.thoughts.repository import ThoughtRepository
from app.features.thoughts.schemas import ThoughtCreate, ThoughtUpdate


class ThoughtService:
    def __init__(self, sync_embeddings: bool = True):
        self.repo = ThoughtRepository()
        self.embedding_service = EmbeddingService() if sync_embeddings else None

    def create_thought(self, db: Session, user_id: int, payload: ThoughtCreate):
        thought = self.repo.create(
            db,
            user_id=user_id,
            content=payload.content,
            status=payload.status,
            visibility=payload.visibility,
            prompt_source=payload.prompt_source,
        )
        self._sync_embeddings_for_thought(db, thought.id)
        return thought

    def get_thought(self, db: Session, thought_id: int):
        return self.repo.get_by_id(db, thought_id)

    def list_user_thoughts(self, db: Session, user_id: int):
        return self.repo.list_by_user(db, user_id)

    def list_public_thoughts(self, db: Session, limit: int = 20):
        return self.repo.list_public_with_authors(db, limit=limit)

    def update_thought(self, db: Session, thought, payload: ThoughtUpdate):
        update_data = payload.model_dump(exclude_unset=True)
        updated_thought = self.repo.update(db, thought, **update_data)
        self._sync_embeddings_for_thought(db, updated_thought.id)
        return updated_thought

    def delete_thought(self, db: Session, thought):
        user_id = thought.user_id
        self.repo.delete(db, thought)
        if self.embedding_service:
            # MVP sync path; move this recompute to a background worker later.
            self.embedding_service.recompute_user_embedding(db, user_id)

    def _sync_embeddings_for_thought(self, db: Session, thought_id: int):
        if self.embedding_service:
            # MVP sync path; move thought embedding jobs to Celery later.
            self.embedding_service.embed_thought(db, thought_id)
