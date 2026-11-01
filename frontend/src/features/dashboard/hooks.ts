"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "./dashboard.service";
import { useAuthStore } from "@/stores/authStore";

export function useProgressSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: dashboardService.getSummary,
  });
}

export function useDailyRecommendation() {
  return useQuery({
    queryKey: ["dashboard", "daily"],
    queryFn: dashboardService.getDailyRecommendation,
  });
}

export function useSubscriptionInfo() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["dashboard", "subscription"],
    queryFn: dashboardService.getSubscription,
    enabled: !!accessToken,
  });
}
