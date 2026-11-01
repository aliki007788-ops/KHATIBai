# 📋 گزارش نهایی پروژه «خطیب» (Khatib) — نسخه تأییدشده

> **این گزارش جایگزین سه گزارش قبلی است.** همه چیز از کد و دیتابیس واقعی تأیید شده. تاریخ: 1404

---

## ⚠️ هشدار مهم برای هوش مصنوعی بعدی

سه گزارش قبلی (`گزارش کامل پروژه خطیب`، `گزارش جامع فنی`، `گزارش جامع پروژه`) **با هم متناقض بودن**. فقط به **این گزارش** اعتماد کن. هر ادعایی که اینجا نیست، اول باید از کد تأیید بشه.

**مهم‌ترین تناقض‌های حل‌شده:**
- دیتابیس **SQLite** است، نه PostgreSQL
- `RoleEnum` **وجود دارد** (Enum)، نه رشته
- `coach_ws.py` **حذف نشده** — فعال است
- دیتابیس **پر است**، نه خالی
- فقط `/translator` واقعاً Mock است، نه `/progress` و `/settings`

---

## ۱. مشخصات تأییدشده

| مورد | مقدار واقعی |
|---|---|
| **نام پروژه** | خطیب (Khatib) — استودیوی سخنرانی هوشمند + آموزش گویش عراقی |
| **مسیر** | `C:\Users\K.ali\Desktop\khatib-full-v1` |
| **Backend** | FastAPI + SQLAlchemy + **SQLite** (`backend/data/khatib.db`) |
| **Frontend** | Next.js 15 (App Router) + TypeScript + Tailwind + Zustand + React Query |
| **AI Realtime** | `gpt-4o-realtime-preview` + Whisper (در `coach_ws.py`) |
| **AI Chat** | `gpt-4o-mini` |
| **Auth** | JWT + Argon2 + Pepper + Refresh Cookie + Audit Log |
| **Payment** | ZarinPal در حالت **demo** (غیرفعال) |
| **venv** | `backend\venv` — سالم |
| **پورت‌ها** | Backend: 8000، Frontend: 3000 |
| **اطلاعات تست** | `test@khatib.com` / `Test1234!` |

---

## ۲. وضعیت دیتابیس (تأییدشده)

```
Users: 2          ← test@khatib.com و avi@test.com
Levels: 7         ← beginner → C2
Scenarios: 8      ← سناریوهای عراقی
Transactions: 3   ← تراکنش تستی
```

✅ دیتابیس **پر و آماده** است.

---

## ۳. روترهای فعال بک‌اند (۱۳ عدد)

همه در `backend/app/main.py` خط ۱۳۵-۱۴۷ ثبت شدن:

| # | روتر | کار |
|---|---|---|
| ۱ | `health` | سلامت سرویس |
| ۲ | `auth` | ثبت‌نام/لاگین/refresh/logout/me |
| ۳ | `billing` | پرداخت + اشتراک + تاریخچه |
| ۴ | `speech` | تمرین متنی و صوتی |
| ۵ | `chat` | گفتگو با AI |
| ۶ | `progress` | پیشرفت + روند |
| ۷ | `learning` | سطوح + سناریوها |
| ۸ | `admin` | آمار + کاربران + تراکنش |
| ۹ | `privacy` | export + delete-account |
| ۱۰ | `eitaa` | وب‌هوک + لینک |
| ۱۱ | `translate` | ترجمه |
| ۱۲ | **`coach_ws`** | **WebSocket مربی آنلاین** |
| ۱۳ | **`admin_finance`** | **مالی + هزینه + فاکتور** |

**هیچ feature حذف نشده.**

---

## ۴. مدل User و نقش (تأیید قطعی)

```python
# backend/app/core/models.py خط ۵۰
class RoleEnum(str, enum.Enum):
    user = "user"
    admin = "admin"

# خط ۱۶۵
class User(Base):
    # ...
    role: Mapped[RoleEnum] = mapped_column(
        Enum(RoleEnum), default=RoleEnum.user, nullable=False  # خط ۱۷۵
    )
```

**ادمین کردن کاربر:**
```powershell
cd C:\Users\K.ali\Desktop\khatib-full-v1\backend
.\.\venv\Scripts\Activate.ps1
python -c "from app.core.db import SessionLocal; from app.core.models import User, RoleEnum; db=SessionLocal(); u=db.query(User).filter(User.email=='test@khatib.com').first(); u.role=RoleEnum.admin; db.commit(); print('OK - role:', u.role)"
```

---

## ۵. WebSocket مربی آنلاین (تأییدشده)

فایل `backend/app/routers/coach_ws.py`:
- ✅ وجود دارد
- ✅ در `main.py` خط ۱۴۶ include شده
- ✅ از `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview` استفاده می‌کند
- ✅ از `whisper-1` برای transcription استفاده می‌کند
- ⚠️ نیاز به `AI_API_KEY` معتبر دارد

---

## ۶. وضعیت صفحات فرانت‌اند

