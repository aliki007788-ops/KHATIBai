import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { DimensionTrend, ProgressSummary } from "@/types/progress";

export const progressService = {
  summary: async () => {
    const res = await apiClient.get<ProgressSummary>(endpoints.progress.summary);
    return res.data;
  },
  trends: async () => {
    const res = await apiClient.get<DimensionTrend[]>(endpoints.progress.trends);
    return res.data;
  },
};
