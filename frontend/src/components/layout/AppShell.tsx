"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { BottomNav } from "./BottomNav";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const lang = useLanguageStore((s) => s.language);

  const isAdminPath = pathname.startsWith("/admin");
  const role = user?.role === "admin" || isAdminPath ? "admin" : "user";
  const dir = lang === "en" ? "ltr" : "rtl";

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang === "ar" ? "ar" : lang === "en" ? "en" : "fa";
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <div className="flex min-h-screen bg-[var(--background)]" dir={dir}>
      <Sidebar role={role} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
