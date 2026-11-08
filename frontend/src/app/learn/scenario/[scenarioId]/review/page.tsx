"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useScenarioDetail } from "@/features/learning/iraqi";
import { getMissed, setMissed, shuffle } from "@/features/learning/practice";
import { speak } from "@/features/speech/speak";
import { toPersianNumber } from "@/lib/utils/number";
import { ArrowRight, Check, RotateCcw, Volume2, X } from "lucide-react";

export default function ReviewPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const { data: s, isLoading, isError, refetch } = useScenarioDetail(scenarioId);

  const [mode, setMode] = useState<"all" | "missed">("all");
  const [deck, setDeck] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [unknown, setUnknown] = useState<number[]>([]);
  const [known, setKnown] = useState(0);
  const [missedWords, setMissedWords] = useState<string[]>([]);

  const vocab = useMemo(() => s?.key_vocabulary ?? [], [s]);

  const startDeck = (m: "all" | "missed", missed: string[]) => {
    const idx = vocab.map((_, i) => i).filter((i) => m === "all" || missed.includes(vocab[i].iq));
    setDeck(shuffle(idx));
    setPos(0);
    setFlipped(false);
    setUnknown([]);
    setKnown(0);
    setMode(m);
  };

  useEffect(() => {
    if (!s) return;
    const missed = getMissed(s.id);
    setMissedWords(missed);
    startDeck("all", missed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.id]);

  const finished = deck.length > 0 && pos >= deck.length;
  const cur = !finished && deck.length ? vocab[deck[pos]] : null;

  const answer = (knew: boolean) => {
    if (!cur || !s) return;
    const word = cur.iq;
    let next = missedWords;
    if (knew) {
      setKnown((k) => k + 1);
      next = missedWords.filter((w) => w !== word);
    } else {
      setUnknown((u) => [...u, deck[pos]]);
      next = Array.from(new Set([...missedWords, word]));
    }
    setMissedWords(next);
    setMissed(s.id, next);
    setFlipped(false);
    setPos((p) => p + 1);
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

          {s && (
            <>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">مرور واژه‌ها</h1>
                <p className="text-sm text-[var(--foreground)]/60">{s.title_fa}</p>
              </div>

              {missedWords.length > 0 && mode === "all" && !finished && (
                <button
                  onClick={() => startDeck("missed", missedWords)}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-start text-sm text-amber-500"
                >
                  فقط {toPersianNumber(missedWords.length)} واژه‌ی مشکل‌دار قبلی را مرور کن ←
                </button>
              )}

              {cur && (
                <>
                  <div className="text-center text-xs text-[var(--foreground)]/50">
                    {toPersianNumber(pos + 1)} از {toPersianNumber(deck.length)}
                    {mode === "missed" && " · واژه‌های مشکل‌دار"}
                  </div>
                  <Card
                    className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-4 text-center"
                    onClick={() => setFlipped((f) => !f)}
                  >
                    {!flipped ? (
                      <>
                        <div className="text-4xl font-bold text-[var(--foreground)]" dir="rtl">{cur.iq}</div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speak(cur.iq);
                          }}
                          aria-label="شنیدن تلفظ"
                          className="rounded-full p-2 text-[var(--foreground)]/40 hover:bg-[var(--foreground)]/10 hover:text-[#8b5cf6]"
                        >
                          <Volume2 className="h-5 w-5" />
                        </button>
                        <p className="text-xs text-[var(--foreground)]/40">برای دیدن معنی کلیک کنید</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl font-bold text-[#10b981]">{cur.fa}</div>
                        {cur.example_iq && (
                          <div className="mt-2 rounded-xl bg-[var(--foreground)]/5 p-3 text-sm">
                            <div className="text-[var(--foreground)]" dir="rtl">{cur.example_iq}</div>
                            {cur.example_fa && <div className="mt-1 text-xs text-[var(--foreground)]/55">{cur.example_fa}</div>}
                          </div>
                        )}
                      </>
                    )}
                  </Card>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="glass" onClick={() => answer(false)} disabled={!flipped}>
                      <X className="h-4 w-4 text-red-400" /> هنوز نه
                    </Button>
                    <Button onClick={() => answer(true)} disabled={!flipped}>
                      <Check className="h-4 w-4" /> بلدم
                    </Button>
                  </div>
                  {!flipped && <p className="text-center text-xs text-[var(--foreground)]/40">اول معنی را در ذهن بگویید، بعد کارت را بچرخانید.</p>}
                </>
              )}

              {finished && (
                <Card className="space-y-4 text-center">
                  <div className="text-3xl">{unknown.length === 0 ? "🎉" : "💪"}</div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {toPersianNumber(known)} واژه بلد بودید، {toPersianNumber(unknown.length)} واژه نیاز به مرور دارد.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    {unknown.length > 0 && (
                      <Button onClick={() => startDeck("missed", unknown.map((i) => vocab[i].iq))}>
                        <RotateCcw className="h-4 w-4" /> مرور واژه‌های ناآشنا
                      </Button>
                    )}
                    <Link href={`/learn/scenario/${scenarioId}/quiz`}>
                      <Button variant={unknown.length ? "glass" : "primary"}>آزمون این سناریو</Button>
                    </Link>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
