# Backend patches for sellable V1

Apply these changes on the real `khatib1` backend before production deploy.

## 1. `app/core/config.py`

Add field:

```python
frontend_url: str = Field(default="http://localhost:3000")
```

## 2. `app/routers/billing.py`

Import settings and replace all `/payment-result.html?...` redirects:

```python
from app.core.config import settings
from urllib.parse import quote, urlencode
from fastapi.responses import RedirectResponse

def _front_redirect(**params: str) -> RedirectResponse:
    base = settings.frontend_url.rstrip("/") + "/payment-result"
    return RedirectResponse(url=f"{base}?{urlencode(params, quote_via=quote)}")
```

In `zarinpal_callback`:
- error → `_front_redirect(status="error", message=exc.message)`
- paid → `_front_redirect(status="success", plan=txn.plan.value)`
- else → `_front_redirect(status="failed", reason=txn.failure_reason or "")`

Same for `demo_pay`.

## 3. Production `.env` (backend)

```env
ENVIRONMENT=production
DEBUG=false
COOKIE_SECURE=true
CORS_ORIGINS=https://app.YOURDOMAIN.com
FRONTEND_URL=https://app.YOURDOMAIN.com
ZARINPAL_CALLBACK_URL=https://api.YOURDOMAIN.com/api/billing/callback
ZARINPAL_SANDBOX=false
PAYMENT_PROVIDER=zarinpal
# JWT_SECRET and PASSWORD_PEPPER: long random secrets
REDIS_REQUIRED=true
WORKER_REQUIRED=true
```

## 4. CORS

Already has `allow_credentials=True` when origins are set.  
**Do not use `*` with credentials.** List exact frontend origin(s).

## 5. Cookie domain (if API on subdomain)

```env
COOKIE_DOMAIN=.YOURDOMAIN.com
```

Refresh cookie path is `/api/auth` — that is correct for same-site API calls with credentials.
