"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { useUIStore } from "@/stores/uiStore";
import type { DialogueTurn, VocabItem } from "./iraqi";

export interface AdminLevel {
  id: string;
  code: string;
  name_fa: string;
  description_fa: string | null;
  order_index: number;
  active_count: number;
  inactive_count: number;
}

export interface AdminScenarioRow {
  id: string;
  slug: string | null;
  level_code: string;
  level_name_fa: string;
  order_index: number;
  title_fa: string;
  title_iq: string | null;
  category: string;
  difficulty: number | null;
  estimated_minutes: number | null;
  active: boolean;
  vocab_count: number;
  needs_review_count: number;
  edited_by_admin: boolean;
}

export interface AdminScenarioFull extends AdminScenarioRow {
  situation: string | null;
  objectives: string[];
  key_vocabulary: VocabItem[];
  model_dialogue: DialogueTurn[];
  practice_prompt: string;
  success_criteria: string[];
  common_mistakes: string[];
  cultural_note: string | null;
  needs_review: string[];
}

export interface AdminVocabRow {
  iq: string;
  fa: string;
  example_iq: string;
  scenario_id: string;
  scenario_title: string;
  slug: string | null;
  level_code: string;
}

const base = "/api/learning/admin";

export function useAdminLevels() {
  return useQuery({
    queryKey: ["admin", "iraqi", "levels"],
    queryFn: async () => (await apiClient.get<AdminLevel[]>(`${base}/levels`)).data,
  });
}

export function useAdminScenarios(levelCode: string, q: string, includeInactive: boolean) {
  return useQuery({
    queryKey: ["admin", "iraqi", "scenarios", levelCode, q, includeInactive],
    queryFn: async () =>
      (
        await apiClient.get<AdminScenarioRow[]>(`${base}/scenarios`, {
          params: { level_code: levelCode || undefined, q: q || undefined, include_inactive: includeInactive },
        })
      ).data,
  });
}

export function useAdminScenario(id: string | null) {
  return useQuery({
    queryKey: ["admin", "iraqi", "scenario", id],
    queryFn: async () => (await apiClient.get<AdminScenarioFull>(`${base}/scenarios/${id}`)).data,
    enabled: !!id,
  });
}

export function useAdminVocab(q: string, levelCode: string, offset: number) {
  return useQuery({
    queryKey: ["admin", "iraqi", "vocab", q, levelCode, offset],
    queryFn: async () =>
      (
        await apiClient.get<{ total: number; items: AdminVocabRow[] }>(`${base}/vocabulary`, {
          params: { q: q || undefined, level_code: levelCode || undefined, limit: 100, offset },
        })
      ).data,
  });
}

export function useUpdateScenario() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminScenarioFull> }) =>
      (await apiClient.patch<AdminScenarioFull>(`${base}/scenarios/${id}`, data)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "iraqi"] });
      qc.invalidateQueries({ queryKey: ["learning"] });
      addToast("success", "تغییرات ذخیره شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
