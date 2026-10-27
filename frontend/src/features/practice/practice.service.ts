import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { PracticeLevel } from "./content";

export interface PracticeSuggestion {
  title: string;
  prompt_text: string;
  guidance: string;
}

export const practiceService = {
  suggest: async (mode: string, level: PracticeLevel) => {
    const res = await apiClient.post<PracticeSuggestion>(endpoints.practice.suggest, {
      mode,
      level,
    });
    return res.data;
  },
};
