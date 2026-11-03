import re
from pathlib import Path

from app.core.db import db_session
from app.core.models import IraqiScenario, LearningLevel, ScenarioCategory

RAW = Path(__file__).resolve().parent / "data" / "scenarios_raw.txt"

LEVELS = [
    {"code": "beginner", "name_fa": "مبتدی", "order_index": 0, "description_fa": "آشنایی اولیه با گویش عراقی"},
    {"code": "A1", "name_fa": "A1 - پایه", "order_index": 1, "description_fa": "مکالمات ساده روزمره"},
    {"code": "A2", "name_fa": "A2 - مقدماتی", "order_index": 2, "description_fa": "سفر و خرید"},
    {"code": "B1", "name_fa": "B1 - متوسط", "order_index": 3, "description_fa": "کار و اجتماع"},
    {"code": "B2", "name_fa": "B2 - متوسط بالا", "order_index": 4, "description_fa": "بحث و نظر"},
    {"code": "C1", "name_fa": "C1 - پیشرفته", "order_index": 5, "description_fa": "سخنرانی حرفه‌ای"},
    {"code": "C2", "name_fa": "C2 - تسلط", "order_index": 6, "description_fa": "تسلط کامل"},
]

CAT = {
    "daily_conversation": ScenarioCategory.daily_conversation,
    "restaurant": ScenarioCategory.restaurant,
    "market": ScenarioCategory.market,
    "hotel": ScenarioCategory.hotel,
    "work": ScenarioCategory.work,
    "travel": ScenarioCategory.travel,
    "social": ScenarioCategory.social,
}


def parse_dicts(text: str) -> list:
    text = re.sub(r"^Python", "", text, flags=re.M)
    parts = re.split(r"(?=dict\s*\()", text)
    out = []
    for p in parts[1:]:
        if not p.startswith("dict"):
            continue
        depth = 0
        end = None
        for i, ch in enumerate(p):
            if ch == "(":
                depth += 1
            elif ch == ")":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end is None:
            continue
        chunk = p[:end]
        try:
            data = eval(chunk, {"dict": dict})
        except Exception:
            continue
        if isinstance(data, dict) and data.get("slug"):
            out.append(data)
    return out


def level_code(slug: str) -> str:
    s = slug.lower()
    for code in ("beginner", "a1", "a2", "b1", "b2", "c1", "c2"):
        if s.startswith(code):
            return "beginner" if code == "beginner" else code.upper()
    return "A1"


def order_index(slug: str) -> int:
    parts = slug.split("-")
    if len(parts) >= 2 and parts[-1].isdigit():
        return int(parts[-1])
    return 0


def main():
    if not RAW.exists():
        raise SystemExit(f"File not found: {RAW}")

    text = RAW.read_text(encoding="utf-8", errors="replace")
    items = parse_dicts(text)
    print("parsed", len(items))

    with db_session() as db:
        level_ids = {}
        for data in LEVELS:
            row = db.query(LearningLevel).filter_by(code=data["code"]).first()
            if row is None:
                row = LearningLevel(**data)
                db.add(row)
                db.flush()
                print("level+", data["code"])
            level_ids[data["code"]] = row.id

        created = updated = 0
        for raw in items:
            slug = raw["slug"]
            code = level_code(slug)
            level_id = level_ids[code]
            cat = CAT.get(raw.get("category", ""), ScenarioCategory.daily_conversation)
            starter = raw.get("starter_prompt") or raw.get("practice_prompt") or ""
            situation = raw.get("situation") or ""
            payload = dict(
                level_id=level_id,
                slug=slug,
                category=cat,
                order_index=raw.get("order_index", order_index(slug)),
                title_fa=raw.get("title_fa") or slug,
                title_iq=raw.get("title_iq"),
                description_fa=situation or raw.get("title_fa") or slug,
                situation=situation or None,
                objectives=raw.get("objectives") or [],
                key_vocabulary=raw.get("key_vocabulary") or [],
                model_dialogue=raw.get("model_dialogue") or [],
                practice_prompt=starter,
                success_criteria=raw.get("success_criteria") or [],
                common_mistakes=raw.get("common_mistakes") or [],
                cultural_note=raw.get("cultural_note"),
                difficulty=int(raw.get("difficulty") or 1),
                estimated_minutes=int(raw.get("estimated_minutes") or 8),
                active=True,
                content_version=1,
            )
            row = db.query(IraqiScenario).filter_by(slug=slug).first()
            if row is None:
                db.add(IraqiScenario(**payload))
                created += 1
            else:
                for k, v in payload.items():
                    setattr(row, k, v)
                updated += 1

        print("created", created, "updated", updated)
    print("DONE")


if __name__ == "__main__":
    main()