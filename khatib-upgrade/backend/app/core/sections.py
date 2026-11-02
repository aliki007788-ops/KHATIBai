"""
بخش‌های قابل کنترل خطیب. ادمین در پنل پلن‌ها مشخص می‌کند هر پلن به کدام بخش‌ها دسترسی دارد.
کلیدها در بک‌اند (require_section) و فرانت‌اند (منوی کناری) یکی هستند.
"""
from __future__ import annotations

SECTIONS: dict[str, str] = {
    "learn": "آموزش عراقی (سطوح و سناریوها)",
    "translator": "مترجم زنده",
    "paths": "مسیرهای آموزشی چندهفته‌ای",
    "team": "تیم و سازمان",
    "video": "تحلیل ویدیو و تماس چشمی",
    "audience": "مخاطب مجازی",
    "meetings": "تمرین جلسات آنلاین",
}

SECTION_KEYS: list[str] = list(SECTIONS.keys())
