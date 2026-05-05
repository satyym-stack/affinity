"""Thought schemas."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ThoughtCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    status: str = Field(default="draft")
    visibility: str = Field(default="private")
    prompt_source: Optional[str] = None


class ThoughtUpdate(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    status: Optional[str] = None
    visibility: Optional[str] = None
    prompt_source: Optional[str] = None


class ThoughtResponse(BaseModel):
    id: int
    user_id: int
    content: str
    status: str
    visibility: str
    prompt_source: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PublicThoughtResponse(ThoughtResponse):
    username: str
    display_name: str
