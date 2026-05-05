"""User service layer."""

from sqlalchemy.orm import Session

from app.features.users.repository import UserRepository
from app.features.users.schemas import UserCreate


class UserService:
    def __init__(self):
        self.repo = UserRepository()

    def create_user(self, db: Session, payload: UserCreate):
        return self.repo.create(
            db,
            email=payload.email,
            username=payload.username,
            display_name=payload.display_name,
            password_hash=payload.password_hash,
        )

    def get_user(self, db: Session, user_id: int):
        return self.repo.get_by_id(db, user_id)

    def get_public_profile(self, db: Session, user_id: int):
        user = self.repo.get_by_id(db, user_id)
        if not user:
            return None

        thoughts = self.repo.list_public_thoughts_by_user(db, user_id)
        return {
            "user_id": user.id,
            "username": user.username,
            "display_name": user.display_name,
            "thoughts": thoughts,
        }

    def search_users(self, db: Session, query: str, limit: int = 10):
        if not query.strip():
            return []

        users = self.repo.search(db, query=query, limit=limit)
        return [
            {
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
            }
            for user in users
        ]

    def get_user_by_email(self, db: Session, email: str):
        return self.repo.get_by_email(db, email)

    def get_user_by_username(self, db: Session, username: str):
        return self.repo.get_by_username(db, username)

    def create_user_from_fields(
        self,
        db: Session,
        *,
        email: str,
        username: str,
        display_name: str,
        password_hash: str,
    ):
        return self.repo.create(
            db,
            email=email,
            username=username,
            display_name=display_name,
            password_hash=password_hash,
        )
