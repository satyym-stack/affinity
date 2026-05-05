"""Auth schemas."""

from pydantic import BaseModel, EmailStr, Field


class SignupRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    display_name: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., min_length=8, max_length=255)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=255)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    display_name: str

    model_config = {"from_attributes": True}
