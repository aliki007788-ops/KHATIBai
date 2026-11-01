"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLevels, useDailyRecommendation, useStartScenario } from "@/features/learning/hooks";
import Link from "next/link";
import { toPersianNumber } from "@/lib/utils/number";
import {
  Lock,
  CheckCircle2,
  Play,
  Sparkles,
  Trophy,
  Target,
  ArrowLeft,
  BookOpen,
  Flame,
  Star,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Level } from "@/types/learning";

function progressPercent(level: Level) {
  if (!level.total_count) return 0;
  return Math.min(100, Math.round((level.completed_count / level.total_count) * 100));
}

function LevelNode({ level, index, isLast }: { level: Level; index: number; isLast: boolean }) {
  const pct = progressPercent(level);
  const isCompleted = level.total_count > 0 && level.completed_count >= level.total_count;
  const isCurrent = level.unlocked && !isCompleted;

  return (
    <div className="relative flex gap-4">
      {/* Vertical path line */}
      {!isLast && (
        <div
          className={cn(
            "absolute right-[27px] top-14 w-0.5 h-[calc(100%-2.5rem)]",
            isCompleted ? "bg-emerald-500/60" : level.unlocked ? "bg-[var(--primary)]/30" : "bg-[var(--foreground)]/10"
          )}
        />
      )}

      {/* Node circle */}
      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all duration-300",
            isCompleted && "border-emerald-500 bg-emerald-500/15 text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]",
            isCurrent && "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] shadow-[0_0_24px_rgba(255,123,84,0.3)] scale-105",
            !level.unlocked && "border-[var(--foreground)]/15 bg-[var(--foreground)]/5 text-[var(--foreground)]/30"
          )}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : !level.unlocked ? (
            <Lock className="h-5 w-5" />
          ) : (
            <span className="text-lg font-bold">{toPersianNumber(level.order_index)}</span>
          )}
        </div>
      </div>

      {/* Content card */}
      <Link
        href={level.unlocked ? `/learn/${level.id}` : "#"}
        className={cn(
          "mb-5 flex-1 transition-all duration-300",
          !level.unlocked && "pointer-events-none"
        )}
      >
        <Card
          className={cn(
            "group relative overflow-hidden p-5 transition-all duration-300",
            level.unlocked && "hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-0.5",
            isCurrent && "ring-1 ring-[var(--primary)]/40",
            !level.unlocked && "opacity-55"
          )}
        >
          {/* subtle glow for current */}
          {isCurrent && (
            <div className="pointer-events-none absolute -left-8 -top-8 h-32 w-32 rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />
          )}

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  {level.name_fa}
                </h3>
                {isCompleted && (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                    تکمیل شده
                  </span>
                )}
                {isCurrent && (
                  <span className="rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                    در حال یادگیری
                  </span>
                )}
              </div>

              {level.description_fa && (
                <p className="mb-3 text-sm leading-relaxed text-[var(--foreground)]/55 line-clamp-2">
                  {level.description_fa}
                </p>
              )}

              {/* Progress bar */}
              <div className="mb-1.5 flex items-center justify-between text-xs text-[var(--foreground)]/45">
                <span>
                  {toPersianNumber(level.completed_count)} از {toPersianNumber(level.total_count)} سناریو
                </span>
                <span className="font-medium">{toPersianNumber(pct)}٪</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--foreground)]/8">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-700",
                    isCompleted ? "bg-emerald-500" : "bg-[var(--primary)]"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            {level.unlocked && (
              <div className="flex shrink-0 items-center text-[var(--foreground)]/30 transition group-hover:text-[var(--primary)]">
                <ChevronLeft className="h-5 w-5" />
              </div>
            )}
          </div>
        </Card>
      </Link>
    </div>
  );
}

