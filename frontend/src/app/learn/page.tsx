"use client";

import { AppShell } from "@/components/layout/AppShell";
import { BookOpen, Lock, ChevronLeft } from "lucide-react";

export default function LearnPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8 pb-10">
        {/* هدر بنفش */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] p-8 text-white">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-8 h-8" /> مسیر یادگیری عراقی
              </h1>
              <p className="text-white/80">از احوال‌پرسی ساده تا مکالمات پیچیده تجاری، گام به گام لهجه اصیل عراقی را یاد بگیرید.</p>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 text-center min-w-[120px]">
              <div className="text-sm text-white/80 mb-1">پیشرفت کل</div>
              <div className="text-3xl font-black">۳/۸</div>
              <div className="text-xs text-white/60 mt-1">سناریو</div>
            </div>
          </div>
        </div>

        {/* لیست سطوح */}
        <div className="space-y-4">
          {/* سطح فعال */}
          <div className="glass-panel p-6 rounded-3xl border border-[#8b5cf6] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#8b5cf6]/10 text-[#8b5cf6] flex items-center justify-center text-2xl font-bold">۱</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">مبتدی</h3>
                    <span className="px-2 py-0.5 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">در حال یادگیری</span>
                  </div>
                  <p className="text-sm text-[var(--foreground)]/60">آشنایی اولیه با گویش عراقی</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs text-[var(--foreground)]/60">پیشرفت سناریوها</div>
                <div className="w-full md:w-48 h-2 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8b5cf6] w-[25%]"></div>
                </div>
                <div className="text-xs font-mono text-[var(--foreground)]/60">۱ از ۴</div>
              </div>
            </div>
            <button className="mt-6 flex items-center gap-1 text-sm font-medium text-[#8b5cf6] hover:underline">
              شروع <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* سطح قفل شده */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)] opacity-60 grayscale-[0.5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--foreground)]/5 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[var(--foreground)]/40" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">پایه - A1</h3>
                  <p className="text-sm text-[var(--foreground)]/60">مکالمات ساده روزمره</p>
                </div>
              </div>
              <span className="text-xs text-[var(--foreground)]/40">برای باز شدن این سطح، سطوح قبلی را تکمیل کنید.</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}