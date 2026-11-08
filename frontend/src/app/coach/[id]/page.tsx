"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useConversation, useSendMessage, useDeleteConversation } from "@/features/chat/hooks";
import { useConversationScenario, useFinishScenario } from "@/features/learning/iraqi";
import { useSpeechToText } from "@/features/speech/useSpeechToText";
import { toPersianNumber } from "@/lib/utils/number";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, Mic, Send, Square, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function CoachChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useConversation(id);
  const { data: scenario } = useConversationScenario(id);
  const finish = useFinishScenario();
  const send = useSendMessage(id);
  const del = useDeleteConversation();

  const [text, setText] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // تشخیص گفتار: متن را در کادر می‌گذارد تا کاربر قبل از ارسال ببیند و ویرایش کند
  const stt = useSpeechToText((t) => setText(t), "ar-IQ");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length, send.isPending]);

  const userCount = data?.messages?.filter((m) => m.role === "user").length ?? 0;
  const need = scenario?.min_messages_to_complete ?? 0;
  const canFinish = !!scenario && scenario.status !== "completed" && userCount >= need;

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || send.isPending) return;
    if (stt.isListening) stt.stop();
    send.mutate(t, { onSuccess: () => setText("") });
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link
              href={scenario ? `/learn/scenario/${scenario.id}` : "/coach"}
              className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
            >
              <ArrowRight className="h-4 w-4" /> {scenario ? "مشاهده‌ی سناریو" : "گفتگوها"}
            </Link>
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-semibold text-[var(--foreground)]">
                {scenario?.title_fa || data?.title || "مربی AI"}
              </h1>
              <Button
                variant="ghost"
                size="sm"
                loading={del.isPending}
                onClick={() => {
                  if (confirm("این گفتگو حذف شود؟")) del.mutate(id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>

          {scenario && (
            <div className="mb-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg-solid)]">
              <button
                type="button"
                onClick={() => setPanelOpen((v) => !v)}
                className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 font-medium text-[var(--foreground)]">
                  <BookOpen className="h-4 w-4 text-[#8b5cf6]" /> راهنمای سناریو
                </span>
                <span className="flex items-center gap-3 text-xs text-[var(--foreground)]/55">
                  <span>
                    پیام‌های شما: {toPersianNumber(Math.min(userCount, need))} / {toPersianNumber(need)}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition", panelOpen && "rotate-180")} />
                </span>
              </button>
              {panelOpen && (
                <div className="space-y-3 border-t border-[var(--border-color)] px-4 py-3 text-sm">
                  <p className="leading-7 text-[var(--foreground)]/70">{scenario.situation}</p>
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-[var(--foreground)]/50">هدف‌ها</div>
                    <ul className="space-y-1 text-[var(--foreground)]/75">
                      {scenario.objectives.map((o, i) => (
                        <li key={i}>• {o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="mb-1.5 text-xs font-medium text-[var(--foreground)]/50">واژه‌های کلیدی (کلیک = گذاشتن در کادر پیام)</div>
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.key_vocabulary.slice(0, 10).map((v, i) => (
                        <button
                          key={i}
                          type="button"
                          title={v.fa}
                          onClick={() => setText((t) => (t ? `${t} ${v.iq}` : v.iq))}
                          className="rounded-full border border-[var(--border-color)] px-2.5 py-1 text-xs hover:border-[#8b5cf6]"
                          dir="rtl"
                        >
                          {v.iq} <span className="text-[var(--foreground)]/45">· {v.fa}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {(stt.error) && (
            <div className="mb-3 rounded-xl border border-red-300/40 bg-red-500/10 p-3 text-sm text-red-500">{stt.error}</div>
          )}

          {isLoading && <Skeleton className="w-full flex-1" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] p-4">
                {data.messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-[var(--foreground)]/40">
                    پیام خود را بنویسید یا دکمه‌ی میکروفون را بزنید و به عراقی حرف بزنید
                  </p>
                )}
                {data.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-7",
                      m.role === "user"
                        ? "mr-auto bg-[#8b5cf6] text-white"
                        : "ml-auto bg-[var(--foreground)]/8 text-[var(--foreground)]"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {send.isPending && (
                  <div className="ml-auto flex max-w-[85%] items-center gap-2 rounded-2xl bg-[var(--foreground)]/8 px-4 py-2.5">
                    <Spinner size="sm" />
                    <span className="text-xs text-[var(--foreground)]/55">مربی در حال پاسخ...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {canFinish && (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 text-[#10b981]">
                    <CheckCircle2 className="h-4 w-4" /> تمرین کافی انجام شد؛ می‌توانید سناریو را تکمیل کنید.
                  </span>
                  <Button
                    size="sm"
                    loading={finish.isPending}
                    onClick={() =>
                      scenario &&
                      finish.mutate(scenario.id, { onSuccess: () => router.push(`/learn/${scenario.level_id}`) })
                    }
                  >
                    تکمیل سناریو
                  </Button>
                </div>
              )}

              <form onSubmit={onSend} className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={stt.isListening ? "primary" : "glass"}
                  onClick={stt.isListening ? stt.stop : stt.start}
                  disabled={send.isPending || stt.isTranscribing || !stt.supported}
                  title={stt.supported ? "حرف زدن (عربی عراقی)" : "مرورگر شما ضبط صدا ندارد؛ از Chrome یا Edge استفاده کنید"}
                  className={cn("shrink-0 rounded-xl px-4", stt.isListening && "animate-pulse !bg-red-500 hover:!bg-red-600")}
                >
                  {stt.isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={stt.isTranscribing ? "در حال تبدیل صدا به متن..." : stt.isListening ? "در حال گوش دادن... (برای پایان دوباره دکمه را بزنید)" : "جمله‌ی عراقی‌تان را بنویسید..."}
                  className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[#8b5cf6]"
                  disabled={send.isPending}
                />
                <Button type="submit" loading={send.isPending} disabled={!text.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
