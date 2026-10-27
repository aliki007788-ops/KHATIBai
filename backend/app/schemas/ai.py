"""
Structured output schemas for AI responses.
"""
from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

# ۱۲ بعد تحلیل متنی سخنرانی (گزینه A)
SPEECH_DIMENSION_KEYS: list[str] = [
    "content",       # محتوا
    "structure",     # ساختار (مقدمه/بدنه/نتیجه)
    "coherence",     # انسجام منطقی
    "clarity",       # وضوح
    "vocabulary",    # دایره لغات
    "grammar",       # گرامر
    "persuasion",    # اقناع
    "emotion",       # بار احساسی
    "engagement",    # تعامل با مخاطب
    "depth",         # عمق موضوع
    "conclusion",    # نتیجه‌گیری
    "confidence",    # اعتماد به نفس (از کلمات قاطع/مردد)
]


class DimensionScore(BaseModel):
    score: int = Field(ge=0, le=100)
    explanation: str = Field(max_length=300)


class SpeechAnalysisResponse(BaseModel):
    score: int = Field(ge=0, le=100, description="Overall speech quality score, 0-100")
    dimensions: dict[str, DimensionScore]
    strengths: list[str] = Field(default_factory=list, max_length=10)
    weaknesses: list[str] = Field(default_factory=list, max_length=10)
    improvements: list[str] = Field(default_factory=list, max_length=10)
    structure_notes: str = Field(max_length=1000)
    next_practice: str = Field(max_length=500)

    @field_validator("strengths", "weaknesses", "improvements")
    @classmethod
    def non_empty_strings(cls, v: list[str]) -> list[str]:
        return [s.strip() for s in v if s and s.strip()]

    @field_validator("dimensions")
    @classmethod
    def must_cover_all_dimensions(cls, v: dict[str, DimensionScore]) -> dict[str, DimensionScore]:
        missing = [k for k in SPEECH_DIMENSION_KEYS if k not in v]
        if missing:
            raise ValueError(f"Missing required dimensions: {missing}")
        return v


class ChatReplyResponse(BaseModel):
    reply: str = Field(max_length=2000)
    corrections: list[str] = Field(default_factory=list, max_length=10)
    notes: str | None = Field(default=None, max_length=500)


class TranslationResponse(BaseModel):
    translated_text: str = Field(max_length=3000)
    notes: str | None = Field(default=None, max_length=500)


class TranscriptionResponse(BaseModel):
    text: str
    duration_seconds: float | None = None
    language: str | None = None


class PracticeSuggestionResponse(BaseModel):
    """پیشنهاد موضوع/متن تمرین با هوش مصنوعی، متناسب با حالت و سطح کاربر."""
    title: str = Field(max_length=200)
    prompt_text: str = Field(max_length=2000)
    guidance: str = Field(max_length=500)
