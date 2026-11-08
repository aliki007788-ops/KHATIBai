"use client";

import { use, useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useStartScenario } from "@/features/learning/hooks";
import { CATEGORY_FA, DIFFICULTY_FA, STATUS_FA, useScenarioDetail } from "@/features/learning/iraqi";
import { toPersianNumber } from "@/lib/utils/number";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Globe2, Play, Target, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tab = "goals" | "vocab" | "dialogue" | "mistakes" | "culture";

const TABS: { id: Tab; label: string }[] = [
  { id: "goals", label: "هدف‌ها" },
  { id: "vocab", label: "واژگان" },
  { id: "dialogue", label: "دیالوگ نمونه" },
  { id: "mistakes", label: "اشتباه‌های رایج" },
  { id: "culture", label: "نکته‌ی فرهنگی" },
];

/** تلفظ با موتور گفتار مرورگر (اگر صدای عربی نصب باشد). */
function speak(text: string) {
  try {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const v = voices.find((x) => x.lang.toLowerCase().startsWith("ar-iq")) ?? voices.find((x) => x.lang.toLowerCase().startsWith("ar"));
    if (v) u.voice = v;
    u.lang = v?.lang ?? "ar-SA";
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  } catch {
    /* بی‌صدا نادیده گرفته می‌شود */
  }
}

function SpeakBtn({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => speak(text)}
      aria-label="شنیدن تلفظ"
      className="shrink-0 rounded-lg p-1.5 text-[var(--foreground)]/40 transition hover:bg-[var(--foreground)]/10 hover:text-[#8b5cf6]"
    >
      <Volume2 className="h-4 w-4" />
    </button>
  );
}

