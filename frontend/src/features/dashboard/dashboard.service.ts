import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { ProgressSummary } from "@/types/progress";
import type { DailyRecommendation } from "@/types/learning";
import type { SubscriptionResponse } from "@/types/billing";

export const dashboardService = {
  getSummary: async () => {
    const res = await apiClient.get<ProgressSummary>(endpoints.progress.summary);
    return res.data;
  },
  getDailyRecommendation: async () => {
    const res = await apiClient.get<DailyRecommendation>(endpoints.learning.daily);
    return res.data;
  },
  getSubscription: async () => {
    const res = await apiClient.get<SubscriptionResponse>(endpoints.billing.subscription);
    return res.data;
  },
};
