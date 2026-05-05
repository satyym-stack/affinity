"""Map schemas."""

from pydantic import BaseModel


class MapRecomputeResponse(BaseModel):
    updated_count: int
    message: str


class MapUserResponse(BaseModel):
    user_id: int
    username: str
    display_name: str
    x: float
    y: float
