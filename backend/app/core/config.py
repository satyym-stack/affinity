"""Application configuration."""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/affinity"
    SECRET_KEY: str = "change-this-dev-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    OPENAI_API_KEY: str | None = None
    EMBEDDING_PROVIDER: str = "local"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    EMBEDDING_DIMENSIONS: int = 384

    class Config:
        env_file = ".env"


settings = Settings()
