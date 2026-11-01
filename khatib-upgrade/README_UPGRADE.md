# خطیب — ارتقای بخش آموزش گویش عراقی (نهایی)

تاریخ: ۱۴۰۴  
نسخه ارتقا: Learning Hub + Interactive Coach + Smart Feedback + ~80 Scenarios

---

## خلاصه تغییرات

### ۱) فرانت‌اند — Learning Hub (`/learn`)
- صفحه مسیر یادگیری کاملاً بازطراحی شد
- آمار پیشرفت، توصیه روزانه، مسیر عمودی سطوح
- صفحه هر سطح با گروه‌بندی سناریو و کارت‌های حرفه‌ای

### ۲) فرانت‌اند — جلسه مربی (`/coach/[id]`)
- میکروفون زنده (Speech-to-Text مرورگر)
- پاسخ صوتی مربی (Text-to-Speech)
- هماهنگی میکروفون و صدا
- پنل بازخورد هوشمند زیر پیام مربی:
  - اصلاحات
  - پیشنهاد بهتر
  - واژگان عراقی
  - نکات

### ۳) بک‌اند — بازخورد ساختاریافته
- `ChatReplyResponse` گسترش یافت: `suggestions`, `vocabulary`
- `POST /api/chat/conversations/{id}/messages` حالا `MessageWithFeedbackResponse` برمی‌گرداند
- پرامپت مربی عراقی قوی‌تر شد

### ۴) محتوا — حدود ۸۰ سناریو
- ۷ سطح: مبتدی تا C2
- دسته‌ها: daily / restaurant / market / hotel / work / travel / social
- هر سناریو: عنوان، توضیح، واژگان، practice_prompt

---

## فایل‌های این بسته

```
khatib-upgrade/
├── README_UPGRADE.md
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── learn/page.tsx
│       │   ├── learn/[levelId]/page.tsx
│       │   └── coach/[id]/page.tsx
│       ├── features/
│       │   ├── learning/hooks.ts
│       │   └── chat/chat.service.ts
│       └── types/chat.ts
└── backend/
    ├── app/
    │   ├── schemas/ai.py
    │   ├── schemas/chat.py
    │   ├── services/chat_service.py
    │   ├── services/ai_prompts.py
    │   └── routers/chat.py
    └── scripts/seed_learning_content.py
```

---

## نحوه نصب (جایگزینی فایل‌ها)

فرض: ریشه پروژه شما چیزی شبیه این است:

```
KHATIBai-go/
  frontend/
  backend/
```

### فرانت

از پوشه `khatib-upgrade/frontend` فایل‌ها را روی `frontend` پروژه کپی کنید:

```
frontend/src/app/learn/page.tsx
frontend/src/app/learn/[levelId]/page.tsx
frontend/src/app/coach/[id]/page.tsx
frontend/src/features/learning/hooks.ts
frontend/src/features/chat/chat.service.ts
frontend/src/types/chat.ts
```

### بک‌اند

از پوشه `khatib-upgrade/backend` فایل‌ها را روی `backend` پروژه کپی کنید:

```
backend/app/schemas/ai.py
backend/app/schemas/chat.py
backend/app/services/chat_service.py
backend/app/services/ai_prompts.py
backend/app/routers/chat.py
backend/scripts/seed_learning_content.py
```

---

## دستورات بعد از کپی

### ۱) Seed سناریوها

```powershell
cd backend
.\venv\Scripts\Activate.ps1
python scripts/seed_learning_content.py
```

خروجی مورد انتظار شبیه:

```
Learning content ready. catalog=80 added=... updated/skipped=...
```

### ۲) ریستارت بک‌اند

```powershell
# Ctrl+C سپس:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### ۳) ریستارت فرانت (اگر لازم)

```powershell
cd frontend
npm run dev
```

---

## تست سریع

1. `http://localhost:3000/learn` — مسیر سطوح و آمار
2. یک سطح باز → شروع سناریو
3. در جلسه مربی:
   - میکروفون را روشن کنید و صحبت کنید
   - یا متن بفرستید
4. زیر پاسخ مربی باید پنل اصلاحات / پیشنهاد / واژگان دیده شود

**نکته AI:** برای پاسخ واقعی مربی، `AI_API_KEY` و `AI_BASE_URL` در `.env` بک‌اند باید معتبر باشد (مثلاً AvalAI).

---

## وابستگی‌های بدون تغییر

- APIهای learning موجود (`/api/learning/...`) بدون breaking change
- مدل‌های دیتابیس سناریو تغییر نکردند (فقط محتوا زیاد شد)
- نیاز به migration جدید برای این ارتقا نیست

---

## مراحل بعدی پیشنهادی (اختیاری)

- افزایش سناریوها تا ۱۵۰–۲۰۰
- STT سمت سرور (دقت بالاتر از Web Speech API)
- مسیرهای موضوعی جدا (Learning Paths)
- امتیاز تلفظ دقیق‌تر در همان جلسه

---

**وضعیت:** آماده تحویل و اعمال روی پروژه اصلی
