"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";

export type Period = "monthly" | "yearly";

export interface PlanLimits {
  max_speech_per_month: number | null;
  max_audio_seconds_per_month: number | null;
}

export interface Plan {
  code: string;
  name_fa: string;
  description_fa: string;
  is_popular: boolean;
  price_monthly_toman: number | null;
  price_yearly_toman: number | null;
  yearly_discount_percent: number;
  features: string[];
  sections: string[];
  limits: PlanLimits;
}

export interface AdminPlan extends Plan {
  id: string;
  is_active: boolean;
  sort_order: number;
  user_count: number;
  subscription_count: number;
  updated_at: string;
}

export interface PlanUpsert {
  code?: string;
  name_fa: string;
  description_fa: string;
  sort_order: number;
  is_active: boolean;
  is_popular: boolean;
  price_monthly_toman: number | null;
  price_yearly_toman: number | null;
  features: string[];
  sections: string[];
  max_speech_per_month: number | null;
  max_audio_seconds_per_month: number | null;
}

export interface PaymentOption {
  id: "demo" | "zarinpal";
  label: string;
  test_mode: boolean;
}

export interface SectionInfo {
  key: string;
  label: string;
}

export interface MyEntitlements {
  plan: string;
  plan_name_fa: string;
  expires_at: string | null;
  sections: string[];
  limits: PlanLimits;
  is_admin: boolean;
}

export const planPrice = (plan: Plan, period: Period) =>
  period === "yearly" ? plan.price_yearly_toman : plan.price_monthly_toman;

/** آدرس کامل برای مسیرهای نسبیِ بک‌اند (مثل /api/billing/demo-pay) */
export const absoluteApiUrl = (url: string) =>
  url.startsWith("/") ? `${apiClient.defaults.baseURL ?? ""}${url}` : url;

export const plansService = {
  list: async () => (await apiClient.get<Plan[]>("/api/plans")).data,
  paymentOptions: async () =>
    (await apiClient.get<{ providers: PaymentOption[]; default: string | null }>("/api/plans/payment-options")).data,
  me: async () => (await apiClient.get<MyEntitlements>("/api/plans/me")).data,
  checkout: async (body: { plan: string; period: Period; provider?: string | null }) =>
    (await apiClient.post<{ payment_url: string; authority: string; transaction_id: string }>(
      "/api/billing/checkout",
      body
    )).data,
  admin: {
    list: async () => (await apiClient.get<AdminPlan[]>("/api/admin/plans")).data,
    sections: async () => (await apiClient.get<SectionInfo[]>("/api/admin/plans/sections")).data,
    create: async (body: PlanUpsert) => (await apiClient.post<AdminPlan>("/api/admin/plans", body)).data,
    update: async (code: string, body: PlanUpsert) =>
      (await apiClient.put<AdminPlan>(`/api/admin/plans/${code}`, body)).data,
    remove: async (code: string) => {
      await apiClient.delete(`/api/admin/plans/${code}`);
    },
  },
};

export function usePlans() {
  return useQuery({ queryKey: ["plans"], queryFn: plansService.list, staleTime: 60_000 });
}

export function usePaymentOptions() {
  return useQuery({ queryKey: ["plans", "payment-options"], queryFn: plansService.paymentOptions });
}

export function useMyEntitlements() {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["plans", "me"],
    queryFn: plansService.me,
    enabled: !!token,
    staleTime: 60_000,
  });
}

export function useAdminPlans() {
  return useQuery({ queryKey: ["admin", "plans"], queryFn: plansService.admin.list });
}

export function useAdminSections() {
  return useQuery({ queryKey: ["admin", "plans", "sections"], queryFn: plansService.admin.sections, staleTime: Infinity });
}

export function useSavePlan() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: ({ code, body }: { code: string | null; body: PlanUpsert }) =>
      code ? plansService.admin.update(code, body) : plansService.admin.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
      addToast("success", "پلن ذخیره شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);
  return useMutation({
    mutationFn: (code: string) => plansService.admin.remove(code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "plans"] });
      qc.invalidateQueries({ queryKey: ["plans"] });
      addToast("success", "پلن حذف شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
