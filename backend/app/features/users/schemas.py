"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=255)
    password_hash: str = Field(..., min_length=1, max_length=255)


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    display_name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserSearchResponse(BaseModel):
    user_id: int
    username: str
    display_name: str


class PublicProfileThoughtResponse(BaseModel):
    id: int
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class PublicUserProfileResponse(BaseModel):
    user_id: int
    username: str
    display_name: str
    thoughts: list[PublicProfileThoughtResponse]
