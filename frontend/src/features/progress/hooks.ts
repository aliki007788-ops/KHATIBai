"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProgressSummary, DimensionTrend } from "@/types/progress";

export function useProgressSummary() {
  return useQuery<ProgressSummary>({
    queryKey: ["progress", "summary"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.progress.summary);
      return res.data;
    },
    staleTime: 30_000,
  });
}

export function useProgressTrends() {
  return useQuery<DimensionTrend[]>({
    queryKey: ["progress", "trends"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.progress.trends);
      return res.data;
    },
    staleTime: 30_000,
  });
}