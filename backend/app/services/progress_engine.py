"""
Progress Engine — computes coaching-style progress metrics.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.models import Speech, SpeechAnalysis, SpeechStatus

DIMENSION_LABELS_FA = {
    "content": "محتوا",
    "structure": "ساختار",
    "coherence": "انسجام منطقی",
    "clarity": "وضوح",
    "vocabulary": "دایره لغات",
    "grammar": "گرامر",
    "persuasion": "اقناع",
    "emotion": "بار احساسی",
    "engagement": "تعامل با مخاطب",
    "depth": "عمق موضوع",
    "conclusion": "نتیجه‌گیری",
    "confidence": "اعتماد به نفس",
    # کلیدهای قدیمی/جانبی که ممکن است در رکوردهای قدیمی‌تر وجود داشته باشند
    "fluency": "روانی بیان",
    "pace": "سرعت بیان",
}


WEEKLY_CHALLENGE_TARGET = 3
XP_PER_LEVEL = 200


@dataclass
class ProgressSummary:
    practice_count: int
    best_score: int | None
    average_score: float | None
    weekly_average_score: float | None
    monthly_average_score: float | None
    current_streak_days: int
    score_trend: list[dict]
    xp: int
    level: int
    xp_to_next_level: int
    weekly_practice_count: int
    weekly_challenge_target: int
    platform_average_score: float | None


def _compute_xp(practice_count: int, total_score: int) -> tuple[int, int, int]:
    """امتیاز XP ساده: هر تمرین ۱۰ امتیاز پایه + نیمی از امتیاز کیفیت آن."""
    xp = practice_count * 10 + total_score // 2
    level = 1 + xp // XP_PER_LEVEL
    xp_to_next_level = XP_PER_LEVEL - (xp % XP_PER_LEVEL)
    return xp, level, xp_to_next_level


def compute_platform_average(db: Session) -> float | None:
    """میانگین امتیاز کل کاربران پلتفرم (ناشناس، بدون افشای داده فردی) — برای مقایسه."""
    rows = db.execute(select(SpeechAnalysis.overall_score)).scalars().all()
    if not rows:
        return None
    return round(sum(rows) / len(rows), 1)


@dataclass
class DimensionTrend:
    dimension: str
    label_fa: str
    recent_average: float
    previous_average: float
    change_percent: float


def _completed_speeches(db: Session, user_id: str, since: datetime | None = None):
    query = (
        select(Speech, SpeechAnalysis)
        .join(SpeechAnalysis, SpeechAnalysis.speech_id == Speech.id)
        .where(Speech.user_id == user_id, Speech.status == SpeechStatus.completed)
        .order_by(Speech.completed_at.asc())
    )
    if since:
        query = query.where(Speech.completed_at >= since)
    return db.execute(query).all()


def compute_summary(db: Session, user_id: str) -> ProgressSummary:
    rows = _completed_speeches(db, user_id)

    if not rows:
        return ProgressSummary(
            practice_count=0, best_score=None, average_score=None,
            weekly_average_score=None, monthly_average_score=None,
            current_streak_days=0, score_trend=[],
            xp=0, level=1, xp_to_next_level=XP_PER_LEVEL,
            weekly_practice_count=0, weekly_challenge_target=WEEKLY_CHALLENGE_TARGET,
            platform_average_score=compute_platform_average(db),
        )

    scores = [analysis.overall_score for _, analysis in rows]
    best_score = max(scores)
    average_score = round(sum(scores) / len(scores), 1)

    now = datetime.now(timezone.utc)
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    weekly_scores = [a.overall_score for s, a in rows if s.completed_at and s.completed_at >= week_ago]
    monthly_scores = [a.overall_score for s, a in rows if s.completed_at and s.completed_at >= month_ago]

    weekly_avg = round(sum(weekly_scores) / len(weekly_scores), 1) if weekly_scores else None
    monthly_avg = round(sum(monthly_scores) / len(monthly_scores), 1) if monthly_scores else None

    streak = _compute_streak(db, user_id)

    trend = [
        {"date": s.completed_at.date().isoformat(), "score": a.overall_score}
        for s, a in rows[-30:]
    ]

    xp, level, xp_to_next_level = _compute_xp(len(rows), sum(scores))

    return ProgressSummary(
        practice_count=len(rows),
        best_score=best_score,
        average_score=average_score,
        weekly_average_score=weekly_avg,
        monthly_average_score=monthly_avg,
        current_streak_days=streak,
        score_trend=trend,
        xp=xp,
        level=level,
        xp_to_next_level=xp_to_next_level,
        weekly_practice_count=len(weekly_scores),
        weekly_challenge_target=WEEKLY_CHALLENGE_TARGET,
        platform_average_score=compute_platform_average(db),
    )


def _compute_streak(db: Session, user_id: str) -> int:
    rows = db.execute(
        select(Speech.completed_at)
        .where(Speech.user_id == user_id, Speech.status == SpeechStatus.completed)
        .order_by(Speech.completed_at.desc())
    ).all()

    if not rows:
        return 0

    practice_dates = sorted({r[0].date() for r in rows if r[0]}, reverse=True)
    today = datetime.now(timezone.utc).date()

    if practice_dates[0] not in (today, today - timedelta(days=1)):
        return 0

    streak = 1
    for i in range(1, len(practice_dates)):
        expected_prev = practice_dates[i - 1] - timedelta(days=1)
        if practice_dates[i] == expected_prev:
            streak += 1
        else:
            break

    return streak


def compute_dimension_trends(db: Session, user_id: str, recent_n: int = 5) -> list[DimensionTrend]:
    rows = _completed_speeches(db, user_id)
    if len(rows) < recent_n * 2:
        return []

    recent = rows[-recent_n:]
    previous = rows[-(recent_n * 2):-recent_n]

    all_dimensions: set[str] = set()
    for _, analysis in rows:
        all_dimensions.update(analysis.dimension_scores.keys())

    trends: list[DimensionTrend] = []
    for dim in sorted(all_dimensions):
        recent_vals = [a.dimension_scores[dim] for _, a in recent if dim in a.dimension_scores]
        previous_vals = [a.dimension_scores[dim] for _, a in previous if dim in a.dimension_scores]

        if not recent_vals or not previous_vals:
            continue

        recent_avg = sum(recent_vals) / len(recent_vals)
        previous_avg = sum(previous_vals) / len(previous_vals)
        change = ((recent_avg - previous_avg) / previous_avg * 100) if previous_avg > 0 else 0.0

        trends.append(DimensionTrend(
            dimension=dim,
            label_fa=DIMENSION_LABELS_FA.get(dim, dim),
            recent_average=round(recent_avg, 1),
            previous_average=round(previous_avg, 1),
            change_percent=round(change, 1),
        ))

    return trends


def get_weakest_dimension(db: Session, user_id: str) -> str | None:
    rows = _completed_speeches(db, user_id)
    if not rows:
        return None

    recent = rows[-5:]
    totals: dict[str, list[int]] = {}
    for _, analysis in recent:
        for dim, score in analysis.dimension_scores.items():
            totals.setdefault(dim, []).append(score)

    if not totals:
        return None

    averages = {dim: sum(vals) / len(vals) for dim, vals in totals.items()}
    return min(averages, key=averages.get)
