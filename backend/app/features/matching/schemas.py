"""Matching schemas."""

from pydantic import BaseModel


class NearbyUserResponse(BaseModel):
    user_id: int
    username: str
    display_name: str
    distance: float
