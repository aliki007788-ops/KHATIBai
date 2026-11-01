from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


class CreateConversationRequest(BaseModel):
    title: str | None = Field(default=None, max_length=255)


class SendMessageRequest(BaseModel):
    text: str = Field(min_length=1, max_length=2000)


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageWithFeedbackResponse(MessageResponse):
    """Returned by POST /messages so the client can render structured coaching feedback."""
    corrections: list[str] = []
    suggestions: list[str] = []
    vocabulary: list[str] = []
    notes: str | None = None


class ConversationResponse(BaseModel):
    id: str
    title: str | None
    summary: str | None
    created_at: datetime
    updated_at: datetime
    messages: list[MessageResponse] = []

    model_config = {"from_attributes": True}


class ConversationListItem(BaseModel):
    id: str
    title: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
