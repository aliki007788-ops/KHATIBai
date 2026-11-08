"use client";

import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLevels } from "@/features/learning/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import { Lock, CheckCircle2, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LearnPage() {
  const { data, isLoading, isError, refetch } = useLevels();

  const total = data?.reduce((a, l) => a + l.total_count, 0) ?? 0;
  const done = data?.reduce((a, l) => a + l.completed_count, 0) ?? 0;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">آموزش گویش عراقی</h1>
            <p className="text-sm text-[var(--foreground)]/60">
              از سلام‌واحوال‌پرسی تا مذاکره و سخنرانی؛ هر سطح با سناریوهای واقعی و مربی هوشمند
            </p>
          </div>

          {data && total > 0 && (
            <Card>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-[var(--foreground)]">پیشرفت کل شما</span>
                <span className="text-[var(--foreground)]/60">
                  {toPersianNumber(done)} از {toPersianNumber(total)} سناریو ({toPersianNumber(pct)}٪)
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--foreground)]/10">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#10b981] to-[#8b5cf6] transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </Card>
          )}

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.length === 0 && <EmptyState title="سطحی تعریف نشده" />}

          {data && data.length > 0 && (
            <div className="space-y-3">
              {data.map((level) => {
                const finished = level.total_count > 0 && level.completed_count >= level.total_count;
                const lp = level.total_count ? Math.round((level.completed_count / level.total_count) * 100) : 0;
                return (
                  <Link
                    key={level.id}
                    href={level.unlocked ? `/learn/${level.id}` : "#"}
                    aria-disabled={!level.unlocked}
                    className={cn(!level.unlocked && "pointer-events-none")}
                  >
                    <Card
                      className={cn(
                        "flex items-center gap-4 transition hover:border-[var(--primary)]",
                        !level.unlocked && "opacity-60"
                      )}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                        {!level.unlocked ? (
                          <Lock className="h-5 w-5 text-[var(--foreground)]/40" />
                        ) : finished ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <span className="text-sm font-bold" dir="ltr">
                            {level.code === "beginner" ? "A0" : level.code}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[var(--foreground)]">{level.name_fa}</h3>
                        {level.description_fa && (
                          <p className="mt-0.5 text-xs text-[var(--foreground)]/60">{level.description_fa}</p>
                        )}
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--foreground)]/10">
                            <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${lp}%` }} />
                          </div>
                          <span className="shrink-0 text-xs text-[var(--foreground)]/50">
                            {toPersianNumber(level.completed_count)} / {toPersianNumber(level.total_count)}
                          </span>
                        </div>
                        {!level.unlocked && (
                          <p className="mt-1 text-xs text-amber-500">
                            با تکمیل حدود ۶۰٪ سناریوهای سطح قبل باز می‌شود
                          </p>
                        )}
                      </div>
                      {level.unlocked && <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--foreground)]/30" />}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
