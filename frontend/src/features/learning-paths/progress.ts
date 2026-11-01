// ============================================
// ردیابی پیشرفت مسیرهای آموزشی — سمت سرور (با fallback موقت به localStorage)
// ============================================

import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

const STORAGE_KEY = "khatib_course_progress_v1";

type ProgressMap = Record<string, string[]>;

function readLocal(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

function writeLocal(data: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/** همگام‌سازی اولیه از سرور — در صورت موفقیت، local را هم به‌روز می‌کند. */
export async function fetchPathProgress(pathId: string): Promise<string[]> {
  try {
    const res = await apiClient.get<{ completed_week_ids: string[] }>(
      endpoints.courseProgress.path(pathId)
    );
    const ids = res.data.completed_week_ids ?? [];
    const all = readLocal();
    all[pathId] = ids;
    writeLocal(all);
    return ids;
  } catch {
    return readLocal()[pathId] ?? [];
  }
}

export async function fetchAllProgress(): Promise<ProgressMap> {
  try {
    const res = await apiClient.get<Array<{ path_id: string; week_id: string }>>(
      endpoints.courseProgress.me
    );
    const map: ProgressMap = {};
    for (const row of res.data) {
      if (!map[row.path_id]) map[row.path_id] = [];
      if (!map[row.path_id].includes(row.week_id)) {
        map[row.path_id].push(row.week_id);
      }
    }
    writeLocal(map);
    return map;
  } catch {
    return readLocal();
  }
}

export function getCompletedWeeks(pathId: string): string[] {
  return readLocal()[pathId] ?? [];
}

export function isWeekComplete(pathId: string, weekId: string): boolean {
  return getCompletedWeeks(pathId).includes(weekId);
}

export async function markWeekComplete(
  pathId: string,
  weekId: string,
  quizScore?: number,
  quizTotal?: number
) {
  // optimistic local
  const all = readLocal();
  const current = all[pathId] ?? [];
  if (!current.includes(weekId)) {
    all[pathId] = [...current, weekId];
    writeLocal(all);
  }

  try {
    await apiClient.post(endpoints.courseProgress.mark, {
      path_id: pathId,
      week_id: weekId,
      quiz_score: quizScore ?? null,
      quiz_total: quizTotal ?? null,
    });
  } catch {
    // local already updated — server sync will retry on next load
  }
}

export async function unmarkWeekComplete(pathId: string, weekId: string) {
  const all = readLocal();
  all[pathId] = (all[pathId] ?? []).filter((id) => id !== weekId);
  writeLocal(all);

  try {
    await apiClient.delete(endpoints.courseProgress.unmark(pathId, weekId));
  } catch {
    // ignore
  }
}
