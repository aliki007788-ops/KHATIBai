/**
 * Axios client aligned with Khatib backend auth model:
 * - access_token in Authorization header (stored in memory / Zustand)
 * - refresh token is httpOnly cookie `khatib_refresh` → must send credentials
 * - responses are plain models (no success/data wrapper)
 * - errors use FastAPI { detail: ... }
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { mapAxiosError, ApiError } from "./errors";
import { useAuthStore } from "@/stores/authStore";
import { endpoints } from "./endpoints";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshQueue.push(cb);
}

function onRefreshed(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  withCredentials: true, // critical for refresh cookie
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response) {
      return Promise.reject(mapAxiosError(error));
    }

    const status = error.response.status;
    const url = originalRequest?.url ?? "";

    // 401 → try refresh (except on refresh/login/register themselves)
    const isAuthEndpoint =
      url.includes(endpoints.auth.refresh) ||
      url.includes(endpoints.auth.login) ||
      url.includes(endpoints.auth.register);

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (!token) {
              reject(mapAxiosError(error));
              return;
            }
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await useAuthStore.getState().refreshSession();
        isRefreshing = false;
        onRefreshed(newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        onRefreshed(null);
        useAuthStore.getState().handleSessionExpired();
        return Promise.reject(
          new ApiError(401, "SESSION_EXPIRED", "نشست شما منقضی شده است.")
        );
      }
    }

    return Promise.reject(mapAxiosError(error));
  }
);
