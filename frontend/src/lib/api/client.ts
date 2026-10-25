import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import { mapAxiosError } from "./errors";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// ✅ اینترسپتور برای اضافه کردن توکن به همه درخواست‌ها
apiClient.interceptors.request.use(
  (config) => {
    // خواندن توکن از استور
    const token = useAuthStore.getState().accessToken;
    
    // اگر توکن وجود داشت، به هدر اضافه کن
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ مدیریت خطاها
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(mapAxiosError(error));
  }
);

export { apiClient };