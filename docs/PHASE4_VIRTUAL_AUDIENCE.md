# #۲ مخاطب مجازی / VR

## مسیر
`/practice/audience`

## قابلیت‌ها
- حضار ۲.۵بعدی با تعداد قابل تنظیم (۶/۱۲/۱۸/۲۴)
- واکنش به انرژی میکروفون: engaged / clap / bored
- حالت تمام‌صفحه (immersive)
- دکمه VR: تشخیص WebXR؛ در صورت نبود هدست → immersive
- ذخیره جلسه: انرژی متوسط/اوج، تعامل، سکوت

## API
- `POST /api/audience/sessions`
- `GET /api/audience/sessions`

## مایگریشن
```bash
alembic upgrade head
```
Revision: `h8c9d0e1f2a3_audience_sessions`

## محدودیت
رندر کامل داخل هدست VR با مدل سه‌بعدی (Three.js/WebGL) در این مرحله پیاده نشده؛ صحنه واکنش‌گر صفحه + immersive است.
