from __future__ import annotations

from pydantic import BaseModel

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
    id: str
    slug: str | None = None
    category: ScenarioCategory
    order_index: int
    title_fa: str
    title_iq: str | None = None
    description_fa: str
    situation: str | None = None
    objectives: list = []
    key_vocabulary: list = []
    model_dialogue: list = []
    success_criteria: list = []
    common_mistakes: list = []
    cultural_note: str | None = None
    difficulty: int = 1
    estimated_minutes: int = 8
    status: ScenarioProgressStatus
    unlocked: bool


class StartScenarioResponse(BaseModel):
    conversation_id: str


class DailyRecommendationResponse(BaseModel):
    kind: str
    title_fa: str
    description_fa: str
    action_scenario_id: str | None
    action_topic_label: str | None