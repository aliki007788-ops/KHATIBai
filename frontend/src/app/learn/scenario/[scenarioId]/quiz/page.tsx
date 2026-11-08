"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useScenarioDetail } from "@/features/learning/iraqi";
import { buildQuiz, getBest, getMissed, saveBest, setMissed, type QuizQuestion } from "@/features/learning/practice";
import { speak } from "@/features/speech/speak";
import { toPersianNumber } from "@/lib/utils/number";
import { ArrowRight, RotateCcw, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const KIND_FA = {
  iq2fa: "معنی این واژه‌ی عراقی چیست؟",
  fa2iq: "معادل عراقی این واژه کدام است؟",
  cloze: "جای خالی را پر کنید",
} as const;

export default function QuizPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const { data: s, isLoading, isError, refetch } = useScenarioDetail(scenarioId);

  const [qs, setQs] = useState<QuizQuestion[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number | null>(null);

  const restart = () => {
    if (!s) return;
    setQs(buildQuiz(s.key_vocabulary));
    setI(0);
    setPicked(null);
    setWrong([]);
    setScore(0);
  };

  useEffect(() => {
    if (s) {
      setBest(getBest(s.id));
      restart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.id]);

  const done = qs.length > 0 && i >= qs.length;
  const q = !done ? qs[i] : undefined;
  const pct = qs.length ? Math.round((score / qs.length) * 100) : 0;

  useEffect(() => {
    if (!done || !s) return;
    saveBest(s.id, pct);
    setBest(getBest(s.id));
    // واژه‌های درست‌جواب‌داده‌شده از لیست مشکل‌دار حذف می‌شوند، غلط‌ها اضافه
    const remaining = getMissed(s.id).filter((w) => !qs.some((x) => x.word.iq === w) || wrong.includes(w));
    setMissed(s.id, [...remaining, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  const choose = (opt: string) => {
    if (!q || picked) return;
    setPicked(opt);
    if (opt === q.answer) setScore((x) => x + 1);
    else setWrong((w) => [...w, q.word.iq]);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <Link href={`/learn/scenario/${scenarioId}`} className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]">
            <ArrowRight className="h-4 w-4" /> بازگشت به سناریو
          </Link>

          {isLoading && <Skeleton className="h-72" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {s && qs.length === 0 && !isLoading && (
            <Card className="text-center text-sm text-[var(--foreground)]/60">برای ساخت آزمون، این سناریو واژه‌ی کافی ندارد.</Card>
          )}

          {s && q && (
            <>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">آزمون واژگان</h1>
                <p className="text-sm text-[var(--foreground)]/60">
                  {s.title_fa}
                  {best !== null && <span> · بهترین نتیجه‌ی شما: {toPersianNumber(best)}٪</span>}
                </p>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--foreground)]/10">
                <div className="h-full bg-[#8b5cf6] transition-all" style={{ width: `${(i / qs.length) * 100}%` }} />
              </div>
              <div className="text-xs text-[var(--foreground)]/50">
                سؤال {toPersianNumber(i + 1)} از {toPersianNumber(qs.length)}
              </div>

              <Card className="space-y-4">
                <p className="text-sm text-[var(--foreground)]/60">{KIND_FA[q.kind]}</p>
                <div className="flex items-center justify-center gap-3 text-center">
                  <span className={cn("text-2xl font-bold text-[var(--foreground)]", q.kind !== "fa2iq" && "leading-10")} dir={q.kind === "fa2iq" ? undefined : "rtl"}>
                    {q.prompt}
                  </span>
                  {q.kind === "iq2fa" && (
                    <button type="button" onClick={() => speak(q.prompt)} aria-label="شنیدن تلفظ" className="rounded-full p-2 text-[var(--foreground)]/40 hover:text-[#8b5cf6]">
                      <Volume2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {q.hint && <p className="text-center text-xs text-[var(--foreground)]/50">{q.hint}</p>}

                <div className="grid gap-2">
                  {q.options.map((opt) => {
                    const isAnswer = opt === q.answer;
                    const isPicked = opt === picked;
                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={!!picked}
                        onClick={() => choose(opt)}
                        dir={q.optionsAreIraqi ? "rtl" : undefined}
                        className={cn(
                          "rounded-xl border px-4 py-3 text-base transition",
                          !picked && "border-[var(--border-color)] hover:border-[#8b5cf6]",
                          picked && isAnswer && "border-[#10b981] bg-[#10b981]/15 text-[#10b981]",
                          picked && isPicked && !isAnswer && "border-red-400 bg-red-500/10 text-red-400",
                          picked && !isAnswer && !isPicked && "border-[var(--border-color)] opacity-50"
                        )}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {picked && (
                  <div className="space-y-3">
                    <div className={cn("rounded-xl p-3 text-sm", picked === q.answer ? "bg-[#10b981]/10 text-[#10b981]" : "bg-red-500/10 text-red-400")}>
                      {picked === q.answer ? "درست بود! " : "پاسخ درست: "}
                      <b dir="rtl">{q.word.iq}</b> = {q.word.fa}
                    </div>
                    <Button className="w-full" onClick={() => { setPicked(null); setI((x) => x + 1); }}>
                      {i + 1 === qs.length ? "دیدن نتیجه" : "سؤال بعد"}
                    </Button>
                  </div>
                )}
              </Card>
            </>
          )}

          {s && done && (
            <Card className="space-y-4 text-center">
              <div className="text-4xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "💪"}</div>
              <p className="text-xl font-bold text-[var(--foreground)]">
                {toPersianNumber(score)} از {toPersianNumber(qs.length)} ({toPersianNumber(pct)}٪)
              </p>
              <p className="text-sm text-[var(--foreground)]/60">
                {pct >= 80 ? "عالی! آماده‌اید با مربی تمرین کنید." : "یک بار دیگر مرور واژه‌ها را ببینید و دوباره امتحان کنید."}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button variant="glass" onClick={restart}>
                  <RotateCcw className="h-4 w-4" /> آزمون دوباره
                </Button>
                <Link href={`/learn/scenario/${scenarioId}/review`}>
                  <Button variant="glass">مرور واژه‌ها</Button>
                </Link>
                <Link href={`/learn/scenario/${scenarioId}`}>
                  <Button>تمرین با مربی</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
