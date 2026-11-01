"""ابزارهای امن‌سازی خروجی CSV (جلوگیری از CSV/formula injection در اکسل)."""
from __future__ import annotations

_DANGEROUS_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def csv_safe(value: object) -> object:
    """رشته‌هایی که با کاراکتر فرمول شروع می‌شوند با یک آپاستروف خنثی می‌شوند؛ عددها دست‌نخورده می‌مانند."""
    if isinstance(value, str) and value.startswith(_DANGEROUS_PREFIXES):
        return "'" + value
    return value
