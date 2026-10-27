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

// ۱۲ بعد تحلیل متنی سخنرانی (گزینه A — از بک‌اند app/schemas/ai.py)
export const DIMENSION_LABELS = {
  content: { fa: "محتوا", ar: "المحتوى", en: "Content" },
  structure: { fa: "ساختار", ar: "الهيكل", en: "Structure" },
  coherence: { fa: "انسجام منطقی", ar: "الاتساق المنطقي", en: "Coherence" },
  clarity: { fa: "وضوح", ar: "الوضوح", en: "Clarity" },
  vocabulary: { fa: "دایره لغات", ar: "المفردات", en: "Vocabulary" },
  grammar: { fa: "گرامر", ar: "القواعد", en: "Grammar" },
  persuasion: { fa: "اقناع", ar: "الإقناع", en: "Persuasion" },
  emotion: { fa: "بار احساسی", ar: "الشحنة العاطفية", en: "Emotion" },
  engagement: { fa: "تعامل با مخاطب", ar: "التفاعل مع الجمهور", en: "Engagement" },
  depth: { fa: "عمق موضوع", ar: "عمق الموضوع", en: "Depth" },
  conclusion: { fa: "نتیجه‌گیری", ar: "الاستنتاج", en: "Conclusion" },
  confidence: { fa: "اعتماد به نفس", ar: "الثقة بالنفس", en: "Confidence" },
  // برچسب‌های قدیمی/جانبی — برای سازگاری با کدهای قبلی نگه داشته شده‌اند
  pace: { fa: "سرعت گفتار", ar: "سرعة الكلام", en: "Pace" },
  tone: { fa: "لحن", ar: "النبرة", en: "Tone" },
  fluency: { fa: "روانی", ar: "الطلاقة", en: "Fluency" },
} as const;

export const DIMENSION_ICONS: Record<string, string> = {
  content: "📝",
  structure: "🏗️",
  coherence: "🔗",
  clarity: "💎",
  vocabulary: "📚",
  grammar: "✍️",
  persuasion: "🎯",
  emotion: "❤️",
  engagement: "🤝",
  depth: "🔬",
  conclusion: "🏁",
  confidence: "🦁",
  stumbles: "🌀",
  stress: "⚡",
  speech_rate: "💨",
  pause_count: "⏸️",
  breathing: "🫁",
  fluency: "🌊",
  energy_distribution: "📊",
  sentence_length: "📏",
};

// ۶ معیار صوتی مستقل از GPT (گزینه B — از librosa)
export const VOCAL_METRIC_LABELS = {
  speech_rate: { fa: "سرعت گفتار", ar: "سرعة الكلام", en: "Speech Rate" },
  pause_count: { fa: "تعداد مکث‌ها", ar: "عدد التوقفات", en: "Pauses" },
  breathing: { fa: "نرخ تنفس", ar: "معدل التنفس", en: "Breathing Rate" },
  fluency: { fa: "روانی کلام", ar: "طلاقة الكلام", en: "Fluency" },
  energy_distribution: { fa: "توزیع انرژی صدا", ar: "توزيع الطاقة الصوتية", en: "Energy Distribution" },
  sentence_length: { fa: "میانگین طول جمله", ar: "متوسط طول الجملة", en: "Avg. Sentence Length" },
} as const;

// ۲ معیار بیانی مشتق از صوت (بخش Delivery — گزینه B)
export const DERIVED_DELIVERY_LABELS = {
  stumbles: { fa: "توقف/تپق", ar: "التلعثم", en: "Stumbles" },
  stress: { fa: "استرس صدا", ar: "توتر الصوت", en: "Vocal Stress" },
} as const;

export type VocalMetricKey = keyof typeof VOCAL_METRIC_LABELS;
export type DerivedDeliveryKey = keyof typeof DERIVED_DELIVERY_LABELS;

