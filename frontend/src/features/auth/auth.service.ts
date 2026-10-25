import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { User, TokenResponse } from "@/types/auth";

export const authService = {
  login: async (payload: { email: string; password: string }): Promise<TokenResponse> => {
    const res = await apiClient.post<TokenResponse>(endpoints.auth.login, payload);
    return res.data;
  },

  register: async (payload: { email: string; password: string; name?: string }): Promise<User> => {
    const res = await apiClient.post<User>(endpoints.auth.register, payload);
    return res.data;
  },

  me: async (): Promise<User> => {
    const res = await apiClient.get<User>(endpoints.auth.me);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(endpoints.auth.logout);
  },
};