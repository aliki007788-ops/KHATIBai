import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "@/types/auth";

/**
 * Backend contracts:
 * - POST /register → UserResponse (201) — does NOT issue tokens
 * - POST /login → TokenResponse + Set-Cookie refresh
 * - GET /me → UserResponse
 * - POST /logout → 204 + clear cookie
 * - POST /refresh → TokenResponse (cookie-based)
 */
export const authService = {
  login: async (payload: LoginPayload) => {
    const res = await apiClient.post<TokenResponse>(endpoints.auth.login, payload);
    return res.data;
  },

  register: async (payload: RegisterPayload) => {
    const res = await apiClient.post<User>(endpoints.auth.register, payload);
    return res.data;
  },

  me: async () => {
    const res = await apiClient.get<User>(endpoints.auth.me);
    return res.data;
  },

  logout: async () => {
    await apiClient.post(endpoints.auth.logout);
  },
};