// ترتیب و دسته‌بندی ۲۰ کارت صفحه تحلیل حرفه‌ای (گزینه C)
export const CONTENT_DIMENSION_ORDER: readonly string[] = [
  "content", "structure", "coherence", "vocabulary", "grammar", "persuasion", "depth", "conclusion",
];
export const DELIVERY_DIMENSION_ORDER: readonly string[] = [
  "confidence", "clarity", "emotion", "engagement",
];
export const VOCAL_METRIC_ORDER: readonly VocalMetricKey[] = [
  "speech_rate", "pause_count", "breathing", "fluency", "energy_distribution", "sentence_length",
];
export const DERIVED_DELIVERY_ORDER: readonly DerivedDeliveryKey[] = ["stumbles", "stress"];

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

  // بخش‌های صفحه تحلیل ۲۰ کارتی (گزینه C)
  vocalSectionTitle: { fa: "تحلیل صوتی (Vocal)", ar: "التحليل الصوتي", en: "Vocal Analysis" },
  deliverySectionTitle: { fa: "بیان و ارائه (Delivery)", ar: "الأداء والإلقاء", en: "Delivery" },
  contentSectionTitle: { fa: "محتوا و ساختار (Content)", ar: "المحتوى والهيكل", en: "Content" },
  overallSectionTitle: { fa: "جمع‌بندی کلی", ar: "الملخص العام", en: "Overall Summary" },
  noAudioMetrics: { fa: "این تحلیل متنی است؛ معیارهای صوتی موجود نیست.", ar: "هذا تحليل نصي؛ لا توجد مقاييس صوتية.", en: "This is a text analysis; no audio metrics available." },
  closeModal: { fa: "بستن", ar: "إغلاق", en: "Close" },
  whyThisScore: { fa: "چرا این امتیاز؟", ar: "لماذا هذه النتيجة؟", en: "Why this score?" },
  tapForDetails: { fa: "برای جزئیات لمس کنید", ar: "اضغط للتفاصيل", en: "Tap for details" },
  wordsPerMinute: { fa: "کلمه در دقیقه", ar: "كلمة في الدقيقة", en: "words/min" },
  perMinute: { fa: "در دقیقه", ar: "في الدقيقة", en: "/min" },
  seconds: { fa: "ثانیه", ar: "ثانية", en: "sec" },
  words: { fa: "کلمه", ar: "كلمة", en: "words" },

  // تمرین‌های اخیر
  recentPractices: { fa: "تمرین‌های اخیر", ar: "التمارين الأخيرة", en: "Recent Practices" },
  viewAll: { fa: "مشاهده همه", ar: "عرض الكل", en: "View all" },
  noRecentPractices: { fa: "هنوز تمرینی ثبت نکرده‌اید. اولین تمرین خود را شروع کنید.", ar: "لم تسجل أي تمرين بعد.", en: "No practices yet. Start your first one." },

  // سطح و بانک محتوا
  levelLabel: { fa: "سطح تمرین", ar: "مستوى التمرين", en: "Practice Level" },
  chooseFromBank: { fa: "انتخاب از بانک محتوا", ar: "اختر من بنك المحتوى", en: "Choose from content bank" },
  suggestNewTopic: { fa: "پیشنهاد جدید با هوش مصنوعی", ar: "اقتراح جديد بالذكاء الاصطناعي", en: "New AI Suggestion" },
  suggestingTopic: { fa: "در حال دریافت پیشنهاد از هوش مصنوعی...", ar: "جارٍ الحصول على اقتراح...", en: "Getting AI suggestion..." },
  suggestError: { fa: "دریافت پیشنهاد با خطا مواجه شد. از بانک محتوا استفاده کنید.", ar: "فشل الحصول على اقتراح.", en: "Couldn't get a suggestion. Try the content bank." },
  guidanceLabel: { fa: "راهنمای ساختار", ar: "دليل البنية", en: "Structure Guidance" },

  // مربی زنده
  liveCoachTitle: { fa: "مربی زنده هوش مصنوعی", ar: "المدرب المباشر بالذكاء الاصطناعي", en: "Live AI Coach" },
  liveCoachWaiting: { fa: "به محض شروع صحبت، مربی بازخورد لحظه‌ای می‌دهد...", ar: "بمجرد أن تبدأ الحديث، سيقدم المدرب ملاحظات فورية...", en: "Once you start speaking, the coach will give live feedback..." },
  youSaid: { fa: "شما گفتید", ar: "قلت", en: "You said" },
  coachSays: { fa: "مربی خطیب", ar: "مدرب خطيب", en: "Khatib Coach" },
  liveCoachOffline: { fa: "اتصال مربی زنده برقرار نشد.", ar: "تعذر الاتصال بالمدرب المباشر.", en: "Could not connect to the live coach." },

  // گفتگوی پیشنهاد-و-تأیید موضوع با هوش مصنوعی
  aiHintLabel: { fa: "موضوع دلخواه خودت رو بگو (اختیاری)", ar: "اذكر الموضوع الذي تريده (اختياري)", en: "Tell the AI what you want (optional)" },
  aiHintPlaceholder: { fa: "مثلاً: درباره مدیریت زمان یا مذاکره فروش...", ar: "مثلاً: عن إدارة الوقت...", en: "e.g. about time management or sales negotiation..." },
  draftTitle: { fa: "پیشنهاد هوش مصنوعی — هنوز اعمال نشده", ar: "اقتراح الذكاء الاصطناعي", en: "AI Draft — not applied yet" },
  approveDraft: { fa: "تایید و استفاده", ar: "موافقة واستخدام", en: "Approve & Use" },
  regenerateDraft: { fa: "نسخه دیگر", ar: "نسخة أخرى", en: "Try Another" },
  discardDraft: { fa: "رد کردن", ar: "رفض", en: "Discard" },
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