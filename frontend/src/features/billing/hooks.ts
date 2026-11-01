"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { billingService } from "./billing.service";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";
import type { PlanId } from "@/types/auth";

export function useSubscription() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["billing", "subscription"],
    queryFn: billingService.getSubscription,
    enabled: !!accessToken,
  });
}

export function useBillingHistory() {
  return useQuery({
    queryKey: ["billing", "history"],
    queryFn: billingService.getHistory,
  });
}

export function useCheckout() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (plan: PlanId) => billingService.checkout({ plan }),
    onSuccess: (data) => {
      // Redirect to ZarinPal (or demo-pay URL from backend)
      window.location.href = data.payment_url;
    },
    onError: (error) => {
      addToast("error", getErrorMessage(error));
    },
  });
}
