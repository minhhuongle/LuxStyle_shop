from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, examples=["johndoe"])
    email: EmailStr = Field(..., examples=["johndoe@example.com"])
    role: Literal["customer", "admin"] = Field(default="customer")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100, examples=["secret123"])


class UserLogin(BaseModel):
    email: EmailStr = Field(..., examples=["admin@store.com"])
    password: str = Field(..., min_length=6, examples=["admin123"])


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
