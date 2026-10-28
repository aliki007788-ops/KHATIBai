// ============================================
// ردیابی پیشرفتِ مسیرهای آموزشی — فقط روی همین دستگاه/مرورگر (localStorage).
// محدودیت دانسته‌شده: چون «تمرین هفته» یک رکورد مستقل در بک‌اند با ارجاع به
// مسیر/هفته ندارد، تکمیل هر هفته با کلیک دستیِ کاربر روی «علامت‌گذاری به‌عنوان
// انجام‌شده» ثبت می‌شود، نه با تشخیص خودکار اینکه آیا واقعاً تمرین کرده یا نه.
// ============================================

const STORAGE_KEY = "khatib_course_progress_v1";

type ProgressMap = Record<string, string[]>; // pathId -> completed weekIds

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function writeAll(data: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ذخیره‌سازی محلی ممکن است در حالت خصوصی/محدود در دسترس نباشد؛ بی‌صدا نادیده می‌گیریم.
  }
}

export function getCompletedWeeks(pathId: string): string[] {
  return readAll()[pathId] ?? [];
}

export function isWeekComplete(pathId: string, weekId: string): boolean {
  return getCompletedWeeks(pathId).includes(weekId);
}

export function markWeekComplete(pathId: string, weekId: string) {
  const all = readAll();
  const current = all[pathId] ?? [];
  if (!current.includes(weekId)) {
    all[pathId] = [...current, weekId];
    writeAll(all);
  }
}

export function unmarkWeekComplete(pathId: string, weekId: string) {
  const all = readAll();
  const current = all[pathId] ?? [];
  all[pathId] = current.filter((id) => id !== weekId);
  writeAll(all);
}
