"use client";

import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils/cn";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          role="status"
          className={cn(
            "min-w-[240px] cursor-pointer rounded-lg px-4 py-3 text-sm text-white shadow-lg",
            {
              success: "bg-green-600",
              error: "bg-red-600",
              info: "bg-blue-600",
              warning: "bg-yellow-600",
            }[toast.type]
          )}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
