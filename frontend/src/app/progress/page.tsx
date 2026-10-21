"use client";

import { AppShell } from "@/components/layout/AppShell";
import { TrendingUp, Award, Flame } from "lucide-react";

export default function ProgressPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        <header className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">پیشرفت من</h1>
            <p className="text-[var(--foreground)]/60 mt-1">آمار و تحلیل دقیق عملکرد شما در خطیب</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--foreground)]/60">کل تمرین‌ها</span>
              <Award className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div className="text-3xl font-black text-[var(--foreground)]">۰</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--foreground)]/60">میانگین هفته</span>
              <TrendingUp className="w-5 h-5 text-[#10b981]" />
            </div>
            <div className="text-3xl font-black text-[var(--foreground)]">—</div>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--foreground)]/60">روزهای پیایی</span>
              <Flame className="w-5 h-5 text-[#f59e0b]" />
            </div>
            <div className="text-3xl font-black text-[var(--foreground)]">۰</div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">تحلیل ابعاد سخنرانی</h2>
          <p className="text-[var(--foreground)]/60 text-center py-10">هنوز داده کافی برای تحلیل وجود ندارد. تمرین‌های بیشتری انجام دهید.</p>
        </div>
      </div>
    </AppShell>
  );
}