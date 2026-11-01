/** Aligned with backend: app/schemas/auth.py & models */

export type AuthStatus =
  | "unauthenticated"
  | "authenticating"
  | "authenticated"
  | "refreshing"
  | "logging_out"
  | "session_expired"
  | "error";

export type PlanId = "free" | "base" | "pro" | "enterprise";
export type RoleId = "user" | "admin";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: RoleId;
  plan: PlanId;
  email_verified: boolean;
}

/** Login response from POST /api/auth/login */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}
