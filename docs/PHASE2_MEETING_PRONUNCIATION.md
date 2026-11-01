# مرحله ۲ — #۵ جلسه آنلاین + #۷ تلفظ

## #۷ تمرین تلفظ و لهجه
- حالت جدید `pronunciation` در استودیو تمرین
- بانک عبارات فارسی + عراقی (`PRONUNCIATION_BANK`)
- API: `POST /api/practice/pronunciation-feedback`
- پنل تحلیل تلفظ با امتیاز، دقت، لهجه، ریتم، مسائل و تمرین بعدی

## #۵ تمرین با Zoom / Meet
- مدل و جدول `meeting_sessions`
- API: `POST/GET /api/meetings` و `POST /api/meetings/{id}/end`
- صفحه `/practice/meeting`
- تشخیص خودکار provider از URL
- بعد از جلسه: لینک به آپلود صوت / حالت تلفظ

### محدودیت صادقانه
اتصال SDK رسمی Zoom/Google Meet (OAuth، ضبط خودکار داخل پلتفرم) نیاز به حساب توسعه‌دهنده و کلید API دارد و در این مرحله پیاده نشده.
جریان عملی: ثبت لینک → باز کردن جلسه → آپلود صوت بعد از جلسه برای تحلیل.

## مایگریشن
```bash
cd backend
alembic upgrade head
```
ریویژن: `f6a7b8c9d0e1_meeting_sessions`
