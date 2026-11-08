"""
دو فایل موجود را با جایگزینی دقیق اصلاح می‌کند (idempotent؛ اگر چیزی عوض شده باشد هیچ فایلی را نمی‌نویسد):
  1) app/core/models.py       ← ستون‌های جدید IraqiScenario
  2) app/services/chat_service.py ← استفاده از مربی آگاه از سناریو

اجرا از پوشه‌ی backend:  python scripts/apply_iraqi_patch.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NEW_COLUMNS = '''    # --- ستون‌های برنامه‌ی غنی آموزش عراقی ---
    slug: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)
    title_iq: Mapped[str | None] = mapped_column(String(255), nullable=True)
    situation: Mapped[str | None] = mapped_column(Text, nullable=True)
    objectives: Mapped[list | None] = mapped_column(JSON, nullable=True)
    success_criteria: Mapped[list | None] = mapped_column(JSON, nullable=True)
    common_mistakes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    model_dialogue: Mapped[list | None] = mapped_column(JSON, nullable=True)
    cultural_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    needs_review: Mapped[list | None] = mapped_column(JSON, nullable=True)
    difficulty: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

'''


def patch_models(text: str) -> tuple[str, str]:
    if "needs_review: Mapped" in text:
        return text, "models.py: قبلاً اعمال شده"
    if "title_iq: Mapped" in text:
        # مدل از قبل بیشتر ستون‌ها را دارد؛ فقط needs_review را اضافه می‌کنیم
        anchor = "    cultural_note: Mapped[str | None] = mapped_column(Text, nullable=True)\n"
        if anchor not in text:
            raise SystemExit("models.py با نسخه‌ی مورد انتظار نمی‌خواند؛ هیچ تغییری داده نشد.")
        line = "    needs_review: Mapped[list | None] = mapped_column(JSON, nullable=True)\n"
        return text.replace(anchor, anchor + line, 1), "models.py: ستون needs_review اضافه شد"
    pat = re.compile(
        r'(class IraqiScenario\(Base\):.*?    active: Mapped\[bool\] = mapped_column\(Boolean, default=True, nullable=False\)\n\n)(    level: Mapped\["LearningLevel"\])',
        re.S,
    )
    new, n = pat.subn(lambda m: m.group(1) + NEW_COLUMNS + m.group(2), text, count=1)
    if n != 1:
        raise SystemExit("models.py با نسخه‌ی مورد انتظار نمی‌خواند؛ هیچ تغییری داده نشد. فایل را برای من بفرستید.")
    return new, "models.py: ستون‌ها اضافه شد"


def patch_chat_service(text: str) -> tuple[str, str]:
    if "iraqi_coach.coach_reply" in text:
        return text, "chat_service.py: قبلاً اعمال شده"
    call = re.compile(
        r"ai_service\.chat_iraqi_coach\(\s*db,\s*user\.id,\s*text,\s*history_summary=history_summary\s*\)"
    )
    new, n = call.subn("iraqi_coach.coach_reply(db, user.id, conv.id, text, history_summary=history_summary)", text, count=1)
    if n != 1:
        raise SystemExit("chat_service.py با نسخه‌ی مورد انتظار نمی‌خواند؛ هیچ تغییری داده نشد. فایل را برای من بفرستید.")
    imp = "from app.services import ai as ai_service"
    if imp not in new:
        raise SystemExit("import مورد انتظار در chat_service.py پیدا نشد؛ هیچ تغییری داده نشد.")
    new = new.replace(imp, imp + "\nfrom app.services import iraqi_coach", 1)
    return new, "chat_service.py: مربی آگاه از سناریو فعال شد"


def main() -> None:
    targets = [
        (ROOT / "app/core/models.py", patch_models),
        (ROOT / "app/services/chat_service.py", patch_chat_service),
    ]
    results = []
    for path, fn in targets:
        original = path.read_text(encoding="utf-8")
        new, msg = fn(original)  # اگر خطا بدهد SystemExit قبل از نوشتن هر فایلی است
        results.append((path, original, new, msg))
    for path, original, new, msg in results:
        if new != original:
            path.write_text(new, encoding="utf-8")
        print(msg)


if __name__ == "__main__":
    main()
