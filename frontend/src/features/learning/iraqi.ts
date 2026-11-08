"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useUIStore } from "@/stores/uiStore";

export interface VocabItem {
  iq: string;
  fa: string;
  example_iq?: string;
  example_fa?: string;
}

export interface DialogueTurn {
  who: string;
  iq: string;
  fa: string;
}

export interface ScenarioSummary {
  id: string;
  slug: string | null;
  category: string;
  order_index: number;
  title_fa: string;
  title_iq: string | null;
  description_fa: string;
  key_vocabulary: VocabItem[];
  difficulty: number | null;
  estimated_minutes: number | null;
  objectives: string[];
  status: "not_started" | "in_progress" | "completed";
  unlocked: boolean;
}

export interface ScenarioDetail {
  id: string;
  slug: string | null;
  level_id: string;
  level_code: string;
  level_name_fa: string;
  category: string;
  order_index: number;
  title_fa: string;
  title_iq: string | null;
  situation: string;
  objectives: string[];
  key_vocabulary: VocabItem[];
  model_dialogue: DialogueTurn[];
  practice_prompt: string;
  success_criteria: string[];
  common_mistakes: string[];
  cultural_note: string | null;
  difficulty: number | null;
  estimated_minutes: number | null;
  status: "not_started" | "in_progress" | "completed";
  unlocked: boolean;
  min_messages_to_complete: number;
  user_messages_count: number;
  conversation_id: string | null;
}

export const CATEGORY_FA: Record<string, string> = {
  daily_conversation: "گفتگوی روزمره",
  restaurant: "رستوران",
  market: "بازار و خرید",
  hotel: "هتل",
  work: "کار",
  travel: "سفر",
  social: "اجتماعی",
};

export const STATUS_FA: Record<string, string> = {
  not_started: "شروع نشده",
  in_progress: "در حال تمرین",
  completed: "تکمیل شده",
};

export const DIFFICULTY_FA = ["", "خیلی آسان", "آسان", "متوسط", "سخت", "خیلی سخت"];

export function useScenarioSummaries(levelId: string | null) {
  return useQuery({
    queryKey: ["learning", "scenarios", levelId],
    queryFn: async () =>
      (await apiClient.get<ScenarioSummary[]>(`/api/learning/levels/${levelId}/scenarios`)).data,
    enabled: !!levelId,
  });
}

export function useScenarioDetail(scenarioId: string | null) {
  return useQuery({
    queryKey: ["learning", "scenario", scenarioId],
    queryFn: async () =>
      (await apiClient.get<ScenarioDetail>(`/api/learning/scenarios/${scenarioId}`)).data,
    enabled: !!scenarioId,
  });
}

export function useConversationScenario(conversationId: string | null) {
  return useQuery({
    queryKey: ["learning", "conversation-scenario", conversationId],
    queryFn: async () =>
      (await apiClient.get<ScenarioDetail>(`/api/learning/conversations/${conversationId}/scenario`)).data,
    enabled: !!conversationId,
    retry: false, // گفتگوی آزاد به سناریو وصل نیست
  });
}

export function useFinishScenario() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async (scenarioId: string) => {
      await apiClient.post(`/api/learning/scenarios/${scenarioId}/complete`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      addToast("success", "آفرین! سناریو تکمیل شد 🎉");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
