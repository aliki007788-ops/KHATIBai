"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import type { AuthStatus, User } from "@/types/auth";
import type { TokenResponse } from "@/types/auth";
import { endpoints } from "@/lib/api/endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;

  setSession: (user: User, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  setUser: (user: User) => void;
  refreshSession: () => Promise<string>;
  handleSessionExpired: () => void;
  logoutLocal: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      status: "unauthenticated",

      setSession: (user, accessToken) => {
        set({ user, accessToken, status: "authenticated" });
      },

      setAccessToken: (token) => {
        set({ accessToken: token, status: "authenticated" });
      },

      setUser: (user) => {
        set({ user });
      },

      /**
       * Refresh uses httpOnly cookie — must call withCredentials.
       * Raw axios (not apiClient) to avoid interceptor loops.
       */
      refreshSession: async () => {
        set({ status: "refreshing" });
        try {
          const res = await axios.post<TokenResponse>(
            `${BASE_URL}${endpoints.auth.refresh}`,
            {},
            { withCredentials: true }
          );
          const token = res.data.access_token;
          set({ accessToken: token, status: "authenticated" });
          return token;
        } catch {
          set({
            user: null,
            accessToken: null,
            status: "session_expired",
          });
          throw new Error("SESSION_EXPIRED");
        }
      },

      handleSessionExpired: () => {
        set({
          user: null,
          accessToken: null,
          status: "session_expired",
        });
        if (typeof window !== "undefined") {
          const path = window.location.pathname;
          if (!path.startsWith("/login") && !path.startsWith("/register")) {
            window.location.href = `/login?reason=session_expired&redirect=${encodeURIComponent(path)}`;
          }
        }
      },

      logoutLocal: () => {
        set({
          user: null,
          accessToken: null,
          status: "unauthenticated",
        });
      },
    }),
    {
      name: "khatib-auth",
      // Only persist access token + user; refresh is in httpOnly cookie
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
      }),
    }
  )
);
