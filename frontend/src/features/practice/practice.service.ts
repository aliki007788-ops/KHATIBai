import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PracticeLevel } from "./content";

export interface PracticeSuggestion {
  title: string;
  prompt_text: string;
  guidance: string;
}

export interface SuggestParams {
  mode: string;
  level: PracticeLevel;
  /** موضوع دلخواه کاربر (اختیاری) */
  hint?: string;
  /** عنوان پیشنهاد قبلی، برای اینکه «نسخه دیگر» تکراری نباشد */
  previousTitle?: string;
}

export interface CoachTicket {
  ticket: string;
  expires_in: number;
}

export const practiceService = {
  suggest: async ({ mode, level, hint, previousTitle }: SuggestParams) => {
    const res = await apiClient.post<PracticeSuggestion>(endpoints.practice.suggest, {
      mode,
      level,
      hint: hint?.trim() || undefined,
      previous_title: previousTitle || undefined,
    });
    return res.data;
  },

  // بلیت کوتاه‌مدت و یک‌بارمصرف برای اتصال WebSocket مربی زنده
  coachTicket: async () => {
    const res = await apiClient.post<CoachTicket>(endpoints.practice.coachTicket);
    return res.data;
  },
};
