"""Matching routes."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.matching.schemas import NearbyUserResponse
from app.features.matching.service import MatchingService

router = APIRouter(prefix="/matching", tags=["Matching"])
service = MatchingService()


@router.get("/nearby", response_model=list[NearbyUserResponse])
def get_nearby_users(
    limit: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_nearby_users(
        db,
        current_user_id=current_user.id,
        limit=limit,
    )
