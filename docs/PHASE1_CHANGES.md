# مرحله ۱ — تغییرات اعمال‌شده

تاریخ: ۱۴۰۴ / اکتبر ۲۰۲۶

## خلاصه

| مورد | وضعیت |
|------|--------|
| امنیت اشتراک‌گذاری (#۱۰) | ✅ انقضا، لغو، مخفی‌کردن رونوشت، rate-limit نظر |
| صفحه `/progress` | ✅ اتصال واقعی به API + نمودار + مدال‌ها + یادآور |
| پیگیری بلندمدت (#۳) | ✅ یادآور تمرین + مقایسه با میانگین پلتفرم + روند ابعاد |
| گیمیفیکیشن (#۴) | ✅ چالش روزانه + مدال‌های بیشتر (۱۲ عدد) از بک‌اند |
| مسیرهای آموزشی (#۹) | ✅ پیشرفت سمت سرور (`course_week_progress`) + fallback local |
| چندزبانگی (#۱۲) | ✅ store زبان + انتخابگر در تنظیمات (تمرین از قبل داشت) |

## مایگریشن اجباری

```bash
cd backend
alembic upgrade head
```

ریویژن جدید: `e5f6a7b8c9d0_share_security_and_course_progress`

اگر روی Render دیپلوی می‌کنید، بعد از deploy این دستور را در shell سرویس بک‌اند اجرا کنید (یا در start command اضافه کنید).

## APIهای جدید / تغییر یافته

### Share
- `POST /api/speech/{id}/share` — body اختیاری: `{ expires_in_days, show_transcript }`
- `GET /api/speech/{id}/share` — وضعیت لینک برای صاحب
- `PATCH /api/speech/{id}/share` — تغییر انقضا / نمایش رونوشت
- `DELETE /api/speech/{id}/share` — لغو لینک
- نظرات عمومی: حداکثر ۵ در ۱۰ دقیقه per IP+token و سقف ۵۰ نظر روی هر لینک

### Course progress
- `GET /api/course-progress/me`
- `GET /api/course-progress/{path_id}`
- `POST /api/course-progress/mark`
- `DELETE /api/course-progress/{path_id}/{week_id}`

### Progress summary (فیلدهای جدید)
- `daily_practice_count`, `daily_challenge_target`
- `days_since_last_practice`, `reminder_message`
- `badges[]`

## نکات دیپلوی

1. بک‌اند را ری‌استارت کنید.
2. `alembic upgrade head` را اجرا کنید.
3. فرانت را روی Vercel redeploy کنید.
4. لینک‌های اشتراک قدیمی بدون `expires_at` همچنان فعال می‌مانند تا وقتی صاحب‌شان revoke کند یا دوباره بسازد (پیش‌فرض انقضای ۷ روز برای لینک‌های جدید).

## خارج از این مرحله (عمداً)

- تحلیل ویدیو / تماس چشمی
- VR / مخاطب مجازی
- Zoom / Meet
- تمرین تلفظ تخصصی
- اپ موبایل / PWA کامل