export default function ScenarioDetailPage({ params }: { params: Promise<{ scenarioId: string }> }) {
  const { scenarioId } = use(params);
  const { data: s, isLoading, isError, refetch } = useScenarioDetail(scenarioId);
  const start = useStartScenario();
  const [tab, setTab] = useState<Tab>("goals");

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <Link
            href={s ? `/learn/${s.level_id}` : "/learn"}
            className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
          >
            <ArrowRight className="h-4 w-4" /> {s ? s.level_name_fa : "مسیر یادگیری"}
          </Link>

          {isLoading && <Skeleton className="h-64" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {s && (
            <>
              <Card>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--foreground)]/50">
                  <span className="rounded-full bg-[#8b5cf6]/10 px-2 py-0.5 text-[#8b5cf6]">{s.level_name_fa}</span>
                  <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5">{CATEGORY_FA[s.category] ?? s.category}</span>
                  {s.difficulty && <span className="rounded-full bg-[var(--foreground)]/5 px-2 py-0.5">{DIFFICULTY_FA[s.difficulty]}</span>}
                  {s.estimated_minutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {toPersianNumber(s.estimated_minutes)} دقیقه
                    </span>
                  )}
                  <span>{STATUS_FA[s.status]}</span>
                </div>
                <h1 className="mt-3 text-2xl font-bold text-[var(--foreground)]">{s.title_fa}</h1>
                {s.title_iq && (
                  <p className="mt-1 flex items-center gap-2 text-lg text-[#10b981]" dir="rtl">
                    {s.title_iq} <SpeakBtn text={s.title_iq} />
                  </p>
                )}
                <p className="mt-3 text-sm leading-7 text-[var(--foreground)]/75">{s.situation}</p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button loading={start.isPending} disabled={!s.unlocked} onClick={() => start.mutate(s.id)}>
                    <Play className="h-4 w-4" /> {s.status === "not_started" ? "شروع تمرین با مربی" : "ادامه‌ی تمرین"}
                  </Button>
                  {!s.unlocked && <span className="text-xs text-amber-500">ابتدا سناریوهای قبلی را تکمیل کنید</span>}
                  <span className="text-xs text-[var(--foreground)]/50">
                    برای تکمیل حداقل {toPersianNumber(s.min_messages_to_complete)} پیام به مربی بفرستید
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--border-color)] pt-3">
                  <Link href={`/learn/scenario/${s.id}/review`}>
                    <Button variant="glass" size="sm">🃏 مرور واژه‌ها (کارت)</Button>
                  </Link>
                  <Link href={`/learn/scenario/${s.id}/quiz`}>
                    <Button variant="glass" size="sm">📝 آزمون ۸ سؤالی</Button>
                  </Link>
                </div>
              </Card>

              <div className="flex gap-1 overflow-x-auto rounded-xl border border-[var(--border-color)] p-1 text-sm">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "shrink-0 rounded-lg px-4 py-2 transition",
                      tab === t.id ? "bg-[#8b5cf6] text-white" : "text-[var(--foreground)]/60 hover:bg-[var(--foreground)]/5"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tab === "goals" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                      <Target className="h-4 w-4 text-[#8b5cf6]" /> بعد از این سناریو می‌توانید
                    </h2>
                    <ul className="space-y-2 text-sm text-[var(--foreground)]/75">
                      {s.objectives.map((o, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#8b5cf6]">•</span> {o}
                        </li>
                      ))}
                    </ul>
                  </Card>
                  <Card>
                    <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                      <CheckCircle2 className="h-4 w-4 text-[#10b981]" /> معیار موفقیت
                    </h2>
                    <ul className="space-y-2 text-sm text-[var(--foreground)]/75">
                      {s.success_criteria.map((o, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-[#10b981]">✓</span> {o}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              )}

              {tab === "vocab" && (
                <div className="grid gap-3 md:grid-cols-2">
                  {s.key_vocabulary.map((v, i) => (
                    <Card key={i} className="!p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-lg font-bold text-[var(--foreground)]" dir="rtl">
                            {v.iq}
                          </div>
                          <div className="text-sm text-[#10b981]">{v.fa}</div>
                        </div>
                        <SpeakBtn text={v.iq} />
                      </div>
                      {v.example_iq && (
                        <div className="mt-3 rounded-lg bg-[var(--foreground)]/5 p-2.5 text-sm">
                          <div className="flex items-start justify-between gap-2" dir="rtl">
                            <span className="text-[var(--foreground)]">{v.example_iq}</span>
                            <SpeakBtn text={v.example_iq} />
                          </div>
                          {v.example_fa && <div className="mt-1 text-xs text-[var(--foreground)]/55">{v.example_fa}</div>}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {tab === "dialogue" && (
                <Card>
                  <p className="mb-4 text-xs text-[var(--foreground)]/50">
                    اول دیالوگ را بخوانید و گوش دهید؛ بعد با مربی همین موقعیت را با جمله‌های خودتان تمرین کنید.
                  </p>
                  <div className="space-y-3">
                    {s.model_dialogue.map((t, i) => {
                      const you = t.who === "شما";
                      return (
                        <div key={i} className={cn("max-w-[88%] rounded-2xl px-4 py-3", you ? "mr-auto bg-[#8b5cf6]/12" : "ml-auto bg-[var(--foreground)]/5")}>
                          <div className="mb-1 text-[11px] font-medium text-[var(--foreground)]/45">{t.who}</div>
                          <div className="flex items-start justify-between gap-2" dir="rtl">
                            <span className="text-[15px] leading-7 text-[var(--foreground)]">{t.iq}</span>
                            <SpeakBtn text={t.iq} />
                          </div>
                          <div className="mt-1 text-xs leading-6 text-[var(--foreground)]/55">{t.fa}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {tab === "mistakes" && (
                <Card>
                  <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> اشتباه‌های رایج فارسی‌زبان‌ها در این موقعیت
                  </h2>
                  <ul className="space-y-3 text-sm leading-7 text-[var(--foreground)]/75">
                    {s.common_mistakes.map((m, i) => (
                      <li key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                        {m}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              {tab === "culture" && (
                <Card>
                  <h2 className="mb-3 flex items-center gap-2 font-semibold text-[var(--foreground)]">
                    <Globe2 className="h-4 w-4 text-[#3b82f6]" /> نکته‌ی فرهنگی
                  </h2>
                  <p className="text-sm leading-8 text-[var(--foreground)]/75">{s.cultural_note ?? "—"}</p>
                </Card>
              )}
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
