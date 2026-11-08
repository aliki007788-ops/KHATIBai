from __future__ import annotations

from app.core.entitlements import require_section

import os
import tempfile

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.admin_dependencies import require_admin
from app.core.db import get_db
from app.core.models import AuditLog, IraqiScenario, LearningLevel, User
from app.routers.auth import get_current_user
from app.schemas.learning import (
    DailyRecommendationResponse,
    LevelResponse,
    ScenarioDetailResponse,
    ScenarioResponse,
    StartScenarioResponse,
)
from app.schemas.learning_admin import (
    AdminLevelRow,
    AdminScenarioFull,
    AdminScenarioRow,
    AdminScenarioUpdate,
    AdminVocabPage,
    AdminVocabRow,
    TranscribeResponse,
)
from app.services import ai_client, learning_engine

router = APIRouter(prefix="/api/learning", tags=["learning"], dependencies=[Depends(require_section("learn"))])


def _detail_response(d: learning_engine.ScenarioDetail) -> ScenarioDetailResponse:
    s = d.scenario
    return ScenarioDetailResponse(
        id=s.id, slug=s.slug, level_id=d.level.id, level_code=d.level.code, level_name_fa=d.level.name_fa,
        category=s.category, order_index=s.order_index, title_fa=s.title_fa, title_iq=s.title_iq,
        situation=s.situation or s.description_fa,
        objectives=s.objectives or [], key_vocabulary=s.key_vocabulary or [],
        model_dialogue=s.model_dialogue or [], practice_prompt=s.practice_prompt,
        success_criteria=s.success_criteria or [], common_mistakes=s.common_mistakes or [],
        cultural_note=s.cultural_note, difficulty=s.difficulty, estimated_minutes=s.estimated_minutes,
        status=d.status, unlocked=d.unlocked,
        min_messages_to_complete=learning_engine.MIN_USER_MESSAGES_TO_COMPLETE,
        user_messages_count=d.user_messages_count, conversation_id=d.conversation_id,
    )


