"""تست‌های ماژول‌های مستقل (بدون نیاز به دیتابیس/FastAPI). اجرا: pytest backend/tests/test_helpers.py"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ.setdefault("COACH_TICKET_SECRET", "test-secret")

from app.core import coach_ticket
from app.core.rate_limit import SlidingWindowLimiter
from app.services.csv_utils import csv_safe


def test_ticket_roundtrip_and_single_use():
    token = coach_ticket.issue_ticket("user-1", now=1000.0)
    assert coach_ticket.verify_ticket(token, now=1001.0) == "user-1"
    assert coach_ticket.verify_ticket(token, now=1002.0) is None  # replay


def test_ticket_expired():
    token = coach_ticket.issue_ticket("user-1", now=1000.0)
    assert coach_ticket.verify_ticket(token, now=1000.0 + coach_ticket.TICKET_TTL_SECONDS + 1) is None


def test_ticket_tampered_or_garbage():
    token = coach_ticket.issue_ticket("user-1", now=1000.0)
    payload, sig = token.split(".")
    assert coach_ticket.verify_ticket(payload + "." + sig[:-2] + "AA", now=1001.0) is None
    forged_payload = coach_ticket._b64(b'{"uid":"admin","exp":9999999999,"n":"x"}')
    assert coach_ticket.verify_ticket(forged_payload + "." + sig, now=1001.0) is None
    for bad in (None, "", "abc", "a.b.c", "é.é", "x" * 600):
        assert coach_ticket.verify_ticket(bad, now=1001.0) is None


def test_rate_limiter_window():
    limiter = SlidingWindowLimiter(max_events=3, window_seconds=10)
    assert [limiter.allow("u", now=t) for t in (0, 1, 2)] == [True, True, True]
    assert limiter.allow("u", now=3) is False
    assert limiter.allow("other", now=3) is True
    assert limiter.allow("u", now=10.5) is True  # قدیمی‌ترین رویداد از پنجره بیرون رفته


def test_csv_safe():
    assert csv_safe("=HYPERLINK(\"x\")") == "'=HYPERLINK(\"x\")"
    for ch in "+-@":
        assert csv_safe(ch + "cmd") == "'" + ch + "cmd"
    assert csv_safe("علی") == "علی"
    assert csv_safe(5) == 5
    assert csv_safe("") == ""
