# ارتقای آموزش عراقی خطیب — ۲۱۰ سناریو

## چه چیزی اضافه شد
- ۷ سطح × ۳۰ سناریو (مبتدی، A1، A2، B1، B2، C1، C2) با: موقعیت، هدف‌ها، ۱۲ تا ۱۶ واژه با جمله‌ی نمونه، دیالوگ نمونه‌ی فارسی/عراقی، معیار موفقیت، اشتباه‌های رایج فارسی‌زبان‌ها، نکته‌ی فرهنگی
- مربی هوشمند که سناریو، سطح، واژگان و خطاهای رایج را می‌داند و تا ۱۲ پیام قبلی را به یاد دارد
- قفل سناریوها: هر بار ۲ سناریوی جلوتر باز است؛ سطح بعد با ۶۰٪ تکمیل سطح قبل باز می‌شود
- صفحه‌ی جزئیات سناریو با تب‌ها، دکمه‌ی تلفظ (صدای مرورگر) و فیلتر موضوع/وضعیت
- میکروفون واقعی (تشخیص گفتار ar-IQ در Chrome/Edge)؛ متن در کادر می‌نشیند و قبل از ارسال قابل ویرایش است
- حداقل پیام برای تکمیل سناریو دوباره ۳ شد

## فایل‌ها
جدید: alembic j0e1f2a3b4c5، app/services/iraqi_coach.py، scripts/seed_iraqi_curriculum.py، scripts/apply_iraqi_patch.py، scripts/iraqi_content/curriculum.json، frontend: features/learning/iraqi.ts، features/speech/useSpeechToText.ts، app/learn/scenario/[scenarioId]/page.tsx
جایگزین: app/services/learning_engine.py، app/routers/learning.py، app/schemas/learning.py، frontend: app/learn/page.tsx، app/learn/[levelId]/page.tsx، app/coach/[id]/page.tsx
اصلاح با اسکریپت: app/core/models.py، app/services/chat_service.py