@router.get("/levels", response_model=list[LevelResponse])
def list_levels(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = learning_engine.get_levels_with_progress(db, current_user.id)
    return [
        LevelResponse(
            id=i.level.id, code=i.level.code, name_fa=i.level.name_fa,
            order_index=i.level.order_index, description_fa=i.level.description_fa,
            unlocked=i.unlocked, completed_count=i.completed_count, total_count=i.total_count,
        )
        for i in items
    ]


@router.get("/levels/{level_id}/scenarios", response_model=list[ScenarioResponse])
def list_scenarios(level_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        items = learning_engine.get_scenarios_for_level(db, current_user.id, level_id)
    except learning_engine.LearningEngineError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, exc.message)

    return [
        ScenarioResponse(
            id=i.scenario.id, slug=i.scenario.slug, category=i.scenario.category,
            order_index=i.scenario.order_index, title_fa=i.scenario.title_fa, title_iq=i.scenario.title_iq,
            description_fa=i.scenario.situation or i.scenario.description_fa,
            key_vocabulary=i.scenario.key_vocabulary or [],
            difficulty=i.scenario.difficulty, estimated_minutes=i.scenario.estimated_minutes,
            objectives=i.scenario.objectives or [],
            status=i.status, unlocked=i.unlocked,
        )
        for i in items
    ]


@router.get("/scenarios/{scenario_id}", response_model=ScenarioDetailResponse)
def scenario_detail(scenario_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        d = learning_engine.get_scenario_detail(db, current_user.id, scenario_id)
    except learning_engine.LearningEngineError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, exc.message)
    return _detail_response(d)


@router.get("/conversations/{conversation_id}/scenario", response_model=ScenarioDetailResponse)
def conversation_scenario(conversation_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = learning_engine.get_scenario_for_conversation(db, current_user.id, conversation_id)
    if d is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "این گفتگو به سناریویی وصل نیست.")
    return _detail_response(d)


@router.post("/scenarios/{scenario_id}/start", response_model=StartScenarioResponse)
def start_scenario(scenario_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conv = learning_engine.start_scenario(db, current_user, scenario_id)
    except learning_engine.LearningEngineError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message)
    return StartScenarioResponse(conversation_id=conv.id)


@router.post("/scenarios/{scenario_id}/complete", status_code=status.HTTP_204_NO_CONTENT)
def complete_scenario(scenario_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        learning_engine.complete_scenario(db, current_user, scenario_id)
    except learning_engine.LearningEngineError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, exc.message)
    return None


@router.get("/daily-recommendation", response_model=DailyRecommendationResponse)
def daily_recommendation(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rec = learning_engine.get_daily_recommendation(db, current_user)
    return DailyRecommendationResponse(**rec.__dict__)


# ───────────────────────── گفتار به متن (برای مرورگرهایی بدون Web Speech مثل Firefox) ─────────────────────────

MAX_AUDIO_BYTES = 5 * 1024 * 1024


@router.post("/transcribe", response_model=TranscribeResponse)
async def transcribe(
    file: UploadFile = File(...),
    language: str = Form("ar"),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "فایل صوتی خالی است.")
    if len(content) > MAX_AUDIO_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "فایل صوتی بیش از ۵ مگابایت است؛ کوتاه‌تر حرف بزنید.")
    if language not in {"ar", "fa", "en"}:
        language = "ar"

    suffix = ".webm"
    ctype = (file.content_type or "").lower()
    if "mp4" in ctype or "m4a" in ctype:
        suffix = ".mp4"
    elif "ogg" in ctype:
        suffix = ".ogg"
    elif "wav" in ctype:
        suffix = ".wav"

    fd, path = tempfile.mkstemp(suffix=suffix)
    try:
        with os.fdopen(fd, "wb") as fh:
            fh.write(content)
        try:
            text = ai_client.transcribe_audio(ai_client.get_primary_config(), path, language=language)
        except ai_client.AIProviderError:
            raise HTTPException(
                status.HTTP_503_SERVICE_UNAVAILABLE,
                "تبدیل گفتار به متن در دسترس نیست. پیام را تایپ کنید یا از Chrome/Edge استفاده کنید.",
            )
    finally:
        try:
            os.remove(path)
        except OSError:
            pass
    return TranscribeResponse(text=(text or "").strip())


# ───────────────────────── مدیریت محتوا (فقط ادمین) ─────────────────────────


def _row(s: IraqiScenario, level: LearningLevel) -> dict:
    return dict(
        id=s.id, slug=s.slug, level_code=level.code, level_name_fa=level.name_fa,
        order_index=s.order_index, title_fa=s.title_fa, title_iq=s.title_iq,
        category=s.category, difficulty=s.difficulty, estimated_minutes=s.estimated_minutes,
        active=s.active, vocab_count=len(s.key_vocabulary or []),
        needs_review_count=len(s.needs_review or []),
        edited_by_admin=(getattr(s, "content_version", 1) or 1) > 1,
    )


def _full(s: IraqiScenario, level: LearningLevel) -> AdminScenarioFull:
    return AdminScenarioFull(
        **_row(s, level),
        situation=s.situation or s.description_fa,
        objectives=s.objectives or [], key_vocabulary=s.key_vocabulary or [],
        model_dialogue=s.model_dialogue or [], practice_prompt=s.practice_prompt,
        success_criteria=s.success_criteria or [], common_mistakes=s.common_mistakes or [],
        cultural_note=s.cultural_note, needs_review=s.needs_review or [],
    )


@router.get("/admin/levels", response_model=list[AdminLevelRow])
def admin_levels(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    levels = db.query(LearningLevel).order_by(LearningLevel.order_index).all()
    return [
        AdminLevelRow(
            id=lv.id, code=lv.code, name_fa=lv.name_fa, description_fa=lv.description_fa,
            order_index=lv.order_index,
            active_count=sum(1 for s in lv.scenarios if s.active),
            inactive_count=sum(1 for s in lv.scenarios if not s.active),
        )
        for lv in levels
    ]


@router.get("/admin/scenarios", response_model=list[AdminScenarioRow])
def admin_scenarios(
    level_code: str | None = None,
    q: str | None = None,
    include_inactive: bool = False,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(IraqiScenario, LearningLevel).join(LearningLevel, LearningLevel.id == IraqiScenario.level_id)
    if level_code:
        query = query.filter(LearningLevel.code == level_code)
    if not include_inactive:
        query = query.filter(IraqiScenario.active.is_(True))
    rows = query.order_by(LearningLevel.order_index, IraqiScenario.order_index).all()
    needle = (q or "").strip().lower()
    if needle:
        rows = [
            (s, lv) for s, lv in rows
            if needle in (s.title_fa or "").lower() or needle in (s.title_iq or "").lower() or needle in (s.slug or "").lower()
        ]
    return [_row(s, lv) for s, lv in rows]


@router.get("/admin/scenarios/{scenario_id}", response_model=AdminScenarioFull)
def admin_scenario(scenario_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    s = db.get(IraqiScenario, scenario_id)
    if s is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "سناریو یافت نشد.")
    return _full(s, db.get(LearningLevel, s.level_id))


@router.patch("/admin/scenarios/{scenario_id}", response_model=AdminScenarioFull)
def admin_update_scenario(
    scenario_id: str,
    payload: AdminScenarioUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    s = db.get(IraqiScenario, scenario_id)
    if s is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "سناریو یافت نشد.")
    data = payload.model_dump(exclude_unset=True)
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "چیزی برای ذخیره ارسال نشده.")
    for key, value in data.items():
        if key == "situation" and value is not None:
            s.description_fa = value
        setattr(s, key, value)
    # علامت «ویرایش‌شده توسط ادمین»: seed دوباره این ردیف را بازنویسی نمی‌کند (مگر با --overwrite)
    s.content_version = max(2, (getattr(s, "content_version", 1) or 1) + 1)
    db.add(AuditLog(user_id=admin.id, action="admin_scenario_update", detail=f"slug={s.slug} fields={','.join(sorted(data))}"[:250]))
    db.commit()
    db.refresh(s)
    return _full(s, db.get(LearningLevel, s.level_id))


@router.get("/admin/vocabulary", response_model=AdminVocabPage)
def admin_vocabulary(
    q: str | None = None,
    level_code: str | None = None,
    limit: int = 100,
    offset: int = 0,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 300))
    query = db.query(IraqiScenario, LearningLevel).join(LearningLevel, LearningLevel.id == IraqiScenario.level_id)
    query = query.filter(IraqiScenario.active.is_(True))
    if level_code:
        query = query.filter(LearningLevel.code == level_code)
    needle = (q or "").strip().lower()
    items: list[AdminVocabRow] = []
    for s, lv in query.order_by(LearningLevel.order_index, IraqiScenario.order_index).all():
        for v in s.key_vocabulary or []:
            if not isinstance(v, dict) or not v.get("iq"):
                continue
            if needle and needle not in v["iq"].lower() and needle not in str(v.get("fa", "")).lower():
                continue
            items.append(AdminVocabRow(
                iq=v["iq"], fa=str(v.get("fa", "")), example_iq=str(v.get("example_iq", "")),
                scenario_id=s.id, scenario_title=s.title_fa, slug=s.slug, level_code=lv.code,
            ))
    return AdminVocabPage(total=len(items), items=items[offset: offset + limit])
