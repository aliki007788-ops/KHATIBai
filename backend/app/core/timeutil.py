"""Small datetime helpers.

SQLite returns naive datetimes even for DateTime(timezone=True) columns, while
PostgreSQL returns aware ones. Comparing either with datetime.now(timezone.utc)
must work on both, so normalise through as_utc().
"""
from __future__ import annotations

from datetime import datetime, timezone


def as_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)
