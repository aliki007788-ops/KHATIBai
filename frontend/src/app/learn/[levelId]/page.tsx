"use client";

import { use, useMemo } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useLevels,
  useScenarios,
  useStartScenario,
  useCompleteScenario,
} from "@/features/learning/hooks";
import Link from "next/link";
import {
  ArrowRight,
  Lock,
  Play,
  CheckCircle2,
  BookOpen,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toPersianNumber } from "@/lib/utils/number";
import type { Scenario } from "@/types/learning";

function ScenarioCard({
  scenario,
  onStart,
  onComplete,
  starting,
  completing,
}: {
  scenario: Scenario;
  onStart: () => void;
  onComplete: () => void;
  starting: boolean;
  completing: boolean;
}) {
  const isCompleted = scenario.status === "completed";
  const isLocked = !scenario.unlocked;

  const vocab = Array.isArray(scenario.key_vocabulary)
    ? (scenario.key_vocabulary as unknown[]).slice(0, 4)
    : [];

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-all duration-300",
        isLocked && "opacity-55",
        !isLocked && "hover:border-[var(--primary)]/50 hover:shadow-md"
      )}
    >
      {isCompleted && (
        <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[var(--foreground)]">
              {scenario.title_fa}
            </h3>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                <CheckCircle2 className="h-3 w-3" />
                تکمیل‌شده
              </span>
            )}
            {scenario.category && (
              <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5 text-[10px] text-[var(--foreground)]/45">
                {scenario.category}
              </span>
            )}
          </div>

          <p className="mb-3 text-sm leading-relaxed text-[var(--foreground)]/55">
            {scenario.description_fa}
          </p>

          {vocab.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vocab.map((v, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--foreground)]/[0.03] px-2 py-0.5 text-[11px] text-[var(--foreground)]/60"
                >
                  {String(v)}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {isLocked ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--foreground)]/5 text-[var(--foreground)]/30">
              <Lock className="h-4 w-4" />
            </div>
          ) : (
            <>
              <Button
                size="sm"
                loading={starting}
                onClick={onStart}
              >
                <Play className="h-3.5 w-3.5" />
                {isCompleted ? "تمرین مجدد" : "شروع"}
              </Button>
              {!isCompleted && (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={completing}
                  onClick={onComplete}
                  title="علامت‌گذاری به عنوان تکمیل‌شده"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function LevelScenariosPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = use(params);
  const { data: levels } = useLevels();
  const { data: scenarios, isLoading, isError, refetch } = useScenarios(levelId);
  const start = useStartScenario();
  const complete = useCompleteScenario();

  const level = levels?.find((l) => l.id === levelId);

  const stats = useMemo(() => {
    if (!scenarios) return { total: 0, completed: 0, pct: 0 };
    const total = scenarios.length;
    const completed = scenarios.filter((s) => s.status === "completed").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct };
  }, [scenarios]);

  // Group by category
  const grouped = useMemo(() => {
    if (!scenarios) return [];
    const map = new Map<string, Scenario[]>();
    for (const s of scenarios) {
      const key = s.category || "عمومی";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return Array.from(map.entries());
  }, [scenarios]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col gap-6 pb-10">
          {/* Back */}
          <Link
            href="/learn"
            className="flex w-fit items-center gap-1.5 text-sm text-[var(--foreground)]/50 transition hover:text-[var(--foreground)]"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به مسیر یادگیری
          </Link>

          {/* Level header */}
          <section className="relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-gradient-to-br from-[var(--primary)]/8 via-transparent to-transparent p-6">
            <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-[var(--primary)] opacity-10 blur-3xl" />
            <div className="relative">
              <div className="mb-2 flex items-center gap-2 text-[var(--primary)]">
                <BookOpen className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  {level ? `سطح ${toPersianNumber(level.order_index)}` : "سطح"}
                </span>
              </div>
              <h1 className="mb-1 text-xl font-bold text-[var(--foreground)] sm:text-2xl">
                {level?.name_fa || "سناریوها"}
              </h1>
              {level?.description_fa && (
                <p className="mb-4 max-w-lg text-sm text-[var(--foreground)]/55">
                  {level.description_fa}
                </p>
              )}

              {/* Progress */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1.5 flex justify-between text-xs text-[var(--foreground)]/45">
                    <span>
                      {toPersianNumber(stats.completed)} از {toPersianNumber(stats.total)} سناریو
                    </span>
                    <span className="font-medium">{toPersianNumber(stats.pct)}٪</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--foreground)]/8">
                    <div
                      className="h-full rounded-full bg-[var(--primary)] transition-all duration-700"
                      style={{ width: `${stats.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tip */}
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] p-4">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
            <p className="text-xs leading-relaxed text-[var(--foreground)]/55">
              هر سناریو یک موقعیت واقعی است. با شروع، وارد گفتگوی تعاملی با مربی می‌شوید.
              بهتر است با صدای بلند تمرین کنید تا لهجه و اعتمادبه‌نفستان تقویت شود.
            </p>
          </div>

          {/* Scenarios */}
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          )}

          {isError && <ErrorState onRetry={() => refetch()} />}

          {scenarios && scenarios.length === 0 && (
            <EmptyState title="سناریویی در این سطح تعریف نشده" />
          )}

          {scenarios && scenarios.length > 0 && (
            <div className="space-y-8">
              {grouped.map(([category, items]) => (
                <div key={category}>
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <h2 className="text-sm font-bold text-[var(--foreground)]">
                      {category}
                    </h2>
                    <span className="text-xs text-[var(--foreground)]/40">
                      ({toPersianNumber(items.length)})
                    </span>
                  </div>
                  <div className="space-y-3">
                    {items
                      .slice()
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((s) => (
                        <ScenarioCard
                          key={s.id}
                          scenario={s}
                          starting={start.isPending}
                          completing={complete.isPending}
                          onStart={() => start.mutate(s.id)}
                          onComplete={() => complete.mutate(s.id)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
