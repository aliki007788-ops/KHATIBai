import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  CheckoutRequest,
  CheckoutResponse,
  SubscriptionResponse,
  TransactionResponse,
} from "@/types/billing";

export const billingService = {
  checkout: async (payload: CheckoutRequest) => {
    const res = await apiClient.post<CheckoutResponse>(endpoints.billing.checkout, payload);
    return res.data;
  },
  getSubscription: async () => {
    const res = await apiClient.get<SubscriptionResponse>(endpoints.billing.subscription);
    return res.data;
  },
  getHistory: async () => {
    const res = await apiClient.get<TransactionResponse[]>(endpoints.billing.history);
    return res.data;
  },
};
