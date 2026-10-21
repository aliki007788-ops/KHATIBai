"use client";

import { useAuthStore } from "@/stores/authStore";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { User, Shield, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 pb-10">
        <header className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="p-3 bg-[var(--foreground)]/5 text-[var(--foreground)] rounded-2xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">تنظیمات حساب</h1>
            <p className="text-[var(--foreground)]/60 mt-1">مدیریت اطلاعات شخصی و امنیت حساب کاربری</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اطلاعات پروفایل */}
          <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#8b5cf6]" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">اطلاعات پروفایل</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--foreground)]/5">
                <span className="text-sm text-[var(--foreground)]/60">نام و نام خانوادگی</span>
                <span className="font-medium text-[var(--foreground)]">{user?.name || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--foreground)]/5">
                <span className="text-sm text-[var(--foreground)]/60">ایمیل</span>
                <span className="font-medium text-[var(--foreground)]" dir="ltr">{user?.email || "—"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--foreground)]/5">
                <span className="text-sm text-[var(--foreground)]/60">پلن</span>
                <span className="font-medium text-[var(--foreground)] uppercase">{user?.plan || "free"}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-[var(--foreground)]/5">
                <span className="text-sm text-[var(--foreground)]/60">نقش</span>
                <span className="font-medium text-[var(--foreground)]">{user?.role === "admin" ? "مدیر" : "کاربر"}</span>
              </div>
            </div>
          </div>

          {/* حریم خصوصی */}
          <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-[var(--foreground)]">حریم خصوصی و امنیت</h2>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-[var(--foreground)]/60 mb-3">دریافت نسخه پشتیبان از داده‌ها</p>
                <Button variant="glass" className="w-full justify-center gap-2">
                  <Download className="w-4 h-4" /> دانلود داده‌ها
                </Button>
              </div>
              <div className="border-t border-[var(--border-color)] pt-4">
                <p className="text-sm text-red-500 font-medium mb-1">حذف حساب کاربری</p>
                <p className="text-xs text-[var(--foreground)]/40 mb-3">با حذف حساب، تمام اطلاعات شما برای همیشه پاک می‌شود.</p>
                <Button variant="glass" className="w-full justify-center gap-2 text-red-500 hover:text-red-400 border-red-500/20 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" /> حذف حساب
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}