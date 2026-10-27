"use client";

import { useMutation } from "@tanstack/react-query";
import { practiceService } from "./practice.service";
import type { PracticeLevel } from "./content";

export function useSuggestPractice() {
  return useMutation({
    mutationFn: ({
      mode,
      level,
      hint,
      previousTitle,
    }: {
      mode: string;
      level: PracticeLevel;
      hint?: string;
      previousTitle?: string;
    }) => practiceService.suggest(mode, level, hint, previousTitle),
  });
}
