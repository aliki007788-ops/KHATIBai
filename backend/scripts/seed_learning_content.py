"""
Seeds initial LearningLevel + IraqiScenario content.
Run: python scripts/seed_learning_content.py
"""
from __future__ import annotations

from app.core.db import db_session
from app.core.models import IraqiScenario, LearningLevel, ScenarioCategory

LEVELS = [
    {"code": "beginner", "name_fa": "مبتدی", "order_index": 0, "description_fa": "آشنایی اولیه با گویش عراقی"},
    {"code": "A1", "name_fa": "A1 - پایه", "order_index": 1, "description_fa": "مکالمات ساده روزمره"},
    {"code": "A2", "name_fa": "A2 - مقدماتی", "order_index": 2, "description_fa": "موقعیت‌های رایج سفر و خرید"},
    {"code": "B1", "name_fa": "B1 - متوسط", "order_index": 3, "description_fa": "مکالمات کاری و اجتماعی"},
    {"code": "B2", "name_fa": "B2 - متوسط بالا", "order_index": 4, "description_fa": "بیان نظرات پیچیده و بحث آزاد"},
    {"code": "C1", "name_fa": "C1 - پیشرفته", "order_index": 5, "description_fa": "سخنرانی و ارائه حرفه‌ای"},
    {"code": "C2", "name_fa": "C2 - تسلط کامل", "order_index": 6, "description_fa": "گویش عراقی در سطح زبان مادری"},
]

SCENARIOS_BY_LEVEL_CODE = {
    "beginner": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "سلام و احوال‌پرسی", "description_fa": "یادگیری سلام کردن و احوال‌پرسی ساده به گویش عراقی.",
            "key_vocabulary": [{"iq": "شلونك", "fa": "حالت چطوره؟"}, {"iq": "زين", "fa": "خوبم"}],
            "practice_prompt": "هلا! شلونك اليوم؟ (سلام! امروز حالت چطوره؟) — جواب بده تا تمرین کنیم.",
        },
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 1,
            "title_fa": "معرفی خود", "description_fa": "یاد بگیرید خودتان را به گویش عراقی معرفی کنید.",
            "key_vocabulary": [{"iq": "اسمي", "fa": "اسم من"}, {"iq": "من وين انت", "fa": "اهل کجایی"}],
            "practice_prompt": "اسمك منو؟ ومن وين انت؟ (اسمت چیه و اهل کجایی؟)",
        },
    ],
    "A1": [
        {
            "category": ScenarioCategory.restaurant, "order_index": 0,
            "title_fa": "در رستوران", "description_fa": "سفارش غذا و نوشیدنی به گویش عراقی.",
            "key_vocabulary": [{"iq": "اريد اكل", "fa": "می‌خواهم غذا بخورم"}, {"iq": "الحساب", "fa": "صورت‌حساب"}],
            "practice_prompt": "هلا بيك بالمطعم! شتريد تاكل اليوم؟ (خوش اومدی به رستوران! امروز چی می‌خوای بخوری؟)",
        },
    ],
    "A2": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "خرید در بازار", "description_fa": "چانه زدن و خرید کردن در بازار عراقی.",
            "key_vocabulary": [{"iq": "بشحال", "fa": "چند؟"}, {"iq": "غالي", "fa": "گران"}],
            "practice_prompt": "هلا بيك بالسوق! شتريد تشتري اليوم؟ (خوش اومدی به بازار! امروز چی می‌خوای بخری؟)",
        },
    ],
    "B1": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "مکالمه کاری", "description_fa": "صحبت با همکاران و مدیر در محیط کار.",
            "key_vocabulary": [{"iq": "شغل", "fa": "کار"}, {"iq": "اجتماع", "fa": "جلسه"}],
            "practice_prompt": "هلا بيك بالشركة! شلون تكدر تساعدني بهذا المشروع؟ (خوش اومدی به شرکت! چطور می‌تونی به من در این پروژه کمک کنی؟)",
        },
    ],
    "B2": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "بحث آزاد", "description_fa": "بیان نظرات و بحث در مورد موضوعات پیچیده.",
            "key_vocabulary": [{"iq": "رأي", "fa": "نظر"}, {"iq": "مناقشة", "fa": "بحث"}],
            "practice_prompt": "شنو رأيك بهذا الموضوع؟ (نظرت در مورد این موضوع چیه؟)",
        },
    ],
    "C1": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "سخنرانی حرفه‌ای", "description_fa": "ارائه یک سخنرانی رسمی به گویش عراقی.",
            "key_vocabulary": [{"iq": "خطاب", "fa": "سخنرانی"}, {"iq": "جمهور", "fa": "مردم"}],
            "practice_prompt": "اهلاً بيكم! اليوم راح نتكلم عن موضوع مهم. (خوش اومدید! امروز می‌خوایم در مورد یک موضوع مهم صحبت کنیم.)",
        },
    ],
    "C2": [
        {
            "category": ScenarioCategory.daily_conversation, "order_index": 0,
            "title_fa": "تسلط کامل", "description_fa": "صحبت در سطح زبان مادری در هر موقعیتی.",
            "key_vocabulary": [{"iq": "طلاقة", "fa": "تسلط"}, {"iq": "لغة الأم", "fa": "زبان مادری"}],
            "practice_prompt": "هلا بيك! شلون تحس روحك هلأ بهذه اللغة؟ (خوش اومدی! الان چه حسی به این زبان داری؟)",
        },
    ],
}

def run() -> None:
    with db_session() as db:
        level_id_by_code: dict[str, str] = {}

        for level_data in LEVELS:
            existing = db.query(LearningLevel).filter_by(code=level_data["code"]).first()
            if existing:
                level_id_by_code[level_data["code"]] = existing.id
                continue
            level = LearningLevel(**level_data)
            db.add(level)
            db.flush()
            level_id_by_code[level_data["code"]] = level.id

        for level_code, scenarios in SCENARIOS_BY_LEVEL_CODE.items():
            level_id = level_id_by_code[level_code]
            for sc_data in scenarios:
                existing = db.query(IraqiScenario).filter_by(
                    level_id=level_id, order_index=sc_data["order_index"]
                ).first()
                if existing:
                    continue
                db.add(IraqiScenario(level_id=level_id, **sc_data))

        print("Learning content seeded successfully.")

if __name__ == "__main__":
    run()