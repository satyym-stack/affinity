"""User routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.users.schemas import (
    PublicUserProfileResponse,
    UserResponse,
    UserSearchResponse,
)
from app.features.users.service import UserService

router = APIRouter(prefix="/users", tags=["Users"])
service = UserService()


@router.get("/search", response_model=list[UserSearchResponse])
def search_users(
    q: str = "",
    limit: int = 10,
    db: Session = Depends(get_db),
):
    return service.search_users(db, query=q, limit=limit)


@router.get("/{user_id}/public-profile", response_model=PublicUserProfileResponse)
def get_public_profile(
    user_id: int,
    db: Session = Depends(get_db),
):
    profile = service.get_public_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    return profile


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    user = service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
