import type { Language } from "@/features/practice/constants";

type Dict = Record<string, { fa: string; ar: string; en: string }>;

export const UI: Dict = {
  appName: { fa: "خطیب", ar: "خطيب", en: "Khatib" },
  dashboard: { fa: "داشبورد", ar: "لوحة التحكم", en: "Dashboard" },
  practice: { fa: "استودیوی سخنرانی", ar: "استوديو الخطابة", en: "Speech Studio" },
  translator: { fa: "مترجم زنده", ar: "المترجم الحي", en: "Live Translator" },
  learn: { fa: "آموزش عراقی", ar: "تعلّم اللهجة العراقية", en: "Iraqi Learning" },
  history: { fa: "تاریخچه", ar: "السجل", en: "History" },
  progress: { fa: "پیشرفت من", ar: "تقدّمي", en: "My Progress" },
  paths: { fa: "مسیرهای آموزشی", ar: "المسارات التعليمية", en: "Learning Paths" },
  team: { fa: "تیم من", ar: "فريقي", en: "My Team" },
  settings: { fa: "تنظیمات", ar: "الإعدادات", en: "Settings" },
  video: { fa: "تحلیل ویدیو", ar: "تحليل الفيديو", en: "Video Analysis" },
  audience: { fa: "مخاطب مجازی", ar: "جمهور افتراضي", en: "Virtual Audience" },
  meeting: { fa: "جلسه آنلاین", ar: "اجتماع عبر الإنترنت", en: "Online Meeting" },
  pronunciation: { fa: "تلفظ و لهجه", ar: "النطق واللهجة", en: "Pronunciation" },
  logout: { fa: "خروج از حساب", ar: "تسجيل الخروج", en: "Log out" },
  home: { fa: "خانه", ar: "الرئيسية", en: "Home" },
  coach: { fa: "مربی", ar: "المدرّب", en: "Coach" },
  profile: { fa: "پروفایل", ar: "الملف", en: "Profile" },
  adminDash: { fa: "داشبورد ادمین", ar: "لوحة المشرف", en: "Admin" },
  adminUsers: { fa: "مدیریت کاربران", ar: "المستخدمون", en: "Users" },
  adminFinance: { fa: "مدیریت مالی", ar: "المالية", en: "Finance" },
  adminContent: { fa: "مدیریت محتوا", ar: "المحتوى", en: "Content" },
  adminSettings: { fa: "تنظیمات سیستم", ar: "إعدادات النظام", en: "System" },
  installApp: { fa: "نصب اپلیکیشن", ar: "تثبيت التطبيق", en: "Install app" },
  offlineHint: { fa: "حالت آفلاین — برخی بخش‌ها محدود است", ar: "وضع عدم الاتصال", en: "Offline — limited features" },
  language: { fa: "زبان رابط", ar: "لغة الواجهة", en: "Interface language" },
  greeting: { fa: "سلام", ar: "مرحباً", en: "Hello" },
  readyToday: {
    fa: "آماده‌ای تا امروز صدای خودت رو متحول کنی؟",
    ar: "هل أنت مستعد لتطوير صوتك اليوم؟",
    en: "Ready to transform your voice today?",
  },
  practiceNow: { fa: "تمرین الان", ar: "تدرّب الآن", en: "Practice now" },
  dailyChallenge: { fa: "چالش امروز", ar: "تحدي اليوم", en: "Today's challenge" },
  weeklyChallenge: { fa: "چالش این هفته", ar: "تحدي هذا الأسبوع", en: "Weekly challenge" },
  streak: { fa: "روز متوالی", ar: "أيام متتالية", en: "day streak" },
  level: { fa: "سطح", ar: "المستوى", en: "Level" },
  save: { fa: "ذخیره", ar: "حفظ", en: "Save" },
  loading: { fa: "در حال بارگذاری…", ar: "جارٍ التحميل…", en: "Loading…" },
};

export function tUI(key: keyof typeof UI, lang: Language): string {
  const row = UI[key];
  if (!row) return String(key);
  return row[lang] || row.fa;
}
