"""
Seed (upsert) برنامه‌ی کامل آموزش عراقی: ۷ سطح × ۳۰ سناریو = ۲۱۰ سناریو.

اجرا (از پوشه‌ی backend):
    python scripts/seed_iraqi_curriculum.py            # اعمال
    python scripts/seed_iraqi_curriculum.py --dry-run  # فقط گزارش
    python scripts/seed_iraqi_curriculum.py --overwrite  # ویرایش‌های ادمین را هم بازنویسی کن

ویژگی‌ها:
- idempotent: چند بار اجرا کردن امن است؛ بر اساس slug به‌روزرسانی می‌کند.
- سناریوهای قدیمی (بدون slug) پاک نمی‌شوند؛ فقط غیرفعال می‌شوند تا تاریخچه‌ی پیشرفت کاربران بماند.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.db import db_session  # noqa: E402
from app.core.models import IraqiScenario, LearningLevel, ScenarioCategory  # noqa: E402

DATA = Path(__file__).resolve().parent / "iraqi_content" / "curriculum.json"

LEVELS = [
    ("beginner", "مبتدی", 0, "اولین قدم‌ها: سلام، معرفی، اعداد، خرید و تشکر با جمله‌های بسیار ساده."),
    ("A1", "A1 - پایه", 1, "مکالمه‌های ساده‌ی روزمره: کافه، بازار، آدرس، هتل و قرار ملاقات."),
    ("A2", "A2 - مقدماتی", 2, "سفر، فرودگاه، خرید و موقعیت‌های رایجِ بیرون از خانه."),
    ("B1", "B1 - متوسط", 3, "شکایت، اجاره، پزشک، بانک و مکالمه‌ی کاری و اجتماعی."),
    ("B2", "B2 - متوسط بالا", 4, "مذاکره، بحث، ارائه و بیان نظر با جزئیات و ظرافت."),
    ("C1", "C1 - پیشرفته", 5, "سخنرانی، میانجی‌گری، مصاحبه و گفتگوی رسمی با رجیستر دقیق."),
    ("C2", "C2 - تسلط کامل", 6, "ظرافت‌های فرهنگی و بلاغی در سطح زبان مادری."),
]
CODE_BY_PREFIX = {"beg": "beginner", "a1": "A1", "a2": "A2", "b1": "B1", "b2": "B2", "c1": "C1", "c2": "C2"}


def run(dry_run: bool = False, overwrite: bool = False) -> None:
    items = json.loads(DATA.read_text(encoding="utf-8"))
    created = updated = protected = 0

    with db_session() as db:
        level_by_code: dict[str, LearningLevel] = {}
        for code, name, order, desc in LEVELS:
            level = db.query(LearningLevel).filter_by(code=code).first()
            if level is None:
                level = LearningLevel(code=code, name_fa=name, order_index=order, description_fa=desc)
                db.add(level)
                db.flush()
            else:
                level.name_fa, level.order_index, level.description_fa = name, order, desc
            level_by_code[code] = level

        slugs: set[str] = set()
        for item in items:
            slug = item["slug"]
            slugs.add(slug)
            prefix, num = slug.split("-")
            level = level_by_code[CODE_BY_PREFIX[prefix]]
            row = db.query(IraqiScenario).filter_by(slug=slug).first()
            fields = dict(
                level_id=level.id,
                category=ScenarioCategory(item["category"]),
                order_index=int(num),
                title_fa=item["title_fa"],
                title_iq=item["title_iq"],
                description_fa=item["situation"],
                situation=item["situation"],
                objectives=item["objectives"],
                key_vocabulary=item["key_vocabulary"],
                model_dialogue=item["model_dialogue"],
                practice_prompt=item["starter_prompt"],
                success_criteria=item["success_criteria"],
                common_mistakes=item["common_mistakes"],
                cultural_note=item["cultural_note"],
                needs_review=item.get("needs_review", []),
                difficulty=item["difficulty"],
                estimated_minutes=item["estimated_minutes"],
                active=True,
            )
            if row is None:
                db.add(IraqiScenario(slug=slug, **fields))
                created += 1
            elif (row.content_version or 1) > 1 and not overwrite:
                protected += 1  # ادمین این سناریو را ویرایش کرده؛ دست نمی‌زنیم
            else:
                for k, v in fields.items():
                    setattr(row, k, v)
                updated += 1

        # سناریوهای قدیمی (بدون slug یا خارج از این برنامه) را غیرفعال کن
        deactivated = 0
        for row in db.query(IraqiScenario).filter(IraqiScenario.active.is_(True)).all():
            if row.slug not in slugs:
                row.active = False
                deactivated += 1

        print(f"سناریوی جدید: {created} | به‌روزشده: {updated} | محافظت‌شده (ویرایش ادمین): {protected} | قدیمیِ غیرفعال‌شده: {deactivated}")
        if dry_run:
            db.rollback()
            print("(dry-run: چیزی ذخیره نشد)")
        else:
            print("برنامه‌ی آموزش عراقی با موفقیت اعمال شد.")


if __name__ == "__main__":
    run(dry_run="--dry-run" in sys.argv, overwrite="--overwrite" in sys.argv)