| صفحه | وضعیت | یادداشت |
|---|---|---|
| `/login`, `/register`, `/verify` | ✅ متصل | کامل |
| `/dashboard` | ✅ متصل | `progress/summary` + `speech/list` |
| `/practice` | ✅ متصل | ۴ حالت + WebSocket |
| `/learn`, `/learn/[levelId]` | ✅ متصل | ۷ سطح + ۸ سناریو |
| `/history` | ✅ متصل | `speech/list` + `billing/history` |
| `/progress` | ✅ متصل | `progress/summary` + `trends` |
| `/settings` | ✅ متصل | `auth/me` + `privacy` |
| `/admin`, `/admin/users`, `/admin/finance`, `/admin/finance/invoices/[id]` | ✅ متصل | کامل |
| `/admin/content`, `/admin/settings` | 🟡 نیمه‌کاره | محتوای ثابت |
| `/checkout` | 🟡 demo | بدون درگاه واقعی |
| **`/translator`** | 🔴 **Mock** | `mockTranslation` — به بک‌اند وصل نیست |
| `/pricing`, `/about`, `/help`, `/privacy`, `/terms` | 🟢 عمومی | استاتیک |

**تنها صفحه Mock واقعی: `/translator`**

---

## ۷. 🔴 مشکلات امنیتی فوری

کلیدهای زیر در `.env` لو رفته‌اند و **باید باطل شوند**:

```
JWT_SECRET=...          🔴 عوض کن
PASSWORD_PEPPER=...     🔴 عوض کن
AI_API_KEY=aa-...       🔴 از OpenAI باطل کن
```

**دستور جایگزینی:**
```powershell
cd C:\Users\K.ali\Desktop\khatib-full-v1\backend
.\.\venv\Scripts\Activate.ps1
python -c "import secrets; print('JWT_SECRET=' + secrets.token_urlsafe(64)); print('PASSWORD_PEPPER=' + secrets.token_urlsafe(32))"
```
سپس با `notepad .env` جایگزین کن.

> ⚠️ بعد از تغییر `JWT_SECRET`، همه توکن‌ها باطل می‌شوند و کاربران باید دوباره لاگین کنند. این طبیعی است.

---

## ۸. 🟡 مشکلات غیرامنیتی

| # | مشکل | راه‌حل |
|---|---|---|
| ۱ | CORS ناقص (`127.0.0.1:3000` نیست) | `CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000` |
| ۲ | `/translator` Mock | اتصال به `POST /api/translate` |
| ۳ | پرداخت demo | `ZARINPAL_MERCHANT_ID` واقعی |
| ۴ | `/admin/content` و `/admin/settings` نیمه‌کاره | تکمیل |
| ۵ | `COOKIE_SECURE=false` | برای production `true` |
| ۶ | `STORAGE_BACKEND=local` | برای production S3/MinIO |
| ۷ | `DEBUG=true` | برای production `false` |
| ۸ | `METRICS_ENABLED=false` + `SENTRY_DSN=` | مانیتورینگ غیرفعال |
| ۹ | `EITAA_BOT_TOKEN=` | ربات ایتا غیرفعال |

---

## ۹. دیپلوی

- **فرانت:** Vercel (تحریم ایران — نیاز به پروکسی)
- **بک‌اند:** لوکال (`localhost:8000`)
- **راه‌حل پیشنهادی:** Cloudflare Worker (پروکسی) + Liara/ArvanCloud (بک‌اند)
- **`render.yaml`** در ریشه موجود است

---

## ۱۰. دستورات کلیدی

```powershell
# اجرای بک‌اند
cd C:\Users\K.ali\Desktop\khatib-full-v1\backend
.\.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0

# اجرای فرانت
cd C:\Users\K.ali\Desktop\khatib-full-v1\frontend
npm run dev

# ادمین کردن کاربر
cd C:\Users\K.ali\Desktop\khatib-full-v1\backend
.\.\venv\Scripts\Activate.ps1
python -c "from app.core.db import SessionLocal; from app.core.models import User, RoleEnum; db=SessionLocal(); u=db.query(User).filter(User.email=='test@khatib.com').first(); u.role=RoleEnum.admin; db.commit(); print('OK - role:', u.role)"
```

---

## ۱۱. 📌 نکات مهم برای هوش مصنوعی بعدی

### ⚠️ هشدارها
1. **فقط به این گزارش اعتماد کن** — سه گزارش قبلی متناقض بودن.
2. **`RoleEnum` وجود دارد** — نه رشته.
3. **`coach_ws.py` حذف نشده** — فعال است.
4. **دیتابیس SQLite است**، نه PostgreSQL.
5. **دیتابیس پر است** — ۲ کاربر، ۷ سطح، ۸ سناریو، ۳ تراکنش.
6. **در PowerShell، `dir /b` کار نمی‌کند** — از `Get-ChildItem -Name` استفاده کن.
7. **هر دستور را جدا بزن** — چند خط با هم پیست نکن.
8. **قبل از تغییر، فایل را با `notepad` باز کن** و محتوای فعلی را ببین.
9. **هرگز `main.py` و `AppShell.tsx` را بدون درخواست صریح تغییر نده.**

### 🎯 اولویت‌های بعدی
1. 🔴 باطل کردن کلیدهای لو رفته (JWT_SECRET، PASSWORD_PEPPER، AI_API_KEY)
2. 🟡 اضافه کردن `127.0.0.1:3000` به CORS
3. 🟡 اتصال `/translator` به `POST /api/translate`
4. 🟢 تکمیل `/admin/content` و `/admin/settings`
5. 🟢 حل دیپلوی (Cloudflare Worker یا Liara)

---

## ۱۲. جمع‌بندی

> پروژه «خطیب» در وضعیت **۸۵٪ آماده** است. همه featureهای اصلی (WebSocket مربی، آموزش عراقی، مالی، ادمین، احراز هویت) کد کامل دارند و فعالند. دیتابیس پر است. فقط یک صفحه (`/translator`) Mock مانده و کلیدهای امنیتی باید عوض شوند. با رفع این دو مورد + دیپلوی، پروژه **آماده ارائه** است.