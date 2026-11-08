from __future__ import annotations

from pydantic import BaseModel, Field, field_validator

from app.core.models import ScenarioCategory


class AdminLevelRow(BaseModel):
    id: str
    code: str
    name_fa: str
    description_fa: str | None
    order_index: int
    active_count: int
    inactive_count: int


class AdminScenarioRow(BaseModel):
    id: str
    slug: str | None
    level_code: str
    level_name_fa: str
    order_index: int
    title_fa: str
    title_iq: str | None
    category: ScenarioCategory
    difficulty: int | None
    estimated_minutes: int | None
    active: bool
    vocab_count: int
    needs_review_count: int
    edited_by_admin: bool


class AdminScenarioFull(AdminScenarioRow):
    situation: str | None
    objectives: list[str]
    key_vocabulary: list
    model_dialogue: list
    practice_prompt: str
    success_criteria: list[str]
    common_mistakes: list[str]
    cultural_note: str | None
    needs_review: list


class VocabItemIn(BaseModel):
    iq: str = Field(min_length=1, max_length=120)
    fa: str = Field(min_length=1, max_length=200)
    example_iq: str = Field(default="", max_length=400)
    example_fa: str = Field(default="", max_length=400)


class DialogueTurnIn(BaseModel):
    who: str = Field(max_length=20)
    iq: str = Field(max_length=600)
    fa: str = Field(max_length=600)


class AdminScenarioUpdate(BaseModel):
    title_fa: str | None = Field(default=None, min_length=2, max_length=255)
    title_iq: str | None = Field(default=None, max_length=255)
    category: ScenarioCategory | None = None
    situation: str | None = Field(default=None, min_length=10, max_length=3000)
    practice_prompt: str | None = Field(default=None, min_length=2, max_length=3000)
    objectives: list[str] | None = Field(default=None, max_length=10)
    success_criteria: list[str] | None = Field(default=None, max_length=10)
    common_mistakes: list[str] | None = Field(default=None, max_length=10)
    cultural_note: str | None = Field(default=None, max_length=3000)
    key_vocabulary: list[VocabItemIn] | None = Field(default=None, max_length=40)
    model_dialogue: list[DialogueTurnIn] | None = Field(default=None, max_length=40)
    difficulty: int | None = Field(default=None, ge=1, le=5)
    estimated_minutes: int | None = Field(default=None, ge=1, le=60)
    active: bool | None = None

    @field_validator("objectives", "success_criteria", "common_mistakes")
    @classmethod
    def _clean_lines(cls, v: list[str] | None) -> list[str] | None:
        if v is None:
            return v
        return [x.strip()[:500] for x in v if x and x.strip()]


class AdminVocabRow(BaseModel):
    iq: str
    fa: str
    example_iq: str = ""
    scenario_id: str
    scenario_title: str
    slug: str | None
    level_code: str


class AdminVocabPage(BaseModel):
    total: int
    items: list[AdminVocabRow]


class TranscribeResponse(BaseModel):
    text: str
