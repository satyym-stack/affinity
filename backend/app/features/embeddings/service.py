"""Embedding service layer."""

from sqlalchemy.orm import Session

from app.core.config import settings
from app.features.embeddings.models import ThoughtEmbedding, UserEmbedding
from app.features.embeddings.repository import EmbeddingRepository
from app.features.thoughts.repository import ThoughtRepository


class EmbeddingProvider:
    def __init__(self):
        self.provider = settings.EMBEDDING_PROVIDER
        self.model_name = settings.EMBEDDING_MODEL
        self.dimensions = settings.EMBEDDING_DIMENSIONS
        self._local_model = None

    def embed_text(self, text: str) -> list[float]:
        if self.provider == "openai":
            return self._embed_with_openai(text)

        return self._embed_with_local_model(text)

    def _embed_with_openai(self, text: str) -> list[float]:
        from openai import OpenAI

        if not settings.OPENAI_API_KEY:
            raise RuntimeError("OPENAI_API_KEY is required when EMBEDDING_PROVIDER=openai.")

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.embeddings.create(
            model=self.model_name,
            input=text,
            dimensions=self.dimensions,
            encoding_format="float",
        )
        return list(response.data[0].embedding)

    def _embed_with_local_model(self, text: str) -> list[float]:
        model = self._get_local_model()
        embedding = model.encode(
            text,
            normalize_embeddings=True,
        )
        return [float(value) for value in embedding]

    def _get_local_model(self):
        if self._local_model is None:
            from sentence_transformers import SentenceTransformer

            self._local_model = SentenceTransformer(self.model_name)

        return self._local_model


class EmbeddingService:
    def __init__(self):
        self.repo = EmbeddingRepository()
        self.thought_repo = ThoughtRepository()
        self.provider = EmbeddingProvider()

    def embed_thought(
        self,
        db: Session,
        thought_id: int,
    ) -> ThoughtEmbedding | None:
        thought = self.thought_repo.get_by_id(db, thought_id)
        if not thought:
            return None

        if not self._is_eligible_signal(thought):
            self.repo.delete_thought_embedding_by_thought_id(db, thought_id)
            self.recompute_user_embedding(db, thought.user_id)
            return None

        embedding = self.provider.embed_text(thought.content)
        thought_embedding = self.repo.upsert_thought_embedding(
            db,
            thought_id=thought.id,
            embedding=embedding,
            model_name=self.provider.model_name,
        )
        self.recompute_user_embedding(db, thought.user_id)
        return thought_embedding

    def recompute_user_embedding(
        self,
        db: Session,
        user_id: int,
    ) -> UserEmbedding | None:
        thought_embeddings = self.repo.get_eligible_thought_embeddings_for_user(
            db,
            user_id,
        )

        if not thought_embeddings:
            self.repo.delete_user_embedding_by_user_id(db, user_id)
            return None

        vectors = [list(thought_embedding.embedding) for thought_embedding in thought_embeddings]
        embedding = self._average_vectors(vectors)

        return self.repo.upsert_user_embedding(
            db,
            user_id=user_id,
            embedding=embedding,
            model_name=self.provider.model_name,
        )

    def get_user_embedding(self, db: Session, user_id: int) -> UserEmbedding | None:
        return self.repo.get_user_embedding_by_user_id(db, user_id)

    def _average_vectors(self, vectors: list[list[float]]) -> list[float]:
        vector_count = len(vectors)
        dimensions = len(vectors[0])
        return [
            sum(vector[index] for vector in vectors) / vector_count
            for index in range(dimensions)
        ]

    def _is_eligible_signal(self, thought) -> bool:
        return thought.status == "published" and thought.visibility == "public"
