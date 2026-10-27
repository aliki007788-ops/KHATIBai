"use client";

import { useMutation } from "@tanstack/react-query";
import { practiceService } from "./practice.service";
import type { PracticeLevel } from "./content";

export function useSuggestPractice() {
  return useMutation({
    mutationFn: ({ mode, level }: { mode: string; level: PracticeLevel }) =>
      practiceService.suggest(mode, level),
  });
}
