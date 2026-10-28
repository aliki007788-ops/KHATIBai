"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { COURSE_PATHS } from "@/features/learning-paths/coursePaths";
import { getCompletedWeeks } from "@/features/learning-paths/progress";
import { PRACTICE_LEVELS } from "@/features/practice/content";
import { toPersianNumber } from "@/lib/utils/number";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export default function CoursePathsPage() {
  // پیشرفت از localStorage خوانده می‌شود، پس فقط بعد از mount در دسترس است (برای جلوگیری از عدم‌تطابق hydration).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <AuthGuard>
      <AppShell>
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[var(--accent)]" />
            مسیرهای آموزشی چندهفته‌ای
          </h1>
          <p className="text-[var(--foreground)]/60 text-lg">
            برنامه‌ی گام‌به‌گام برای پیشرفت منظم، به‌جای تمرین‌های پراکنده.
          </p>
          <p className="text-xs text-[var(--foreground)]/40 mt-2">
            پیشرفت هر مسیر فقط روی همین مرورگر ذخیره می‌شود و با پاک‌کردن اطلاعات مرورگر از بین می‌رود.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COURSE_PATHS.map((path) => {
            const completed = mounted ? getCompletedWeeks(path.id).length : 0;
            const total = path.weeks.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <Link
                key={path.id}
                href={`/paths/${path.id}`}
                className="glass-panel p-6 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 border border-[var(--border-color)] flex flex-col"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {path.icon}
                </div>
                <h3 className="text-lg font-bold mb-1">{path.title}</h3>
                <p className="text-sm text-[var(--foreground)]/60 mb-4 flex-1">{path.description}</p>

                <div className="flex items-center justify-between text-xs text-[var(--foreground)]/50 mb-2">
                  <span>{PRACTICE_LEVELS[path.level].fa}</span>
                  <span>
                    {toPersianNumber(completed)} از {toPersianNumber(total)} هفته
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct === 100 && (
                  <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    مسیر کامل شد
                  </div>
                )}
              </Link>
            );
          })}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
