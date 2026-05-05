"""Shared FastAPI dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.features.users.service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
user_service = UserService()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    subject = payload.get("sub")
    if subject is None:
        raise credentials_exception

    try:
        user_id = int(subject)
    except (TypeError, ValueError):
        raise credentials_exception

    user = user_service.get_user(db, user_id)
    if not user:
        raise credentials_exception

    return user
