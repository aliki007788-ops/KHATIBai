"""
Learning Engine — Iraqi Arabic level/scenario curriculum.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import (
    Conversation,
    IraqiScenario,
    LearningLevel,
    Message,
    MessageRole,
    ScenarioProgressStatus,
    User,
    UserLearningState,
    UserScenarioProgress,
)
from app.services import progress_engine

LEVEL_UNLOCK_THRESHOLD = 0.6
MIN_USER_MESSAGES_TO_COMPLETE = 3
# چند سناریوی بعد از آخرین سناریوی تکمیل‌شده هم باز باشد (یادگیرنده گیر نمی‌افتد)
SCENARIO_LOOKAHEAD = 2


class LearningEngineError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


@dataclass
class ScenarioWithStatus:
    scenario: IraqiScenario
    status: ScenarioProgressStatus
    unlocked: bool


@dataclass
class LevelWithProgress:
    level: LearningLevel
    unlocked: bool
    completed_count: int
    total_count: int


def _active_scenarios(level: LearningLevel) -> list[IraqiScenario]:
    """فقط سناریوهای فعال، به ترتیب order_index (سناریوهای قدیمی غیرفعال نمایش داده نمی‌شوند)."""
    return sorted((s for s in level.scenarios if s.active), key=lambda s: s.order_index)


def _completed_scenario_ids(db: Session, user_id: str) -> set[str]:
    rows = db.execute(
        select(UserScenarioProgress.scenario_id).where(
            UserScenarioProgress.user_id == user_id,
            UserScenarioProgress.status == ScenarioProgressStatus.completed,
        )
    ).scalars().all()
    return set(rows)


def get_levels_with_progress(db: Session, user_id: str) -> list[LevelWithProgress]:
    levels = db.execute(select(LearningLevel).order_by(LearningLevel.order_index)).scalars().all()
    completed_ids = _completed_scenario_ids(db, user_id)

    result: list[LevelWithProgress] = []
    previous_unlocked_and_sufficient = True

    for level in levels:
        scenarios = _active_scenarios(level)
        total = len(scenarios)
        completed = sum(1 for s in scenarios if s.id in completed_ids)

        unlocked = previous_unlocked_and_sufficient
        result.append(LevelWithProgress(level=level, unlocked=unlocked, completed_count=completed, total_count=total))

        ratio = (completed / total) if total > 0 else 0
        previous_unlocked_and_sufficient = unlocked and ratio >= LEVEL_UNLOCK_THRESHOLD

    return result


def get_scenarios_for_level(db: Session, user_id: str, level_id: str) -> list[ScenarioWithStatus]:
    level = db.get(LearningLevel, level_id)
    if level is None:
        raise LearningEngineError("سطح یافت نشد.")

    scenarios = _active_scenarios(level)
    progress_rows = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user_id,
            UserScenarioProgress.scenario_id.in_([s.id for s in scenarios]),
        )
    ).scalars().all()
    progress_by_scenario = {p.scenario_id: p.status for p in progress_rows}

    completed_count = sum(1 for st in progress_by_scenario.values() if st == ScenarioProgressStatus.completed)

    result: list[ScenarioWithStatus] = []
    for index, scenario in enumerate(scenarios):
        status = progress_by_scenario.get(scenario.id, ScenarioProgressStatus.not_started)
        unlocked = status != ScenarioProgressStatus.not_started or index <= completed_count + SCENARIO_LOOKAHEAD
        result.append(ScenarioWithStatus(scenario=scenario, status=status, unlocked=unlocked))

    return result


@dataclass
class ScenarioDetail:
    scenario: IraqiScenario
    level: LearningLevel
    status: ScenarioProgressStatus
    unlocked: bool
    user_messages_count: int
    conversation_id: str | None


def _count_user_messages(db: Session, conversation_id: str | None) -> int:
    if not conversation_id:
        return 0
    return len(
        db.execute(
            select(Message.id).where(
                Message.conversation_id == conversation_id,
                Message.role == MessageRole.user,
            )
        ).scalars().all()
    )


def get_scenario_detail(db: Session, user_id: str, scenario_id: str) -> ScenarioDetail:
    scenario = db.get(IraqiScenario, scenario_id)
    if scenario is None or not scenario.active:
        raise LearningEngineError("سناریو یافت نشد.")
    level = db.get(LearningLevel, scenario.level_id)
    siblings = get_scenarios_for_level(db, user_id, scenario.level_id)
    item = next((i for i in siblings if i.scenario.id == scenario.id), None)
    progress = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user_id,
            UserScenarioProgress.scenario_id == scenario.id,
        )
    ).scalar_one_or_none()
    conv_id = progress.conversation_id if progress else None
    return ScenarioDetail(
        scenario=scenario,
        level=level,
        status=item.status if item else ScenarioProgressStatus.not_started,
        unlocked=item.unlocked if item else False,
        user_messages_count=_count_user_messages(db, conv_id),
        conversation_id=conv_id,
    )


def get_scenario_for_conversation(db: Session, user_id: str, conversation_id: str) -> ScenarioDetail | None:
    progress = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user_id,
            UserScenarioProgress.conversation_id == conversation_id,
        )
    ).scalars().first()
    if progress is None:
        return None
    try:
        return get_scenario_detail(db, user_id, progress.scenario_id)
    except LearningEngineError:
        return None


def start_scenario(db: Session, user: User, scenario_id: str) -> Conversation:
    scenario = db.get(IraqiScenario, scenario_id)
    if scenario is None or not scenario.active:
        raise LearningEngineError("سناریو یافت نشد.")

    detail = get_scenario_detail(db, user.id, scenario_id)
    if not detail.unlocked:
        raise LearningEngineError("این سناریو هنوز قفل است؛ ابتدا سناریوهای قبلی را تکمیل کنید.")

    existing = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user.id,
            UserScenarioProgress.scenario_id == scenario_id,
        )
    ).scalar_one_or_none()

    if existing and existing.conversation_id:
        conv = db.get(Conversation, existing.conversation_id)
        if conv is not None:
            return conv

    conv = Conversation(user_id=user.id, title=scenario.title_fa)
    db.add(conv)
    db.flush()

    opening = Message(
        conversation_id=conv.id,
        role=MessageRole.assistant,
        content=scenario.practice_prompt,
    )
    db.add(opening)

    if existing:
        existing.conversation_id = conv.id
        existing.status = ScenarioProgressStatus.in_progress
        existing.started_at = existing.started_at or datetime.now(timezone.utc)
    else:
        db.add(UserScenarioProgress(
            user_id=user.id,
            scenario_id=scenario_id,
            conversation_id=conv.id,
            status=ScenarioProgressStatus.in_progress,
            started_at=datetime.now(timezone.utc),
        ))

    db.commit()
    db.refresh(conv)
    return conv


def complete_scenario(db: Session, user: User, scenario_id: str) -> None:
    progress = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user.id,
            UserScenarioProgress.scenario_id == scenario_id,
        )
    ).scalar_one_or_none()

    if progress is None or progress.conversation_id is None:
        raise LearningEngineError("ابتدا باید تمرین این سناریو را شروع کنید.")

    user_messages = db.execute(
        select(Message).where(
            Message.conversation_id == progress.conversation_id,
            Message.role == MessageRole.user,
        )
    ).scalars().all()

    if len(user_messages) < MIN_USER_MESSAGES_TO_COMPLETE:
        raise LearningEngineError(
            f"برای تکمیل این سناریو، حداقل باید {MIN_USER_MESSAGES_TO_COMPLETE} پیام رد و بدل کنید."
        )

    progress.status = ScenarioProgressStatus.completed
    progress.completed_at = datetime.now(timezone.utc)
    db.commit()


@dataclass
class DailyPracticeRecommendation:
    kind: str
    title_fa: str
    description_fa: str
    action_scenario_id: str | None = None
    action_topic_label: str | None = None


def get_daily_recommendation(db: Session, user: User) -> DailyPracticeRecommendation:
    in_progress = db.execute(
        select(UserScenarioProgress).where(
            UserScenarioProgress.user_id == user.id,
            UserScenarioProgress.status == ScenarioProgressStatus.in_progress,
        )
    ).scalars().first()

    if in_progress:
        scenario = db.get(IraqiScenario, in_progress.scenario_id)
        if scenario and scenario.active:
            return DailyPracticeRecommendation(
                kind="scenario",
                title_fa=f"ادامه تمرین: {scenario.title_fa}",
                description_fa=scenario.description_fa,
                action_scenario_id=scenario.id,
            )

    weakest = progress_engine.get_weakest_dimension(db, user.id)
    if weakest:
        topic_map = {
            "pace": "امروز روی سرعت بیان خود تمرکز کنید؛ یک متن را با سرعت متعادل بخوانید.",
            "fillers": "امروز تمرین کنید بدون گفتن «یعنی»، «چیزه» و کلمات پرکننده صحبت کنید.",
            "energy": "امروز با انرژی بیشتری صحبت کنید؛ سعی کنید صدای خود را متغیرتر کنید.",
            "structure": "امروز یک سخنرانی با مقدمه، بدنه و نتیجه‌گیری مشخص تمرین کنید.",
            "pitch": "امروز روی متغیر کردن زیر و بمی صدای خود تمرین کنید.",
        }
        description = topic_map.get(weakest, "امروز یک تمرین سخنرانی جدید انجام دهید.")
        return DailyPracticeRecommendation(
            kind="speech_topic",
            title_fa="تمرین هدفمند امروز",
            description_fa=description,
            action_topic_label=weakest,
        )

    default_level = db.execute(select(LearningLevel).order_by(LearningLevel.order_index)).scalars().first()
    active = _active_scenarios(default_level) if default_level else []
    if active:
        first_scenario = active[0]
        return DailyPracticeRecommendation(
            kind="scenario",
            title_fa=f"شروع کنید: {first_scenario.title_fa}",
            description_fa=first_scenario.description_fa,
            action_scenario_id=first_scenario.id,
        )

    return DailyPracticeRecommendation(
        kind="speech_topic",
        title_fa="اولین تمرین خود را ثبت کنید",
        description_fa="یک موضوع دلخواه انتخاب کنید و اولین سخنرانی خود را تمرین کنید.",
    )
