# استقرار V1 قابل فروش — خطیب

## پیش‌نیاز

- دامنه فرانت: مثلاً `https://app.khatib.app`
- دامنه API: مثلاً `https://api.khatib.app`
- PostgreSQL + Redis
- Worker بک‌اند در حال اجرا
- کلید زرین‌پال (production) و AI

## ۱. بک‌اند

طبق `../backend_patches/APPLY_V1.md`:

- `FRONTEND_URL=https://app.khatib.app`
- `CORS_ORIGINS=https://app.khatib.app`
- `COOKIE_SECURE=true`
- `ZARINPAL_CALLBACK_URL=https://api.khatib.app/api/billing/callback`
- `ZARINPAL_SANDBOX=false`
- `PAYMENT_PROVIDER=zarinpal`
- ریدایرکت callback به `/payment-result` روی **فرانت** (نه API)

## ۲. فرانت

```bash
cd khatib-frontend
cp .env.example .env.local
# NEXT_PUBLIC_API_BASE_URL=https://api.khatib.app

npm ci
npm run build
npm start
# یا Docker:
docker build --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.khatib.app -t khatib-web .
docker run -p 3000:3000 khatib-web
```

پشت reverse proxy (Nginx/Caddy) با HTTPS قرار دهید.

## ۳. چک‌لیست قبل از فروش

- [ ] ثبت‌نام با ایمیل واقعی
- [ ] ورود و ماندن session بعد از refresh صفحه
- [ ] refresh token بعد از منقضی شدن access (۱۵ دقیقه)
- [ ] تمرین متنی → صفحه نتیجه با امتیاز
- [ ] آپلود صوت → تحلیل
- [ ] چت با مربی AI
- [ ] مسیر یادگیری (level → scenario → start)
- [ ] checkout → زرین‌پال → برگشت به `/payment-result?status=success`
- [ ] export داده از تنظیمات
- [ ] حذف حساب
- [ ] CORS از دامنه فرانت (نه از Postman alone)
- [ ] صفحه Privacy و Terms نهایی و واقعی

## ۴. امنیت حداقلی V1

- HTTPS همه‌جا
- Secrets تصادفی قوی برای JWT و pepper
- `COOKIE_SECURE=true`
- بدون `DEBUG=true` در production
- بک‌آپ دیتابیس روزانه
- محدودیت rate روی auth (از قبل در بک‌اند هست)
