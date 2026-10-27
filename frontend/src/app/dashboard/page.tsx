"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppShell } from '@/components/layout/AppShell';
import { AuthGuard } from '@/components/layout/AuthGuard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { apiClient } from '@/lib/api/client';
import { endpoints } from '@/lib/api/endpoints';
import { useAuthStore } from '@/stores/authStore';
import { toPersianNumber } from '@/lib/utils/number';
import { Flame, Trophy, Target, Sparkles } from 'lucide-react';
import type { SpeechListItem } from '@/types/speech';

// دقیقاً هم‌شکل با backend/app/schemas/progress.py -> ProgressSummaryResponse
interface ProgressSummary {
  practice_count: number;
  best_score: number | null;
  average_score: number | null;
  weekly_average_score: number | null;
  monthly_average_score: number | null;
  current_streak_days: number;
  score_trend: { date: string; score: number }[];
}

interface Badge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

function computeBadges(progress: ProgressSummary | undefined): Badge[] {
  const count = progress?.practice_count ?? 0;
  const best = progress?.best_score ?? 0;
  const streak = progress?.current_streak_days ?? 0;

  return [
    { id: 'first', label: 'اولین تمرین', icon: '🎙️', earned: count >= 1 },
    { id: 'ten', label: '۱۰ تمرین', icon: '🔟', earned: count >= 10 },
    { id: 'streak7', label: '۷ روز متوالی', icon: '🔥', earned: streak >= 7 },
    { id: 'score80', label: 'امتیاز بالای ۸۰', icon: '🏆', earned: best >= 80 },
  ];
}

