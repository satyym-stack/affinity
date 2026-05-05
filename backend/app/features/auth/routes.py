"""Auth routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.features.auth.schemas import (
    AuthUserResponse,
    LoginRequest,
    SignupRequest,
    TokenResponse,
)
from app.features.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])
service = AuthService()


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token = service.signup(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    return TokenResponse(access_token=access_token)


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
):
    try:
        access_token = service.login(db, payload)
    except ValueError as error:
        raise HTTPException(status_code=401, detail=str(error))

    return TokenResponse(access_token=access_token)


@router.get("/me", response_model=AuthUserResponse)
def get_me(current_user=Depends(get_current_user)):
    return current_user
