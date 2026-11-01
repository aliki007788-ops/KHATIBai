from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class MarkWeekRequest(BaseModel):
    path_id: str = Field(min_length=1, max_length=64)
    week_id: str = Field(min_length=1, max_length=64)
    quiz_score: int | None = Field(default=None, ge=0)
    quiz_total: int | None = Field(default=None, ge=0)


class WeekProgressItem(BaseModel):
    path_id: str
    week_id: str
    quiz_score: int | None
    quiz_total: int | None
    completed_at: datetime

    model_config = {"from_attributes": True}


class PathProgressResponse(BaseModel):
    path_id: str
    completed_week_ids: list[str]
    items: list[WeekProgressItem]
