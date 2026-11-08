from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from app.core.models import ScenarioCategory, ScenarioProgressStatus


class LevelResponse(BaseModel):
    id: str
    code: str
    name_fa: str
    order_index: int
    description_fa: str | None
    unlocked: bool
    completed_count: int
    total_count: int


class ScenarioResponse(BaseModel):
    """نمای خلاصه برای فهرست سناریوهای یک سطح."""

    id: str
    slug: str | None = None
    category: ScenarioCategory
    order_index: int
    title_fa: str
    title_iq: str | None = None
    description_fa: str
    key_vocabulary: list
    difficulty: int | None = None
    estimated_minutes: int | None = None
    objectives: list[str] = []
    status: ScenarioProgressStatus
    unlocked: bool


class ScenarioDetailResponse(BaseModel):
    """نمای کامل یک سناریو (اهداف، واژگان، دیالوگ نمونه، خطاهای رایج و ...)."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    slug: str | None = None
    level_id: str
    level_code: str
    level_name_fa: str
    category: ScenarioCategory
    order_index: int
    title_fa: str
    title_iq: str | None = None
    situation: str
    objectives: list[str] = []
    key_vocabulary: list = []
    model_dialogue: list = []
    practice_prompt: str
    success_criteria: list[str] = []
    common_mistakes: list[str] = []
    cultural_note: str | None = None
    difficulty: int | None = None
    estimated_minutes: int | None = None
    status: ScenarioProgressStatus
    unlocked: bool
    min_messages_to_complete: int
    user_messages_count: int = 0
    conversation_id: str | None = None


class StartScenarioResponse(BaseModel):
    conversation_id: str


class DailyRecommendationResponse(BaseModel):
    kind: str
    title_fa: str
    description_fa: str
    action_scenario_id: str | None
    action_topic_label: str | None
