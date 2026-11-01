# تکمیل بخش‌های ناقص

## #۱۱ PWA / موبایل
- `public/manifest.webmanifest`
- `public/sw.js` (cache shell + offline fallback)
- آیکون‌های 192/512 و apple-touch
- ثبت Service Worker + بنر نصب (`RegisterSW`)
- metadata و theme-color در layout
- safe-area برای BottomNav

## #۱۲ چندزبانگی
- دیکشنری `lib/i18n/ui.ts`
- Sidebar / BottomNav / Dashboard / Settings (زبان) سه‌زبانه
- `document.lang` و `dir` از languageStore

## ناوبری
- لینک ویدیو، مخاطب مجازی، جلسه آنلاین در منو
- BottomNav موبایل به‌روز

## مایگریشن‌های لازم (اگر تا الان نزده‌اید)
```bash
alembic upgrade head
```
تا آخرین revision: `h8c9d0e1f2a3`

## محدودیت‌های باقی‌مانده (عمداً خارج از scope بدون زیرساخت خارجی)
- SDK رسمی Zoom/Google OAuth
- Gaze دقیق مردمک (مدل ML جدا)
- رندر VR داخل هدست با Three.js
- درگاه پرداخت واقعی (الان demo)
- پوش‌نوتیفیکیشن سروری / ایمیل SMTP
