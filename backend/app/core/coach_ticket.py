"""
بلیت کوتاه‌مدت و یک‌بارمصرف برای اتصال WebSocket مربی زنده.

مرورگر نمی‌تواند هدر Authorization را روی WebSocket بفرستد، پس کلاینت اول با
JWT معمولی از `POST /api/practice/coach-ticket` یک بلیت امضاشده (۶۰ ثانیه اعتبار)
می‌گیرد و آن را در query می‌فرستد. این ماژول عمداً به بقیه‌ی اپ وابسته نیست.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import threading
import time

logger = logging.getLogger("khatib.coach_ticket")

TICKET_TTL_SECONDS = 60

# اگر هیچ secret پایداری پیدا نشود (مثلاً چند worker) هر پروسه کلید تصادفی خودش را دارد؛
# در این حالت باید COACH_TICKET_SECRET را در محیط ست کنید.
_PROCESS_SECRET = secrets.token_bytes(32)
_used_nonces: dict[str, float] = {}
_lock = threading.Lock()
_warned = False


def _secret() -> bytes:
    global _warned
    env = os.getenv("COACH_TICKET_SECRET")
    if env:
        return env.encode("utf-8")
    try:
        from app.core.config import settings  # type: ignore

        for attr in ("secret_key", "jwt_secret_key", "jwt_secret", "SECRET_KEY"):
            value = getattr(settings, attr, None)
            if value is None:
                continue
            if hasattr(value, "get_secret_value"):  # pydantic SecretStr
                value = value.get_secret_value()
            value = str(value)
            if value:
                return ("coach-ticket:" + value).encode("utf-8")
    except Exception:  # settings may be unavailable (e.g. in unit tests)
        pass
    if not _warned:
        logger.warning(
            "COACH_TICKET_SECRET ست نشده؛ از کلید تصادفی همین پروسه استفاده می‌شود "
            "(با چند worker بلیت‌ها معتبر نمی‌مانند)."
        )
        _warned = True
    return _PROCESS_SECRET


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def _sign(payload_b64: str) -> str:
    return _b64(hmac.new(_secret(), payload_b64.encode("ascii"), hashlib.sha256).digest())


def issue_ticket(user_id: str, now: float | None = None) -> str:
    now = time.time() if now is None else now
    payload = {"uid": user_id, "exp": now + TICKET_TTL_SECONDS, "n": secrets.token_hex(8)}
    payload_b64 = _b64(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    return f"{payload_b64}.{_sign(payload_b64)}"


def verify_ticket(token: str | None, now: float | None = None) -> str | None:
    """user_id را برمی‌گرداند یا None اگر بلیت نامعتبر/منقضی/استفاده‌شده باشد."""
    if not token or token.count(".") != 1 or len(token) > 512:
        return None
    now = time.time() if now is None else now
    payload_b64, signature = token.split(".")
    try:
        signature_ok = hmac.compare_digest(signature.encode("ascii"), _sign(payload_b64).encode("ascii"))
    except (UnicodeEncodeError, ValueError):
        return None
    if not signature_ok:
        return None
    try:
        payload = json.loads(_unb64(payload_b64))
        user_id = str(payload["uid"])
        expires = float(payload["exp"])
        nonce = str(payload["n"])
    except (ValueError, KeyError, TypeError):
        return None
    if expires < now:
        return None
    with _lock:
        for key in [k for k, exp in _used_nonces.items() if exp < now]:
            del _used_nonces[key]
        if nonce in _used_nonces:
            return None  # replay
        _used_nonces[nonce] = expires
    return user_id
