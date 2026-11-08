"""
Chat service — Iraqi Arabic coach conversations powered by AI.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import (
    Conversation,
    Message,
    MessageRole,
    ScenarioProgressStatus,
    User,
    UserScenarioProgress,
)
from app.services import ai as ai_service
from app.services import iraqi_coach

logger = logging.getLogger("khatib.chat")


class ChatServiceError(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


def create_conversation(db: Session, user: User, title: str | None = None) -> Conversation:
    conv = Conversation(
        user_id=user.id,
        title=title or "مکالمه جدید",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def list_conversations(db: Session, user: User, limit: int = 50) -> list[Conversation]:
    return list(
        db.execute(
            select(Conversation)
            .where(Conversation.user_id == user.id)
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        ).scalars().all()
    )


def get_conversation(db: Session, user: User, conversation_id: str) -> Conversation | None:
    conv = db.get(Conversation, conversation_id)
    if conv is None or conv.user_id != user.id:
        return None
    return conv


def send_message(db: Session, user: User, conversation_id: str, text: str) -> Message:
    conv = get_conversation(db, user, conversation_id)
    if conv is None:
        raise ChatServiceError("گفتگو یافت نشد.", status_code=404)

    # Save user message
    user_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.user,
        content=text,
    )
    db.add(user_msg)
    db.flush()

    # Build short history summary for context
    recent = db.execute(
        select(Message)
        .where(Message.conversation_id == conv.id)
        .order_by(Message.created_at.desc())
        .limit(6)
    ).scalars().all()
    recent = list(reversed(recent))
    history_parts = []
    for m in recent[:-1]:
        role = "کاربر" if m.role == MessageRole.user else "مربی"
        history_parts.append(f"{role}: {m.content[:200]}")
    history_summary = " | ".join(history_parts[-4:]) if history_parts else ""

    feedback = {
        "user_iraqi": "",
        "corrections": [],
        "suggestions": [],
        "next_suggestions": [],
        "vocabulary": [],
        "notes": None,
    }

    try:
        ai_reply = iraqi_coach.coach_reply(db, user.id, conv.id, text, history_summary=history_summary)
        reply_text = ai_reply.reply
        feedback["user_iraqi"] = (getattr(ai_reply, "user_iraqi", None) or "").strip()
        feedback["corrections"] = list(ai_reply.corrections or [])
        feedback["next_suggestions"] = list(getattr(ai_reply, "next_suggestions", None) or [])
        feedback["suggestions"] = feedback["next_suggestions"]  # سازگاری با فرانت فعلی
        feedback["vocabulary"] = list(getattr(ai_reply, "vocabulary", None) or [])
        feedback["notes"] = ai_reply.notes

        # متن ذخیره‌شده برای تاریخچه — ساختار آموزشی خوانا
        blocks: list[str] = []
        if feedback["user_iraqi"]:
            blocks.append(f"🇮🇶 معادل عراقی حرف شما:\n{feedback['user_iraqi']}")
        blocks.append(reply_text)
        if feedback["next_suggestions"]:
            blocks.append(
                "▶️ ادامه بده — یکی را بگو:\n"
                + "\n".join(f"• {s}" for s in feedback["next_suggestions"])
            )
        if feedback["corrections"]:
            blocks.append("📝 اصلاحات:\n" + "\n".join(f"• {c}" for c in feedback["corrections"]))
        if feedback["vocabulary"]:
            blocks.append("📚 واژگان:\n" + " · ".join(feedback["vocabulary"]))
        if feedback["notes"]:
            blocks.append(f"💡 {feedback['notes']}")
        reply_text = "\n\n".join(blocks)
    except Exception:
        logger.exception("AI chat failed")
        reply_text = "متأسفانه الان نمی‌توانم پاسخ بدهم. لطفاً کمی بعد دوباره تلاش کنید."

    assistant_msg = Message(
        conversation_id=conv.id,
        role=MessageRole.assistant,
        content=reply_text,
    )
    db.add(assistant_msg)
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(assistant_msg)

    # Auto-complete learning scenario linked to this conversation
    scenario_completed = False
    try:
        progress = db.execute(
            select(UserScenarioProgress).where(
                UserScenarioProgress.user_id == user.id,
                UserScenarioProgress.conversation_id == conversation_id,
                UserScenarioProgress.status == ScenarioProgressStatus.in_progress,
            )
        ).scalar_one_or_none()

        if progress is not None:
            user_msgs = db.execute(
                select(Message).where(
                    Message.conversation_id == conversation_id,
                    Message.role == MessageRole.user,
                )
            ).scalars().all()

            if len(user_msgs) >= 1:
                progress.status = ScenarioProgressStatus.completed
                progress.completed_at = datetime.now(timezone.utc)
                db.commit()
                scenario_completed = True
                logger.info(
                    "auto_completed_scenario",
                    extra={"scenario_id": progress.scenario_id, "user_id": user.id},
                )
    except Exception:
        logger.exception("auto-complete scenario failed")

    assistant_msg._feedback = feedback  # type: ignore[attr-defined]
    assistant_msg._scenario_completed = scenario_completed  # type: ignore[attr-defined]
    return assistant_msg


def delete_conversation(db: Session, user: User, conversation_id: str) -> bool:
    conv = get_conversation(db, user, conversation_id)
    if conv is None:
        return False
    db.delete(conv)
    db.commit()
    return True