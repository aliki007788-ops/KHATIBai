from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class CreateOrganizationRequest(BaseModel):
    name: str = Field(min_length=2, max_length=255)

    @field_validator("name")
    @classmethod
    def strip_and_check_name(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("نام تیم باید حداقل ۲ نویسه باشد.")
        return v


class JoinOrganizationRequest(BaseModel):
    invite_code: str = Field(min_length=4, max_length=16)


class TargetUserRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=36)


class SetMemberRoleRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=36)
    role: str = Field(pattern="^(manager|member)$")


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
    # ایمیل فقط برای مالک/مدیر برگردانده می‌شود؛ برای اعضای ساده None است.
    email: str | None
    role: str
    joined_at: datetime
    practice_count: int
    average_score: float | None
    best_score: int | None
    last_active_at: datetime | None
