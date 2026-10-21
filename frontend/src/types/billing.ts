/** Aligned with backend: app/schemas/billing.py & core/plans.py */

import type { PlanId } from "./auth";

export type PaymentStatus =
  | "created"
  | "redirected"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type SubscriptionStatus = "active" | "expired" | "cancelled" | "none";

export interface CheckoutRequest {
  plan: PlanId;
}

export interface CheckoutResponse {
  payment_url: string;
  authority: string;
  transaction_id: string;
}

export interface SubscriptionResponse {
  plan: PlanId;
  status: SubscriptionStatus | string;
  starts_at?: string;
  expires_at?: string;
  auto_renew?: boolean;
  message?: string;
}

export interface TransactionResponse {
  id: string;
  plan: PlanId;
  amount_toman: number;
  status: PaymentStatus;
  provider: string;
  ref_id: string | null;
  created_at: string;
}

export interface PlanFeature {
  label: string;
  included: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  price_toman: number;
  practiceLimit: string;
  audioLimit: string;
  features: PlanFeature[];
  highlighted?: boolean;
  isEnterprise?: boolean;
}
