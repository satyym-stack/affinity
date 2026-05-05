"""Embedding debug routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.embeddings.service import EmbeddingService
from app.features.thoughts.service import ThoughtService

router = APIRouter(prefix="/embeddings", tags=["Embeddings"])
service = EmbeddingService()
thought_service = ThoughtService(sync_embeddings=False)


@router.post("/thoughts/{thought_id}/recompute")
def recompute_thought_embedding(
    thought_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    thought = thought_service.get_thought(db, thought_id)
    if not thought:
        raise HTTPException(status_code=404, detail="Thought not found")

    if thought.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")

    thought_embedding = service.embed_thought(db, thought_id)
    return {
        "thought_id": thought_id,
        "embedded": thought_embedding is not None,
        "dimensions": len(thought_embedding.embedding) if thought_embedding else 0,
    }


@router.post("/users/me/recompute")
def recompute_my_user_embedding(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_embedding = service.recompute_user_embedding(db, current_user.id)
    return {
        "user_id": current_user.id,
        "embedded": user_embedding is not None,
        "dimensions": len(user_embedding.embedding) if user_embedding else 0,
    }


@router.get("/users/me")
def get_my_user_embedding(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_embedding = service.get_user_embedding(db, current_user.id)
    if not user_embedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User embedding not found",
        )

    return {
        "id": user_embedding.id,
        "user_id": user_embedding.user_id,
        "model_name": user_embedding.model_name,
        "dimensions": len(user_embedding.embedding),
        "created_at": user_embedding.created_at,
        "updated_at": user_embedding.updated_at,
    }
