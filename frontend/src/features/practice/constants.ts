// ============================================
// Practice Studio - Constants & i18n-ready
// ============================================

export type Language = "fa" | "ar" | "en";

export const PRACTICE_MODES = {
  free: { fa: "آزاد", ar: "حر", en: "Free" },
  script: { fa: "متن‌خوانی", ar: "قراءة النص", en: "Script" },
  impromptu: { fa: "بداهه", ar: "ارتجال", en: "Impromptu" },
  presentation: { fa: "ارائه", ar: "عرض تقديمي", en: "Presentation" },
} as const;

export const DIMENSION_LABELS = {
  confidence: { fa: "اعتماد به نفس", ar: "الثقة بالنفس", en: "Confidence" },
  pace: { fa: "سرعت گفتار", ar: "سرعة الكلام", en: "Pace" },
  clarity: { fa: "وضوح", ar: "الوضوح", en: "Clarity" },
  tone: { fa: "لحن", ar: "النبرة", en: "Tone" },
  fluency: { fa: "روانی", ar: "الطلاقة", en: "Fluency" },
  structure: { fa: "ساختار", ar: "الهيكل", en: "Structure" },
  content: { fa: "محتوا", ar: "المحتوى", en: "Content" },
} as const;

export const UI_TEXT = {
  // Practice page
  overallScore: { fa: "امتیاز کلی", ar: "النتيجة الإجمالية", en: "Overall Score" },
  dimensionAnalysis: { fa: "تحلیل ابعاد", ar: "تحليل الأبعاد", en: "Dimension Analysis" },
  coachTip: { fa: "پیشنهاد مربی", ar: "نصيحة المدرب", en: "Coach Tip" },
  startRecording: { fa: "برای شروع مکالمه زنده، دکمه را بزنید", ar: "اضغط على الزر لبدء المحادثة الحية", en: "Click the button to start live conversation" },
  listening: { fa: "در حال گوش دادن... (صحبت کنید و مکث کنید)", ar: "جارٍ الاستماع... (تحدث وتوقف)", en: "Listening... (speak and pause)" },
  uploadAudio: { fa: "بارگذاری فایل صوتی", ar: "تحميل ملف صوتي", en: "Upload Audio File" },
  processingAudio: { fa: "در حال پردازش فایل صوتی...", ar: "جارٍ معالجة الملف الصوتي...", en: "Processing audio file..." },
  analyzing: { fa: "در حال تحلیل...", ar: "جارٍ التحليل...", en: "Analyzing..." },
  noSuggestion: { fa: "برای دریافت پیشنهاد، تمرین کنید.", ar: "تدرب للحصول على نصيحة.", en: "Practice to get a suggestion." },
  sourceText: { fa: "متن گفتار شما اینجا ظاهر می‌شود...", ar: "سيظهر نص كلامك هنا...", en: "Your speech text will appear here..." },
  audioFileError: { fa: "لطفاً یک فایل صوتی انتخاب کنید.", ar: "الرجاء اختيار ملف صوتي.", en: "Please select an audio file." },
  micError: { fa: "دسترسی به میکروفون امکان‌پذیر نیست.", ar: "لا يمكن الوصول إلى الميكروفون.", en: "Microphone access is not available." },
  
  // Analysis page
  analysisTitle: { fa: "تحلیل سخنرانی", ar: "تحليل الخطاب", en: "Speech Analysis" },
  analysisSubtitle: { fa: "نتیجه تمرین شما با هوش مصنوعی", ar: "نتيجة تمرينك بالذكاء الاصطناعي", en: "Your practice result with AI" },
  status: { fa: "وضعیت", ar: "الحالة", en: "Status" },
  completed: { fa: "تکمیل شده", ar: "مكتمل", en: "Completed" },
  processing: { fa: "در حال پردازش", ar: "قيد المعالجة", en: "Processing" },
  pending: { fa: "در انتظار", ar: "قيد الانتظار", en: "Pending" },
  failed: { fa: "ناموفق", ar: "فاشل", en: "Failed" },
  strengths: { fa: "نقاط قوت", ar: "نقاط القوة", en: "Strengths" },
  weaknesses: { fa: "نقاط ضعف", ar: "نقاط الضعف", en: "Weaknesses" },
  improvements: { fa: "پیشنهادهای بهبود", ar: "اقتراحات التحسين", en: "Improvements" },
  structureNotes: { fa: "یادداشت ساختار", ar: "ملاحظات الهيكل", en: "Structure Notes" },
  nextPractice: { fa: "تمرین بعدی", ar: "التمرين التالي", en: "Next Practice" },
  transcript: { fa: "متن پیاده‌شده", ar: "النص المكتوب", en: "Transcript" },
  noData: { fa: "داده‌ای موجود نیست", ar: "لا توجد بيانات", en: "No data available" },
  
  // Buttons
  retry: { fa: "تمرین مجدد", ar: "تدرب مرة أخرى", en: "Practice Again" },
  shareAudio: { fa: "اشتراک‌گذاری صوت", ar: "مشاركة الصوت", en: "Share Audio" },
  shareAnalysis: { fa: "اشتراک‌گذاری تحلیل", ar: "مشاركة التحليل", en: "Share Analysis" },
  print: { fa: "چاپ", ar: "طباعة", en: "Print" },
  downloadPdf: { fa: "دانلود PDF", ar: "تحميل PDF", en: "Download PDF" },
  back: { fa: "بازگشت", ar: "رجوع", en: "Back" },
  copyLink: { fa: "کپی لینک", ar: "نسخ الرابط", en: "Copy Link" },
  copied: { fa: "کپی شد!", ar: "تم النسخ!", en: "Copied!" },
  shareText: { fa: "تحلیل سخنرانی من در خطیب", ar: "تحليل خطابي في خطيب", en: "My speech analysis in Khatib" },
  
  // Score labels
  excellent: { fa: "عالی", ar: "ممتاز", en: "Excellent" },
  good: { fa: "خوب", ar: "جيد", en: "Good" },
  average: { fa: "متوسط", ar: "متوسط", en: "Average" },
  needsWork: { fa: "نیاز به تمرین", ar: "يحتاج إلى تدريب", en: "Needs Work" },
} as const;

export type UITextKey = keyof typeof UI_TEXT;
export type PracticeMode = keyof typeof PRACTICE_MODES;
export type DimensionKey = keyof typeof DIMENSION_LABELS;

export function t(key: UITextKey, lang: Language = "fa"): string {
  return UI_TEXT[key][lang];
}

export function tMode(key: PracticeMode, lang: Language = "fa"): string {
  return PRACTICE_MODES[key][lang];
}

export function tDimension(key: DimensionKey, lang: Language = "fa"): string {
  const labels = DIMENSION_LABELS as Record<string, Record<Language, string>>;
  return labels[key]?.[lang] ?? key;
}

export function getScoreLabel(score: number, lang: Language = "fa"): string {
  if (score >= 80) return t("excellent", lang);
  if (score >= 60) return t("good", lang);
  if (score >= 40) return t("average", lang);
  return t("needsWork", lang);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export const DEFAULT_LANGUAGE: Language = "fa";