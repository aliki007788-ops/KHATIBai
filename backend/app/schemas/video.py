from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field

class VideoAnalysisCreate(BaseModel):
    title: str | None = Field(default=None, max_length=255)
    speech_id: str | None = None
    duration_seconds: float = Field(ge=0, le=3600)
    frames_sampled: int = Field(ge=0, le=100000)
    face_presence_pct: float = Field(ge=0, le=100)
    eye_contact_pct: float = Field(ge=0, le=100)
    looking_away_pct: float = Field(ge=0, le=100)
    stability_score: float = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)
    engine: str = Field(default="browser", max_length=64)
    metrics_json: dict | None = None
    tips: list[str] | None = None

class VideoAnalysisResponse(BaseModel):
    id: str
    title: str | None
    speech_id: str | None
    duration_seconds: float
    frames_sampled: int
    face_presence_pct: float
    eye_contact_pct: float
    looking_away_pct: float
    stability_score: float
    overall_score: int
    engine: str
    metrics_json: dict | None
    tips: list[str] | None
    created_at: datetime
    model_config = {"from_attributes": True}
