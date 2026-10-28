"use client";

import { useMutation } from "@tanstack/react-query";
import { practiceService, type SuggestParams } from "./practice.service";

export function useSuggestPractice() {
  return useMutation({
    mutationFn: (params: SuggestParams) => practiceService.suggest(params),
  });
}
