"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface SpeechItem {
  id: string;
  title?: string | null;
  created_at: string;
  overall_score?: number | null;
}

export interface BillingItem {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export function useSpeechHistory() {
  return useQuery<SpeechItem[]>({
    queryKey: ["speech", "list"],
    queryFn: async () => (await apiClient.get(endpoints.speech.list)).data,
    staleTime: 30_000,
  });
}

export function useBillingHistory() {
  return useQuery<BillingItem[]>({
    queryKey: ["billing", "history"],
    queryFn: async () => (await apiClient.get(endpoints.billing.history)).data,
    staleTime: 60_000,
  });
}