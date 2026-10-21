"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Clock, CreditCard, Mic } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"speeches" | "payments">("speeches");

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8 pb-10">
        {/* هدر صفحه */}
        <header className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
          <div className="p-3 bg-[#3b82f6]/10 text-[#3b82f6] rounded-2xl">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">تاریخچه فعالیت‌ها</h1>
            <p className="text-[var(--foreground)]/60 mt-1">سابقه تمام تمرین‌ها و پرداخت‌های شما در یک نگاه</p>
          </div>
        </header>

        {/* تب‌ها */}
        <div className="flex border-b border-[var(--border-color)]">
          <button
            onClick={() => setActiveTab("speeches")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === "speeches"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            )}
          >
            <Mic className="w-4 h-4" /> تمرین‌های سخنرانی
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
              activeTab === "payments"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            )}
          >
            <CreditCard className="w-4 h-4" /> سوابق پرداخت
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-8">
          {activeTab === "speeches" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4">
                <Mic className="w-8 h-8 text-[var(--foreground)]/40" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">هنوز تمرینی ثبت نکرده‌اید</h3>
              <p className="text-sm text-[var(--foreground)]/60">برای شروع به استودیوی سخنرانی بروید.</p>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4">
                <CreditCard className="w-8 h-8 text-[var(--foreground)]/40" />
              </div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">تراکنشی یافت نشد</h3>
              <p className="text-sm text-[var(--foreground)]/60">هنوز هیچ پرداختی انجام نداده‌اید.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}