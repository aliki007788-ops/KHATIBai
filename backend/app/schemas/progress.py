from __future__ import annotations

from pydantic import BaseModel


class ProgressSummaryResponse(BaseModel):
    practice_count: int
    best_score: int | None
    average_score: float | None
    weekly_average_score: float | None
    monthly_average_score: float | None
    current_streak_days: int
    score_trend: list[dict]
    # گیمیفیکیشن
    xp: int
    level: int
    xp_to_next_level: int
    weekly_practice_count: int
    weekly_challenge_target: int
    # مقایسه ناشناس با میانگین کل کاربران پلتفرم
    platform_average_score: float | None
    # مرحله ۱ — چالش روزانه، یادآور، مدال‌ها
    daily_practice_count: int = 0
    daily_challenge_target: int = 1
    days_since_last_practice: int | None = None
    reminder_message: str | None = None
    badges: list[dict] | None = None


class DimensionTrendResponse(BaseModel):
    dimension: str
    label_fa: str
    recent_average: float
    previous_average: float
    change_percent: float
