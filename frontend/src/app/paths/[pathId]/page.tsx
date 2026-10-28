"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { COURSE_PATHS, type CourseWeek } from "@/features/learning-paths/coursePaths";
import { isWeekComplete, markWeekComplete, unmarkWeekComplete } from "@/features/learning-paths/progress";
import { PRACTICE_LEVELS } from "@/features/practice/content";
import { ArrowRight, CheckCircle2, Circle, Mic2, HelpCircle } from "lucide-react";

function WeekQuiz({ week }: { week: CourseWeek }) {
  const [answers, setAnswers] = useState<(number | null)[]>(week.quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const score = week.quiz.filter((q, i) => answers[i] === q.correctIndex).length;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col gap-4">
      <h4 className="text-sm font-semibold flex items-center gap-2 text-[var(--foreground)]/80">
        <HelpCircle className="w-4 h-4" />
        آزمونک مرور ({week.quiz.length} سوال)
      </h4>

      {week.quiz.map((q, qi) => (
        <div key={qi} className="flex flex-col gap-2">
          <p className="text-sm">{q.question}</p>
          <div className="flex flex-col gap-1">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = submitted && oi === q.correctIndex;
              const isWrongSelected = submitted && isSelected && oi !== q.correctIndex;
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={submitted}
                  onClick={() => {
                    const next = [...answers];
                    next[qi] = oi;
                    setAnswers(next);
                  }}
                  className={`text-right text-xs px-3 py-2 rounded-lg border transition-colors ${
                    isCorrect
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : isWrongSelected
                      ? "border-red-500/50 bg-red-500/10 text-red-300"
                      : isSelected
                      ? "border-[#8b5cf6]/50 bg-[#8b5cf6]/10"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {!submitted ? (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={answers.some((a) => a === null)}
          className="self-start text-xs rounded-lg bg-white/10 hover:bg-white/15 px-4 py-2 disabled:opacity-40"
        >
          بررسی پاسخ‌ها
        </button>
      ) : (
        <p className="text-xs text-[var(--foreground)]/60">
          {score} از {week.quiz.length} پاسخ درست بود.
        </p>
      )}
    </div>
  );
}

export default function CoursePathDetailPage({ params }: { params: Promise<{ pathId: string }> }) {
  const { pathId } = use(params);
  const router = useRouter();
  const path = COURSE_PATHS.find((p) => p.id === pathId);

  const [mounted, setMounted] = useState(false);
  const [, forceRerender] = useState(0);
  useEffect(() => setMounted(true), []);

  if (!path) {
    return (
      <AuthGuard>
        <AppShell>
          <div className="text-center py-16 text-[var(--foreground)]/50">این مسیر آموزشی یافت نشد.</div>
        </AppShell>
      </AuthGuard>
    );
  }

  const goToPractice = (week: CourseWeek) => {
    router.push(`/practice?mode=${week.mode}&level=${week.level}&id=${week.bankId}`);
  };

  const toggleComplete = (week: CourseWeek) => {
    if (isWeekComplete(path.id, week.id)) {
      unmarkWeekComplete(path.id, week.id);
    } else {
      markWeekComplete(path.id, week.id);
    }
    forceRerender((n) => n + 1);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mb-6">
          <Link href="/paths" className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] w-fit">
            <ArrowRight className="w-4 h-4" />
            بازگشت به مسیرها
          </Link>
        </div>

        <section className="mb-8 flex items-start gap-4">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
            {path.icon}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{path.title}</h1>
            <p className="text-[var(--foreground)]/60">{path.description}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              سطح {PRACTICE_LEVELS[path.level].fa}
            </span>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          {path.weeks.map((week) => {
            const done = mounted && isWeekComplete(path.id, week.id);
            return (
              <div key={week.id} className="glass-panel p-6 rounded-[2rem] border border-[var(--border-color)]">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleComplete(week)}
                      className="mt-0.5 shrink-0"
                      aria-label="علامت‌گذاری هفته"
                    >
                      {done ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-[var(--foreground)]/30" />
                      )}
                    </button>
                    <div>
                      <div className="text-xs text-[var(--foreground)]/40 mb-1">هفته {week.weekNumber}</div>
                      <h3 className="font-bold">{week.title}</h3>
                      <p className="text-sm text-[var(--foreground)]/60 mt-1">{week.description}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => goToPractice(week)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#10b981] px-4 py-2 text-sm font-medium shrink-0"
                  >
                    <Mic2 className="w-4 h-4" />
                    شروع تمرین
                  </button>
                </div>

                <div className="mt-4">
                  <WeekQuiz week={week} />
                </div>
              </div>
            );
          })}
        </section>
      </AppShell>
    </AuthGuard>
  );
}
