"""
PATCH for production V1 — replace payment redirects in app/routers/billing.py

Problem:
  RedirectResponse(url="/payment-result.html?...") hits the API host, not the SPA.

Fix:
  1. Add to Settings (config.py):
       frontend_url: str = Field(default="http://localhost:3000")

  2. Replace redirect URLs in billing.py with the helpers below.

  3. .env:
       FRONTEND_URL=https://app.khatib.app
       CORS_ORIGINS=https://app.khatib.app
       COOKIE_SECURE=true
       COOKIE_DOMAIN=.khatib.app   # optional, if API is on api. subdomain
       ZARINPAL_CALLBACK_URL=https://api.khatib.app/api/billing/callback
"""

from __future__ import annotations

from urllib.parse import quote, urlencode

from fastapi.responses import RedirectResponse

# --- drop into billing router after imports ---
# from app.core.config import settings


def payment_result_redirect(
    frontend_url: str,
    *,
    status: str,
    plan: str | None = None,
    message: str | None = None,
    reason: str | None = None,
) -> RedirectResponse:
    base = frontend_url.rstrip("/") + "/payment-result"
    q: dict[str, str] = {"status": status}
    if plan:
        q["plan"] = plan
    if message:
        q["message"] = message
    if reason:
        q["reason"] = reason
    return RedirectResponse(url=f"{base}?{urlencode(q, quote_via=quote)}")


# Example replacements inside zarinpal_callback:
#
# except billing_service.BillingError as exc:
#     return payment_result_redirect(settings.frontend_url, status="error", message=exc.message)
#
# if txn.status.value == "paid":
#     return payment_result_redirect(settings.frontend_url, status="success", plan=txn.plan.value)
# return payment_result_redirect(settings.frontend_url, status="failed", reason=txn.failure_reason or "")
