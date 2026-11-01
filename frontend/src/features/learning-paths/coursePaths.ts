// ============================================
// مسیرهای آموزشی چندهفته‌ای
// هر مسیر چند هفته دارد؛ هر هفته به یک آیتم مشخص از بانک محتوای موجود
// (features/practice/content.ts) وصل است تا کاربر دقیقاً همان تمرین را در
// استودیوی سخنرانی انجام دهد، به‌علاوه یک آزمونک کوتاه برای مرور نکات کلیدی.
// ============================================

import type { PracticeLevel } from "@/features/practice/content";

export type CoursePathMode = "script" | "impromptu" | "presentation";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface CourseWeek {
  id: string;
  weekNumber: number;
  title: string;
  description: string;
  mode: CoursePathMode;
  level: PracticeLevel;
  /** شناسه‌ی آیتم در SCRIPT_BANK / IMPROMPTU_BANK / PRESENTATION_BANK */
  bankId: string;
  quiz: QuizQuestion[];
}

export interface CoursePath {
  id: string;
  title: string;
  description: string;
  level: PracticeLevel;
  icon: string;
  weeks: CourseWeek[];
}

export const COURSE_PATHS: CoursePath[] = [
  {
    id: "path-foundations",
    title: "مسیر مبتدی: پایه‌های سخنرانی",
    description: "چهار هفته برای ساختن پایه‌ی محکم در متن‌خوانی، بداهه‌گویی و ارائه‌ی ساده.",
    level: "beginner",
    icon: "🌱",
    weeks: [
      {
        id: "foundations-w1",
        weekNumber: 1,
        title: "معرفی خود با صدای رسا",
        description: "روی وضوح بیان و سرعت مناسب در معرفی خود تمرکز کنید.",
        mode: "script",
        level: "beginner",
        bankId: "script-b1",
        quiz: [
          {
            question: "برای معرفی خود در یک جلسه کاری، بهترین سرعت بیان چیست؟",
            options: ["خیلی سریع تا وقت کم نگیرد", "متوسط و قابل‌فهم با مکث‌های کوتاه", "خیلی آهسته و کشیده"],
            correctIndex: 1,
          },
          {
            question: "مکث کوتاه بین جملات چه کمکی می‌کند؟",
            options: ["باعث فراموشی مخاطب می‌شود", "به مخاطب فرصت پردازش جمله را می‌دهد", "هیچ تاثیری ندارد"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "foundations-w2",
        weekNumber: 2,
        title: "معرفی یک محصول ساده",
        description: "تمرین لحن متقاعدکننده بدون اغراق، با جملات کوتاه و شفاف.",
        mode: "script",
        level: "beginner",
        bankId: "script-b2",
        quiz: [
          {
            question: "در معرفی یک محصول، کدام رویکرد معمولاً بهتر جواب می‌دهد؟",
            options: ["تمرکز روی ویژگی‌های فنی پیچیده", "تمرکز روی فایده‌ی ملموس برای مخاطب", "استفاده از کلمات مبهم و پرطمطراق"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "foundations-w3",
        weekNumber: 3,
        title: "اولین تمرین بداهه‌گویی",
        description: "بدون متن از پیش نوشته‌شده، درباره‌ی یک موضوع ساده صحبت کنید.",
        mode: "impromptu",
        level: "beginner",
        bankId: "imp-b1",
        quiz: [
          {
            question: "در بداهه‌گویی، بهترین راه برای جلوگیری از «ام و اه» گفتن چیست؟",
            options: ["سریع‌تر صحبت کردن", "قبل از جمله بعدی یک نفس کوتاه و مکث بگیرید", "جملات را خیلی طولانی کنید"],
            correctIndex: 1,
          },
          {
            question: "یک ساختار ساده برای پاسخ بداهه چیست؟",
            options: ["نظر → دلیل → مثال", "فقط مثال بدون نتیجه‌گیری", "شروع با عذرخواهی بابت آماده نبودن"],
            correctIndex: 0,
          },
        ],
      },
      {
        id: "foundations-w4",
        weekNumber: 4,
        title: "اولین ارائه‌ی کوتاه",
        description: "یک ارائه‌ی کوتاه و ساختارمند با شروع، بدنه و نتیجه‌گیری تمرین کنید.",
        mode: "presentation",
        level: "beginner",
        bankId: "pres-b1",
        quiz: [
          {
            question: "یک ارائه‌ی خوب معمولاً با چه چیزی شروع می‌شود؟",
            options: ["یک جمله‌ی جذاب یا سوال برای جلب توجه", "فهرست کامل منابع", "عذرخواهی بابت کمبود وقت آماده‌سازی"],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
  {
    id: "path-business",
    title: "مسیر متوسط: ارتباط حرفه‌ای و اقناع",
    description: "چهار هفته برای تقویت ارائه‌های کاری، گزارش‌دهی و بداهه‌گویی در موقعیت‌های حرفه‌ای.",
    level: "intermediate",
    icon: "💼",
    weeks: [
      {
        id: "business-w1",
        weekNumber: 1,
        title: "تاثیر فناوری بر بازار کار",
        description: "روی انسجام منطقی و ساختار استدلال تمرکز کنید.",
        mode: "script",
        level: "intermediate",
        bankId: "script-i1",
        quiz: [
          {
            question: "برای افزایش «انسجام منطقی» یک متن چه باید کرد؟",
            options: ["هر جمله را بدون ارتباط با قبلی بیان کرد", "از رابط‌های منطقی (بنابراین، در نتیجه، اما) استفاده کرد", "جملات را کوتاه‌تر از حد لازم کرد"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "business-w2",
        weekNumber: 2,
        title: "ارائه‌ی گزارش فصلی",
        description: "لحن مطمئن و داده‌محور برای گزارش‌دهی به مدیر.",
        mode: "script",
        level: "intermediate",
        bankId: "script-i2",
        quiz: [
          {
            question: "در گزارش‌دهی به مدیر، کدام مورد اعتبار بیشتری ایجاد می‌کند؟",
            options: ["بیان کلی و بدون عدد", "اشاره به اعداد و روند مشخص همراه با یک پیشنهاد عملی", "تمرکز فقط روی مشکلات بدون راه‌حل"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "business-w3",
        weekNumber: 3,
        title: "بداهه‌گویی در جلسه",
        description: "پاسخ سریع و ساختارمند به یک سوال غیرمنتظره در جلسه کاری.",
        mode: "impromptu",
        level: "intermediate",
        bankId: "imp-i1",
        quiz: [
          {
            question: "وقتی سوالی غیرمنتظره در جلسه می‌پرسند، بهترین کار چیست؟",
            options: ["فوراً و بدون مکث هر چیزی گفت", "چند ثانیه فکر کرد و پاسخ را ساختارمند بیان کرد", "موضوع را عوض کرد"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "business-w4",
        weekNumber: 4,
        title: "ارائه‌ی ایده به تیم",
        description: "متقاعدسازی تیم با استدلال روشن و پاسخ به نگرانی‌های احتمالی.",
        mode: "presentation",
        level: "intermediate",
        bankId: "pres-i1",
        quiz: [
          {
            question: "برای متقاعد کردن یک تیم، کدام رویکرد موثرتر است؟",
            options: ["نادیده گرفتن نگرانی‌های احتمالی مخالفان", "پیش‌بینی نگرانی‌ها و پاسخ‌دادن به آن‌ها در ارائه", "صحبت طولانی‌تر برای خسته کردن مخالفان"],
            correctIndex: 1,
          },
        ],
      },
    ],
  },
  {
    id: "path-mastery",
    title: "مسیر پیشرفته: تسلط و تاثیرگذاری",
    description: "چهار هفته برای رسیدن به سطح حرفه‌ای در اقناع، ارائه‌های پیچیده و بداهه‌گویی تحت فشار.",
    level: "advanced",
    icon: "🏆",
    weeks: [
      {
        id: "mastery-w1",
        weekNumber: 1,
        title: "متن‌خوانی پیشرفته",
        description: "تمرکز روی تنوع آهنگ کلام و تاکیدهای هدفمند.",
        mode: "script",
        level: "advanced",
        bankId: "script-a1",
        quiz: [
          {
            question: "تنوع آهنگ کلام (pitch variation) چه کمکی به سخنران می‌کند؟",
            options: ["باعث خستگی مخاطب می‌شود", "توجه مخاطب را حفظ و نکات کلیدی را برجسته می‌کند", "هیچ تاثیری ندارد"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "mastery-w2",
        weekNumber: 2,
        title: "متن‌خوانی تخصصی",
        description: "تسلط بر واژگان تخصصی بدون از دست دادن روانی بیان.",
        mode: "script",
        level: "advanced",
        bankId: "script-a2",
        quiz: [
          {
            question: "وقتی متن شامل واژگان تخصصی است، چه باید کرد؟",
            options: ["سرعت را بیشتر کرد تا زود تمام شود", "روی تلفظ درست آن واژه‌ها از قبل تمرین کرد", "آن واژه‌ها را حذف کرد"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "mastery-w3",
        weekNumber: 3,
        title: "بداهه‌گویی تحت فشار",
        description: "پاسخ به یک سوال چالشی یا انتقادی، با آرامش و ساختار.",
        mode: "impromptu",
        level: "advanced",
        bankId: "imp-a1",
        quiz: [
          {
            question: "در پاسخ به یک سوال انتقادی، اولین قدم چیست؟",
            options: ["دفاعی و تند واکنش نشان دادن", "با آرامش نکته را تایید یا بازتعریف کرد و سپس پاسخ داد", "سوال را نادیده گرفت"],
            correctIndex: 1,
          },
        ],
      },
      {
        id: "mastery-w4",
        weekNumber: 4,
        title: "ارائه‌ی نهایی: تاثیرگذاری کامل",
        description: "ترکیب تمام مهارت‌ها در یک ارائه‌ی کامل و تاثیرگذار.",
        mode: "presentation",
        level: "advanced",
        bankId: "pres-a1",
        quiz: [
          {
            question: "یک ارائه‌ی تاثیرگذار معمولاً با چه چیزی به پایان می‌رسد؟",
            options: ["یک جمع‌بندی روشن و یک فراخوان به عمل (call to action)", "قطع ناگهانی بدون نتیجه‌گیری", "تکرار دوباره‌ی کل متن از ابتدا"],
            correctIndex: 0,
          },
        ],
      },
    ],
  },
];
