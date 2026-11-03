from app.core.db import db_session
from app.core.models import IraqiScenario, LearningLevel, ScenarioCategory

LEVELS = [
    {"code": "beginner", "name_fa": "مبتدی", "order_index": 0, "description_fa": "آشنایی اولیه"},
    {"code": "A1", "name_fa": "A1 - پایه", "order_index": 1, "description_fa": "مکالمات ساده"},
    {"code": "A2", "name_fa": "A2 - مقدماتی", "order_index": 2, "description_fa": "سفر و خرید"},
    {"code": "B1", "name_fa": "B1 - متوسط", "order_index": 3, "description_fa": "کار و اجتماع"},
    {"code": "B2", "name_fa": "B2 - متوسط بالا", "order_index": 4, "description_fa": "بحث و نظر"},
    {"code": "C1", "name_fa": "C1 - پیشرفته", "order_index": 5, "description_fa": "سخنرانی"},
    {"code": "C2", "name_fa": "C2 - تسلط", "order_index": 6, "description_fa": "تسلط کامل"},
]

SAMPLE = {
    "slug": "a1-021",
    "category": ScenarioCategory.daily_conversation,
    "order_index": 21,
    "title_fa": "خرید سیم‌کارت",
    "title_iq": "شراء شريحة اتصال",
    "description_fa": "خرید سیم‌کارت محلی در فروشگاه موبایل",
    "situation": "شما در فروشگاه موبایل هستید و میخواهید سیم‌کارت بخرید.",
    "objectives": ["نوع سیم‌کارت را بگویید", "بسته را انتخاب کنید"],
    "key_vocabulary": [{"iq": "شريحة", "fa": "سیم‌کارت"}],
    "model_dialogue": [],
    "practice_prompt": "أريد شريحة جديدة. گلي شنو نوع الباقة اللي تحتاجها.",
    "success_criteria": ["نوع سیم‌کارت مشخص شد"],
    "common_mistakes": ["نپرسیدن مدارک"],
    "cultural_note": "ثبت معمولا با پاسپورت است.",
    "difficulty": 2,
    "estimated_minutes": 9,
}


def main():
    with db_session() as db:
        level_ids = {}
        for data in LEVELS:
            row = db.query(LearningLevel).filter_by(code=data["code"]).first()
            if row is None:
                row = LearningLevel(**data)
                db.add(row)
                db.flush()
                print("level", data["code"])
            level_ids[data["code"]] = row.id

        s = SAMPLE
        row = db.query(IraqiScenario).filter_by(slug=s["slug"]).first()
        payload = dict(
            level_id=level_ids["A1"],
            slug=s["slug"],
            category=s["category"],
            order_index=s["order_index"],
            title_fa=s["title_fa"],
            title_iq=s["title_iq"],
            description_fa=s["description_fa"],
            situation=s["situation"],
            objectives=s["objectives"],
            key_vocabulary=s["key_vocabulary"],
            model_dialogue=s["model_dialogue"],
            practice_prompt=s["practice_prompt"],
            success_criteria=s["success_criteria"],
            common_mistakes=s["common_mistakes"],
            cultural_note=s["cultural_note"],
            difficulty=s["difficulty"],
            estimated_minutes=s["estimated_minutes"],
            active=True,
            content_version=1,
        )
        if row is None:
            db.add(IraqiScenario(**payload))
            print("created", s["slug"])
        else:
            for k, v in payload.items():
                setattr(row, k, v)
            print("updated", s["slug"])
    print("OK")


if __name__ == "__main__":
    main()