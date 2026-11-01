from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, Field, HttpUrl

class CreateMeetingRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    meeting_url: str = Field(min_length=8, max_length=1000)
    notes: str | None = Field(default=None, max_length=2000)
    focus: str | None = Field(default=None, max_length=64)

class EndMeetingRequest(BaseModel):
    notes: str | None = Field(default=None, max_length=2000)
    speech_id: str | None = None

class MeetingSessionResponse(BaseModel):
    id: str
    provider: str
    title: str
    meeting_url: str
    notes: str | None
    focus: str | None
    speech_id: str | None
    started_at: datetime
    ended_at: datetime | None
    created_at: datetime
    model_config = {"from_attributes": True}