export default function LearnPage() {
  const { data: levels, isLoading, isError, refetch } = useLevels();
  const { data: daily } = useDailyRecommendation();
  const startScenario = useStartScenario();

  const totalScenarios = levels?.reduce((s, l) => s + (l.total_count || 0), 0) ?? 0;
  const completedScenarios = levels?.reduce((s, l) => s + (l.completed_count || 0), 0) ?? 0;
  const overallPct = totalScenarios > 0 ? Math.round((completedScenarios / totalScenarios) * 100) : 0;
  const unlockedCount = levels?.filter((l) => l.unlocked).length ?? 0;
  const completedLevels = levels?.filter((l) => l.total_count > 0 && l.completed_count >= l.total_count).length ?? 0;
  const currentLevel = levels?.find((l) => l.unlocked && !(l.total_count > 0 && l.completed_count >= l.total_count));

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-8 pb-10">
          {/* ===== Hero ===== */}
          <section className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--accent)]/5 p-6 sm:p-8">
            <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-[var(--primary)] opacity-15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-[var(--accent)] opacity-10 blur-3xl" />

            <div className="relative">
              <div className="mb-1 flex items-center gap-2 text-[var(--primary)]">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-semibold tracking-wide">مسیر یادگیری گویش عراقی</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">
                آموزش حرفه‌ای و ساختاریافته
              </h1>
              <p className="mb-6 max-w-md text-sm leading-relaxed text-[var(--foreground)]/60">
                از مکالمات روزمره تا سخنرانی رسمی — با سناریوهای واقعی، بازخورد هوشمند و پیشرفت قابل اندازه‌گیری.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)]/70 px-3 py-3 text-center backdrop-blur-sm">
                  <div className="mb-1 flex justify-center text-[var(--primary)]">
                    <Target className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {toPersianNumber(overallPct)}٪
                  </div>
                  <div className="text-[10px] text-[var(--foreground)]/50">پیشرفت کلی</div>
                </div>
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)]/70 px-3 py-3 text-center backdrop-blur-sm">
                  <div className="mb-1 flex justify-center text-amber-500">
                    <Flame className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {toPersianNumber(completedScenarios)}
                  </div>
                  <div className="text-[10px] text-[var(--foreground)]/50">سناریو تکمیل‌شده</div>
                </div>
                <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)]/70 px-3 py-3 text-center backdrop-blur-sm">
                  <div className="mb-1 flex justify-center text-emerald-500">
                    <Trophy className="h-4 w-4" />
                  </div>
                  <div className="text-lg font-bold text-[var(--foreground)]">
                    {toPersianNumber(completedLevels)}
                  </div>
                  <div className="text-[10px] text-[var(--foreground)]/50">سطح کامل‌شده</div>
                </div>
              </div>
            </div>
          </section>

          {/* ===== Daily Recommendation ===== */}
          {daily && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-[var(--foreground)]">توصیه امروز</h2>
              </div>
              <Card className="relative overflow-hidden border-[var(--primary)]/25 bg-gradient-to-l from-[var(--primary)]/5 to-transparent p-5">
                <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-[var(--primary)]" />
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="mb-1 font-semibold text-[var(--foreground)]">{daily.title_fa}</h3>
                    <p className="text-sm text-[var(--foreground)]/60">{daily.description_fa}</p>
                    {daily.action_topic_label && (
                      <span className="mt-2 inline-block rounded-full bg-[var(--foreground)]/5 px-2.5 py-0.5 text-[11px] text-[var(--foreground)]/50">
                        {daily.action_topic_label}
                      </span>
                    )}
                  </div>
                  {daily.action_scenario_id && (
                    <Button
                      size="sm"
                      loading={startScenario.isPending}
                      onClick={() => startScenario.mutate(daily.action_scenario_id!)}
                      className="shrink-0"
                    >
                      <Play className="h-3.5 w-3.5" />
                      شروع تمرین
                    </Button>
                  )}
                </div>
              </Card>
            </section>
          )}

          {/* ===== Continue CTA ===== */}
          {currentLevel && (
            <Link href={`/learn/${currentLevel.id}`}>
              <Card className="group flex items-center justify-between gap-4 border-[var(--primary)]/30 p-4 transition hover:border-[var(--primary)] hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
                    <Play className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-[var(--foreground)]/50">ادامه یادگیری</div>
                    <div className="font-semibold text-[var(--foreground)]">{currentLevel.name_fa}</div>
                  </div>
                </div>
                <ArrowLeft className="h-5 w-5 text-[var(--foreground)]/30 transition group-hover:text-[var(--primary)]" />
              </Card>
            </Link>
          )}

          {/* ===== Learning Path ===== */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--foreground)]">مسیر سطوح</h2>
                <p className="text-xs text-[var(--foreground)]/50">
                  {toPersianNumber(unlockedCount)} از {toPersianNumber(levels?.length ?? 0)} سطح باز شده
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-[var(--foreground)]/40">
                <Star className="h-3.5 w-3.5" />
                <span>پیشرفت ساختاریافته</span>
              </div>
            </div>

            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
                    <Skeleton className="h-28 flex-1 rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {isError && <ErrorState onRetry={() => refetch()} />}

            {levels && levels.length === 0 && (
              <EmptyState title="هنوز سطحی تعریف نشده" />
            )}

            {levels && levels.length > 0 && (
              <div className="relative">
                {levels
                  .slice()
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((level, idx, arr) => (
                    <LevelNode
                      key={level.id}
                      level={level}
                      index={idx}
                      isLast={idx === arr.length - 1}
                    />
                  ))}
              </div>
            )}
          </section>

          {/* ===== Bottom tip ===== */}
          <p className="text-center text-xs leading-relaxed text-[var(--foreground)]/40">
            هر سناریو یک موقعیت واقعی است. با تمرین مداوم، لهجه و اعتمادبه‌نفست قوی‌تر می‌شود.
          </p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
