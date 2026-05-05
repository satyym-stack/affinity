"""Auth service layer."""

from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.features.auth.schemas import LoginRequest, SignupRequest
from app.features.users.service import UserService


class AuthService:
    def __init__(self):
        self.user_service = UserService()

    def signup(self, db: Session, payload: SignupRequest):
        existing_user = self.user_service.get_user_by_email(db, payload.email)
        if existing_user:
            raise ValueError("Email is already in use")

        existing_username = self.user_service.get_user_by_username(db, payload.username)
        if existing_username:
            raise ValueError("Username is already in use")

        user = self.user_service.create_user_from_fields(
            db,
            email=payload.email,
            username=payload.username,
            display_name=payload.display_name,
            password_hash=hash_password(payload.password),
        )
        return create_access_token({"sub": str(user.id)})

    def login(self, db: Session, payload: LoginRequest):
        user = self.user_service.get_user_by_email(db, payload.email)
        if not user:
            raise ValueError("Invalid email or password")

        if not verify_password(payload.password, user.password_hash):
            raise ValueError("Invalid email or password")

        return create_access_token({"sub": str(user.id)})
