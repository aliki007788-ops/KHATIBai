"use client";

import { useMutation } from "@tanstack/react-query";
import { privacyService } from "./privacy.service";
import { useUIStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/api/errors";
import { useRouter } from "next/navigation";

export function useExportData() {
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: () => privacyService.exportData(),
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `khatib-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast("success", "خروجی داده‌ها دانلود شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useDeleteAccount() {
  const addToast = useUIStore((s) => s.addToast);
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const router = useRouter();

  return useMutation({
    mutationFn: () => privacyService.deleteAccount(),
    onSuccess: () => {
      logoutLocal();
      addToast("info", "حساب کاربری حذف شد");
      router.push("/");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
