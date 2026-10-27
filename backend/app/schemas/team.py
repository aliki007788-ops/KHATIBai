from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CreateOrganizationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)


class JoinOrganizationRequest(BaseModel):
    invite_code: str = Field(min_length=4, max_length=16)


class OrganizationResponse(BaseModel):
    id: str
    name: str
    invite_code: str
    role: str  # نقش کاربر فعلی در این سازمان
    member_count: int
    created_at: datetime


class MemberProgressResponse(BaseModel):
    user_id: str
    name: str | None
    email: str
    role: str
    joined_at: datetime
    practice_count: int
    average_score: float | None
    best_score: int | None
    last_active_at: datetime | None
