"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_FA, DIFFICULTY_FA, STATUS_FA, useScenarioSummaries } from "@/features/learning/iraqi";
import { toPersianNumber } from "@/lib/utils/number";
import { ArrowRight, CheckCircle2, Clock, Lock, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Filter = "all" | "todo" | "completed";

export default function LevelScenariosPage({ params }: { params: Promise<{ levelId: string }> }) {
  const { levelId } = use(params);
  const { data, isLoading, isError, refetch } = useScenarioSummaries(levelId);
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState<string>("all");

  const categories = useMemo(() => Array.from(new Set((data ?? []).map((s) => s.category))), [data]);
  const rows = useMemo(
    () =>
      (data ?? []).filter(
        (s) =>
          (filter === "all" || (filter === "completed" ? s.status === "completed" : s.status !== "completed")) &&
          (category === "all" || s.category === category)
      ),
    [data, filter, category]
  );
  const done = (data ?? []).filter((s) => s.status === "completed").length;

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <Link href="/learn" className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
            <ArrowRight className="h-4 w-4" /> همه‌ی سطح‌ها
          </Link>

          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">سناریوهای این سطح</h1>
            {data && (
              <p className="text-sm text-[var(--foreground)]/60">
                {toPersianNumber(done)} از {toPersianNumber(data.length)} سناریو تکمیل شده
              </p>
            )}
          </div>

          {data && data.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs">
              {(["all", "todo", "completed"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 transition",
                    filter === f
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-[#8b5cf6]"
                      : "border-[var(--border-color)] text-[var(--foreground)]/60"
                  )}
                >
                  {f === "all" ? "همه" : f === "todo" ? "باقی‌مانده" : "تکمیل‌شده"}
                </button>
              ))}
              <span className="mx-1 self-center text-[var(--foreground)]/20">|</span>
              {["all", ...categories].map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 transition",
                    category === c
                      ? "border-[#10b981] bg-[#10b981]/15 text-[#10b981]"
                      : "border-[var(--border-color)] text-[var(--foreground)]/60"
                  )}
                >
                  {c === "all" ? "همه‌ی موضوع‌ها" : CATEGORY_FA[c] ?? c}
                </button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.length === 0 && <EmptyState title="سناریویی در این سطح نیست" />}
          {data && data.length > 0 && rows.length === 0 && <EmptyState title="موردی با این فیلتر نیست" />}

          <div className="space-y-3">
            {rows.map((s) => {
              const card = (
                <Card className={cn("transition", s.unlocked ? "hover:border-[var(--primary)]" : "opacity-60")}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8b5cf6]/10 text-sm font-bold text-[#8b5cf6]">
                      {toPersianNumber(s.order_index)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <h3 className="font-semibold text-[var(--foreground)]">{s.title_fa}</h3>
                        {s.title_iq && (
                          <span className="text-sm text-[var(--foreground)]/50" dir="rtl">
                            {s.title_iq}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]/60">{s.description_fa}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--foreground)]/50">
                        <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5">{CATEGORY_FA[s.category] ?? s.category}</span>
                        {s.difficulty && (
                          <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5">
                            {DIFFICULTY_FA[s.difficulty]}
                          </span>
                        )}
                        {s.estimated_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {toPersianNumber(s.estimated_minutes)} دقیقه
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          {toPersianNumber(s.key_vocabulary.length)} واژه
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 pt-1 text-xs">
                      {!s.unlocked ? (
                        <Lock className="h-5 w-5 text-[var(--foreground)]/40" />
                      ) : s.status === "completed" ? (
                        <span className="flex items-center gap-1 text-green-500">
                          <CheckCircle2 className="h-4 w-4" /> {STATUS_FA.completed}
                        </span>
                      ) : s.status === "in_progress" ? (
                        <span className="flex items-center gap-1 text-amber-500">
                          <PlayCircle className="h-4 w-4" /> {STATUS_FA.in_progress}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </Card>
              );
              return s.unlocked ? (
                <Link key={s.id} href={`/learn/scenario/${s.id}`} className="block">
                  {card}
                </Link>
              ) : (
                <div key={s.id} title="ابتدا سناریوهای قبلی را تکمیل کنید">
                  {card}
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
