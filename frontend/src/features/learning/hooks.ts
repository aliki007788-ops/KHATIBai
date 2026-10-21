"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { learningService } from "./learning.service";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";
import { useRouter } from "next/navigation";

export function useLevels() {
  return useQuery({
    queryKey: ["learning", "levels"],
    queryFn: learningService.levels,
  });
}

export function useScenarios(levelId: string | null) {
  return useQuery({
    queryKey: ["learning", "scenarios", levelId],
    queryFn: () => learningService.scenarios(levelId!),
    enabled: !!levelId,
  });
}

export function useStartScenario() {
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string) => learningService.start(scenarioId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["learning"] });
      addToast("success", "سناریو شروع شد");
      router.push(`/coach/${data.conversation_id}`);
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useCompleteScenario() {
  const addToast = useUIStore((s) => s.addToast);
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (scenarioId: string) => learningService.complete(scenarioId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      addToast("success", "سناریو تکمیل شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
