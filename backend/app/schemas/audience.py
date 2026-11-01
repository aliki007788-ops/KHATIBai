from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field

class AudienceSessionCreate(BaseModel):
    duration_seconds: float = Field(ge=0, le=7200)
    avg_energy: float = Field(ge=0, le=100)
    peak_energy: float = Field(ge=0, le=100)
    engagement_score: float = Field(ge=0, le=100)
    silence_seconds: float = Field(ge=0, le=7200)
    audience_size: int = Field(default=12, ge=3, le=60)
    mode: str = Field(default="standard", max_length=32)
    notes: str | None = Field(default=None, max_length=2000)

class AudienceSessionResponse(BaseModel):
    id: str
    duration_seconds: float
    avg_energy: float
    peak_energy: float
    engagement_score: float
    silence_seconds: float
    audience_size: int
    mode: str
    notes: str | None
    created_at: datetime
    model_config = {"from_attributes": True}
