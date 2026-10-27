import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PracticeLevel } from "./content";

export interface PracticeSuggestion {
  title: string;
  prompt_text: string;
  guidance: string;
}

export const practiceService = {
  suggest: async (
    mode: string,
    level: PracticeLevel,
    hint?: string,
    previousTitle?: string
  ) => {
    const res = await apiClient.post<PracticeSuggestion>(endpoints.practice.suggest, {
      mode,
      level,
      hint: hint || undefined,
      previous_title: previousTitle || undefined,
    });
    return res.data;
  },
};
