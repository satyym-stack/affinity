"""Security helpers."""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

BCRYPT_MAX_PASSWORD_BYTES = 72


def _password_bytes(password: str) -> bytes:
    password_bytes = password.encode("utf-8")
    if len(password_bytes) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError("Password cannot be longer than 72 bytes")
    return password_bytes


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(
            _password_bytes(plain_password),
            password_hash.encode("utf-8"),
        )
    except ValueError:
        return False


def create_access_token(data: dict) -> str:
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str):
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