// نمودار خطی سبک برای روند امتیاز، بدون نیاز به کتابخانه چارت خارجی
function ScoreTrendChart({ trend }: { trend: { date: string; score: number }[] }) {
  if (!trend || trend.length === 0) {
    return (
      <div className="h-24 flex items-center justify-center text-xs text-[var(--foreground)]/40">
        هنوز داده‌ای برای نمودار روند وجود ندارد.
      </div>
    );
  }

  const width = 300;
  const height = 80;
  const padding = 6;
  const points = trend.slice(-14); // ۱۴ تمرین اخیر

  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = padding + i * xStep;
    const y = height - padding - (Math.max(0, Math.min(100, p.score)) / 100) * (height - padding * 2);
    return { x, y, score: p.score };
  });

  const pathD = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24" preserveAspectRatio="none">
      <polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
        fill="none"
        stroke="url(#trendGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="trendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
      </defs>
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="#10b981" />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: progress, isLoading: progressLoading } = useQuery<ProgressSummary>({
    queryKey: ['progress', 'summary'],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.progress.summary);
      return res.data;
    },
  });

  const { data: speeches, isLoading: speechesLoading, isError: speechesError, refetch: refetchSpeeches } = useQuery<SpeechListItem[]>({
    queryKey: ['speech', 'list'],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.speech.list);
      return res.data;
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fa-IR', {
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const badges = computeBadges(progress);
  const streak = progress?.current_streak_days ?? 0;

  return (
    <AuthGuard>
      <AppShell>
        <section className="mb-8 animate-fade-in flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              سلام {user?.name || 'کاربر'} عزیز 👋
            </h1>
            <p className="text-[var(--foreground)]/60 text-lg">آماده‌ای تا امروز صدای خودت رو متحول کنی؟</p>
          </div>

          {streak > 0 && (
            <div className="glass-panel px-5 py-3 rounded-2xl flex items-center gap-2 border border-orange-500/30 bg-orange-500/5">
              <Flame className="w-6 h-6 text-orange-500" />
              <div>
                <div className="text-xl font-bold text-orange-500">{toPersianNumber(streak)} روز</div>
                <div className="text-xs text-[var(--foreground)]/50">تمرین متوالی</div>
              </div>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/practice" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] border border-[var(--border-color)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl">🎙️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">استودیوی سخنرانی</h3>
            <p className="text-sm text-[var(--foreground)]/60">شروع یک جلسه تمرین زنده با بازخورد هوش مصنوعی</p>
          </Link>

          <Link href="/translator" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-[var(--border-color)]">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl">🌐</span>
            </div>
            <h3 className="text-xl font-bold mb-2">مترجم زنده</h3>
            <p className="text-sm text-[var(--foreground)]/60">ترجمه همزمان صوتی بین فارسی و عراقی</p>
          </Link>

          <Link href="/learn" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-[var(--border-color)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#10b981] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-3xl">🗣️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">آموزش عراقی</h3>
            <p className="text-sm text-[var(--foreground)]/60">ادامه یادگیری لهجه اصیل عراقی</p>
          </Link>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* کارت پیشرفت */}
          <div className="glass-panel p-8 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">پیشرفت سخنرانی</h3>
              {progress && (
                <span className="text-sm text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">
                  {toPersianNumber(progress.practice_count)} تمرین
                </span>
              )}
            </div>

            {progressLoading && <Skeleton className="h-40 rounded-xl" />}

            {progress && progress.practice_count === 0 && (
              <div className="text-center py-8 text-[var(--foreground)]/50 flex flex-col items-center gap-2">
                <Target className="w-8 h-8 text-[var(--accent)]/50" />
                هنوز تمرینی ثبت نکرده‌اید. اولین تمرین را شروع کنید.
              </div>
            )}

            {progress && progress.practice_count > 0 && (
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#8b5cf6]">
                      {progress.average_score != null ? toPersianNumber(progress.average_score) : '—'}
                    </div>
                    <div className="text-xs text-[var(--foreground)]/50 mt-1">میانگین</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#10b981]">
                      {progress.best_score != null ? toPersianNumber(progress.best_score) : '—'}
                    </div>
                    <div className="text-xs text-[var(--foreground)]/50 mt-1">بهترین امتیاز</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#3b82f6]">
                      {progress.weekly_average_score != null ? toPersianNumber(progress.weekly_average_score) : '—'}
                    </div>
                    <div className="text-xs text-[var(--foreground)]/50 mt-1">این هفته</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[var(--foreground)]/50 mb-2">روند امتیاز (۱۴ تمرین اخیر)</div>
                  <ScoreTrendChart trend={progress.score_trend} />
                </div>
              </div>
            )}
          </div>

          {/* کارت آخرین فعالیت‌ها */}
          <div className="glass-panel p-8 rounded-[2rem]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">آخرین فعالیت‌ها</h3>
              <Link href="/practice" className="text-sm text-[var(--primary)] hover:underline">مشاهده همه</Link>
            </div>

            {speechesLoading && (
              <div className="space-y-4">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            )}

            {speechesError && <ErrorState onRetry={() => refetchSpeeches()} />}

            {speeches && speeches.length === 0 && (
              <div className="text-center py-8 text-[var(--foreground)]/50">
                هنوز فعالیتی ثبت نشده است.
              </div>
            )}

            {speeches && speeches.length > 0 && (
              <div className="space-y-4">
                {speeches.slice(0, 5).map((speech) => (
                  <Link
                    key={speech.id}
                    href={`/practice/${speech.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
                  >
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center text-xl">🎙️</div>
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate">{speech.topic_label ?? 'تمرین بدون عنوان'}</div>
                        <div className="text-xs text-[var(--foreground)]/40">{formatDate(speech.created_at)}</div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--accent)] shrink-0">
                      {speech.overall_score != null ? toPersianNumber(speech.overall_score) : '—'}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* نشان‌های پیشرفت (گیمیفیکیشن سبک) */}
        <section className="glass-panel p-8 rounded-[2rem]">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[var(--accent)]" />
            نشان‌های پیشرفت
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                  badge.earned
                    ? 'border-[var(--accent)]/40 bg-[var(--accent)]/5'
                    : 'border-white/10 opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.icon}</span>
                <span className="text-xs font-medium">{badge.label}</span>
                {badge.earned && (
                  <span className="text-[10px] text-[var(--accent)] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> کسب شد
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </AppShell>
    </AuthGuard>
  );
}
