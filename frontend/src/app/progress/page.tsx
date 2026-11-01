"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { progressService } from "@/features/progress/progress.service";
import { toPersianNumber } from "@/lib/utils/number";
import { TrendingUp, Award, Flame, Target, Bell, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { ProgressSummary, DimensionTrend } from "@/types/progress";

const XP_PER_LEVEL = 200;

function ScoreTrendChart({ trend }: { trend: ProgressSummary["score_trend"] }) {
  const points = (trend || [])
    .map((p) => ({ date: String(p.date ?? ""), score: Number(p.score ?? 0) }))
    .filter((p) => p.date)
    .slice(-14);

  if (points.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-sm text-[var(--foreground)]/40">
        هنوز داده کافی برای نمودار روند وجود ندارد.
      </div>
    );
  }

  const width = 400;
  const height = 100;
  const padding = 8;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (Math.max(0, Math.min(100, p.score)) / 100) * (height - padding * 2);
    return { x, y };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28" preserveAspectRatio="none">
      <defs>
        <linearGradient id="progressTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
        fill="none"
        stroke="url(#progressTrendGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="#10b981" />
      ))}
    </svg>
  );
}

export default function ProgressPage() {
  const {
    data: progress,
    isLoading,
    isError,
    refetch,
  } = useQuery<ProgressSummary>({
    queryKey: ["progress", "summary"],
    queryFn: () => progressService.summary(),
  });

  const {
    data: trends,
    isLoading: trendsLoading,
  } = useQuery<DimensionTrend[]>({
    queryKey: ["progress", "trends"],
    queryFn: () => progressService.trends(),
  });

  if (isLoading) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="mx-auto max-w-5xl space-y-6 pb-10">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </AppShell>
      </AuthGuard>
    );
  }

  if (isError || !progress) {
    return (
      <AuthGuard>
        <AppShell>
          <ErrorState
            title="بارگذاری پیشرفت ممکن نشد"
            description="اتصال به سرور برقرار نشد. دوباره تلاش کنید."
            onRetry={() => refetch()}
          />
        </AppShell>
      </AuthGuard>
    );
  }

  const badges = progress.badges ?? [];
  const xpProgress = XP_PER_LEVEL - (progress.xp_to_next_level || XP_PER_LEVEL);
  const xpPct = Math.min(100, (xpProgress / XP_PER_LEVEL) * 100);

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-8 pb-10">
          <header className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-2xl">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">پیشرفت من</h1>
              <p className="text-[var(--foreground)]/60 mt-1">آمار واقعی عملکرد شما در خطیب</p>
            </div>
          </header>

          {progress.reminder_message && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <Bell className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-100/90">{progress.reminder_message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--foreground)]/60">کل تمرین‌ها</span>
                <Award className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              <div className="text-3xl font-black text-[var(--foreground)]">
                {toPersianNumber(progress.practice_count)}
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--foreground)]/60">میانگین کل</span>
                <TrendingUp className="w-5 h-5 text-[#10b981]" />
              </div>
              <div className="text-3xl font-black text-[var(--foreground)]">
                {progress.average_score != null ? toPersianNumber(progress.average_score) : "—"}
              </div>
              {progress.platform_average_score != null && (
                <p className="text-xs text-[var(--foreground)]/50 mt-2">
                  میانگین پلتفرم: {toPersianNumber(progress.platform_average_score)}
                </p>
              )}
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-[var(--foreground)]/60">روزهای پیایی</span>
                <Flame className="w-5 h-5 text-[#f59e0b]" />
              </div>
              <div className="text-3xl font-black text-[var(--foreground)]">
                {toPersianNumber(progress.current_streak_days)}
              </div>
            </div>
          </div>

          {/* XP + challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">سطح {toPersianNumber(progress.level)}</span>
                <span className="text-xs text-[var(--foreground)]/50">
                  {toPersianNumber(progress.xp)} XP
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981]"
                  style={{ width: `${xpPct}%` }}
                />
              </div>
              <p className="text-xs text-[var(--foreground)]/50">
                {toPersianNumber(progress.xp_to_next_level)} XP تا سطح بعد
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4 text-[#10b981]" />
                    چالش روزانه
                  </span>
                  <span>
                    {toPersianNumber(progress.daily_practice_count)} /{" "}
                    {toPersianNumber(progress.daily_challenge_target)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10b981]"
                    style={{
                      width: `${Math.min(
                        100,
                        (progress.daily_practice_count / Math.max(1, progress.daily_challenge_target)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>چالش هفتگی</span>
                  <span>
                    {toPersianNumber(progress.weekly_practice_count)} /{" "}
                    {toPersianNumber(progress.weekly_challenge_target)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#8b5cf6]"
                    style={{
                      width: `${Math.min(
                        100,
                        (progress.weekly_practice_count / Math.max(1, progress.weekly_challenge_target)) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Trend chart */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)]">
            <h2 className="text-lg font-bold mb-4">روند امتیاز (۱۴ تمرین اخیر)</h2>
            <ScoreTrendChart trend={progress.score_trend} />
          </div>

          {/* Dimension trends */}
          <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)]">
            <h2 className="text-lg font-bold mb-4">تحلیل ابعاد سخنرانی</h2>
            {trendsLoading ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : !trends || trends.length === 0 ? (
              <p className="text-[var(--foreground)]/60 text-center py-8">
                هنوز داده کافی برای مقایسه ابعاد وجود ندارد. چند تمرین بیشتر انجام دهید.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {trends.map((t) => (
                  <div
                    key={t.dimension}
                    className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-medium">{t.label_fa}</div>
                      <div className="text-xs text-[var(--foreground)]/50">
                        اخیر: {toPersianNumber(t.recent_average)} · قبل:{" "}
                        {toPersianNumber(t.previous_average)}
                      </div>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-sm font-bold ${
                        t.change_percent >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {t.change_percent >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {toPersianNumber(Math.abs(t.change_percent))}٪
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="glass-panel p-6 rounded-3xl border border-[var(--border-color)]">
              <h2 className="text-lg font-bold mb-4">مدال‌ها</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.id}
                    className={`flex flex-col items-center gap-1 rounded-xl p-3 border text-center ${
                      b.earned
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-white/5 bg-white/5 opacity-40"
                    }`}
                  >
                    <span className="text-2xl">{b.icon}</span>
                    <span className="text-[10px] leading-tight">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#10b981] px-6 py-3 text-sm font-medium"
            >
              شروع تمرین جدید
            </Link>
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
