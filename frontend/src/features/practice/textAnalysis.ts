// ============================================
// تشخیص کلمات حشو (filler) و تکرار کلمه در متن پیاده‌شده سخنرانی
// کاملاً سمت کلاینت و بدون نیاز به فراخوانی سرور — روی رونوشت موجود اجرا می‌شود.
// یک ابزار heuristic/beta است، نه تحلیل زبان‌شناسی دقیق.
// ============================================

// کلمات حشوِ رایج فارسی که عمدتاً معنای واژگانی ندارند و پرکننده مکث‌اند.
// عمداً کوتاه و محافظه‌کارانه نگه داشته شده تا false-positive کم باشد.
const FILLER_WORDS_FA = new Set([
  "اممم", "امم", "ام", "اوم", "اوهوم", "هوم", "اه", "آه", "اوه", "چیزه", "آآآ", "اا", "ااا",
]);

export type TextSegmentType = "normal" | "filler" | "repeat";

export interface TextSegment {
  text: string;
  type: TextSegmentType;
}

export interface TranscriptAnalysis {
  segments: TextSegment[];
  fillerTotal: number;
  fillerCounts: { word: string; count: number }[];
  repeatedWordTotal: number;
  repeatedWordCounts: { word: string; count: number }[];
}

function normalizeWord(w: string): string {
  // عربی/فارسی نرمال‌سازی ساده: ي -> ی، ك -> ک، حذف اعراب رایج
  return w
    .replace(/[ً-ْ]/g, "")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .trim();
}

/**
 * متن را به قطعات کلمه/غیرکلمه می‌شکند، کلمات حشو و تکرارهای متوالی را
 * علامت‌گذاری می‌کند، و شمارش کلی برمی‌گرداند.
 */
export function analyzeTranscript(text: string): TranscriptAnalysis {
  if (!text || !text.trim()) {
    return { segments: [], fillerTotal: 0, fillerCounts: [], repeatedWordTotal: 0, repeatedWordCounts: [] };
  }

  // تقسیم متن به توکن‌های کلمه (حروف/اعداد) و غیرکلمه (فاصله/نقطه‌گذاری).
  // نیم‌فاصله (U+200C) جزو کلمه است؛ وگرنه «رفته‌ام» به «رفته» + «ام» شکسته و «ام» اشتباهاً حشو حساب می‌شود.
  const tokens = text.match(/[\p{L}\p{N}\u200c]+|[^\p{L}\p{N}\u200c]+/gu) ?? [text];

  const segments: TextSegment[] = [];
  const fillerCountMap = new Map<string, number>();
  const repeatCountMap = new Map<string, number>();

  // ایندکس آخرین توکنِ-کلمه برای تشخیص تکرار متوالی (با نادیده گرفتن فاصله‌ها)
  let lastWordNormalized: string | null = null;
  let lastWordIndexInSegments = -1;

  for (const token of tokens) {
    const isWordLike = /[\p{L}\p{N}]/u.test(token);

    if (!isWordLike) {
      segments.push({ text: token, type: "normal" });
      continue;
    }

    const normalized = normalizeWord(token);
    const isFiller = FILLER_WORDS_FA.has(normalized);

    if (isFiller) {
      fillerCountMap.set(normalized, (fillerCountMap.get(normalized) ?? 0) + 1);
      segments.push({ text: token, type: "filler" });
      lastWordNormalized = null; // حشو، تکرار را قطع می‌کند
      continue;
    }

    if (normalized.length >= 2 && normalized === lastWordNormalized) {
      // این کلمه بلافاصله همان کلمه قبلی است -> هر دو را repeat علامت بزن
      if (lastWordIndexInSegments >= 0 && segments[lastWordIndexInSegments].type === "normal") {
        segments[lastWordIndexInSegments] = { ...segments[lastWordIndexInSegments], type: "repeat" };
      }
      segments.push({ text: token, type: "repeat" });
      repeatCountMap.set(normalized, (repeatCountMap.get(normalized) ?? 0) + 1);
      lastWordIndexInSegments = segments.length - 1;
      continue;
    }

    segments.push({ text: token, type: "normal" });
    lastWordNormalized = normalized;
    lastWordIndexInSegments = segments.length - 1;
  }

  const fillerCounts = Array.from(fillerCountMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const repeatedWordCounts = Array.from(repeatCountMap.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return {
    segments,
    fillerTotal: fillerCounts.reduce((sum, f) => sum + f.count, 0),
    fillerCounts,
    repeatedWordTotal: repeatedWordCounts.reduce((sum, r) => sum + r.count, 0),
    repeatedWordCounts,
  };
}
