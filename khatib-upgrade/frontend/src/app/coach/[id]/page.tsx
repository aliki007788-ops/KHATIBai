"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import {
  useConversation,
  useSendMessage,
  useDeleteConversation,
} from "@/features/chat/hooks";
import Link from "next/link";
import {
  ArrowRight,
  Send,
  Trash2,
  Mic,
  Square,
  Volume2,
  VolumeX,
  BookOpen,
  Sparkles,
  AlertCircle,
  Lightbulb,
  Library,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CoachFeedback } from "@/types/chat";

function parseFeedbackFromContent(content: string): CoachFeedback {
  const corrections: string[] = [];
  const suggestions: string[] = [];
  const vocabulary: string[] = [];
  let notes: string | null = null;

  const corrMatch = content.match(/📝\s*اصلاحات:\s*([\s\S]*?)(?=\n\n✨|\n\n📚|\n\n💡|$)/);
  if (corrMatch) {
    corrections.push(
      ...corrMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean)
    );
  }
  const sugMatch = content.match(/✨\s*پیشنهادها:\s*([\s\S]*?)(?=\n\n📚|\n\n💡|$)/);
  if (sugMatch) {
    suggestions.push(
      ...sugMatch[1]
        .split("\n")
        .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
        .filter(Boolean)
    );
  }
  const vocabMatch = content.match(/📚\s*واژگان:\s*([^\n]+)/);
  if (vocabMatch) {
    vocabulary.push(
      ...vocabMatch[1]
        .split(/[·|,،]/)
        .map((s) => s.trim())
        .filter(Boolean)
    );
  }
  const notesMatch = content.match(/💡\s*(.+)$/m);
  if (notesMatch) notes = notesMatch[1].trim();

  return { corrections, suggestions, vocabulary, notes };
}

function stripFeedbackFromContent(content: string): string {
  return content
    .replace(/\n\n📝\s*اصلاحات:[\s\S]*$/, "")
    .replace(/\n\n✨\s*پیشنهادها:[\s\S]*$/, "")
    .replace(/\n\n📚\s*واژگان:[\s\S]*$/, "")
    .replace(/\n\n💡[\s\S]*$/, "")
    .trim();
}

function FeedbackPanel({ feedback }: { feedback: CoachFeedback }) {
  const has =
    feedback.corrections.length > 0 ||
    feedback.suggestions.length > 0 ||
    feedback.vocabulary.length > 0 ||
    !!feedback.notes;
  if (!has) return null;

  return (
    <div className="mt-2 space-y-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] p-3">
      {feedback.corrections.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-500">
            <AlertCircle className="h-3.5 w-3.5" />
            اصلاحات
          </div>
          <ul className="space-y-1">
            {feedback.corrections.map((c, i) => (
              <li key={i} className="text-xs leading-relaxed text-[var(--foreground)]/75">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.suggestions.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[var(--primary)]">
            <Lightbulb className="h-3.5 w-3.5" />
            پیشنهاد بهتر
          </div>
          <ul className="space-y-1">
            {feedback.suggestions.map((s, i) => (
              <li key={i} className="text-xs leading-relaxed text-[var(--foreground)]/75">
                • {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {feedback.vocabulary.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
            <Library className="h-3.5 w-3.5" />
            واژگان عراقی
          </div>
          <div className="flex flex-wrap gap-1.5">
            {feedback.vocabulary.map((v, i) => (
              <span
                key={i}
                className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-600 dark:text-emerald-400"
              >
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
      {feedback.notes && (
        <p className="text-[11px] leading-relaxed text-[var(--foreground)]/55">
          💡 {feedback.notes}
        </p>
      )}
    </div>
  );
}

type SpeechRecognitionType = typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : any;

export default function CoachChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useConversation(id);
  const send = useSendMessage(id);
  const del = useDeleteConversation();

  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [micError, setMicError] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<CoachFeedback | null>(null);
  const [latestFeedbackMsgId, setLatestFeedbackMsgId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const lastSpokenIdRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep ref in sync
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length, send.isPending, interimText]);

  // Speak text with browser TTS
  const speak = useCallback(
    (content: string) => {
      if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(content);
      // Prefer Arabic/Iraqi-like voice if available, else Persian, else default
      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => v.lang.startsWith("ar")) ||
        voices.find((v) => v.lang.startsWith("fa")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utter.voice = preferred;
      utter.lang = preferred?.lang || "ar-IQ";
      utter.rate = 0.92;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => {
        setIsSpeaking(false);
        // Resume listening if still active
        if (isListeningRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch {
            /* already started */
          }
        }
      };
      utter.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    },
    [ttsEnabled]
  );

  // Auto-speak new assistant messages
  useEffect(() => {
    if (!data?.messages?.length || !ttsEnabled) return;
    const last = data.messages[data.messages.length - 1];
    if (
      last &&
      (last.role === "assistant" || last.role === "coach") &&
      last.id !== lastSpokenIdRef.current
    ) {
      lastSpokenIdRef.current = last.id;
      speak(last.content);
    }
  }, [data?.messages, ttsEnabled, speak]);

  // Setup SpeechRecognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicError("مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. از Chrome استفاده کنید.");
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fa-IR"; // user speaks Persian; coach teaches Iraqi

    recognition.onresult = (event: any) => {
      let interim = "";
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) setInterimText(interim);
      if (finalText.trim()) {
        setInterimText("");
        setText((prev) => (prev ? prev + " " + finalText.trim() : finalText.trim()));
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === "not-allowed") {
        setMicError("دسترسی میکروفون مسدود است. از تنظیمات مرورگر اجازه دهید.");
        setIsListening(false);
      } else if (event.error === "no-speech") {
        // ignore
      } else if (event.error !== "aborted") {
        setMicError("خطای تشخیص گفتار: " + event.error);
      }
    };

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening and not speaking
      if (isListeningRef.current && !window.speechSynthesis?.speaking) {
        try {
          recognition.start();
        } catch {
          /* ignore */
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const toggleListening = () => {
    setMicError(null);
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
      setInterimText("");
    } else {
      // Stop TTS when user starts speaking
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      isListeningRef.current = true;
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch {
        setMicError("نتوانست میکروفون را شروع کند. دوباره تلاش کنید.");
        setIsListening(false);
      }
    }
  };

  const onSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    const t = (text || interimText).trim();
    if (!t || send.isPending) return;

    // Pause listening while sending
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* ignore */
      }
    }

    send.mutate(t, {
      onSuccess: (msg: any) => {
        setText("");
        setInterimText("");
        if (msg && (msg.corrections || msg.suggestions || msg.vocabulary || msg.notes)) {
          setLatestFeedback({
            corrections: msg.corrections || [],
            suggestions: msg.suggestions || [],
            vocabulary: msg.vocabulary || [],
            notes: msg.notes || null,
          });
          setLatestFeedbackMsgId(msg.id);
        } else if (msg?.content) {
          const parsed = parseFeedbackFromContent(msg.content);
          setLatestFeedback(parsed);
          setLatestFeedbackMsgId(msg.id);
        }
        if (isListeningRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch {
              /* ignore */
            }
          }, 400);
        }
      },
    });
  };

  // Send interim+text on Enter handled by form

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex h-[calc(100vh-7.5rem)] max-w-2xl flex-col">
          {/* Header */}
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link
              href="/learn"
              className="flex items-center gap-1.5 text-sm text-[var(--foreground)]/50 transition hover:text-[var(--foreground)]"
            >
              <ArrowRight className="h-4 w-4" />
              مسیر یادگیری
            </Link>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTtsEnabled((v) => {
                    if (v) window.speechSynthesis?.cancel();
                    return !v;
                  });
                }}
                title={ttsEnabled ? "خاموش کردن صدای مربی" : "روشن کردن صدای مربی"}
              >
                {ttsEnabled ? (
                  <Volume2 className="h-4 w-4 text-[var(--primary)]" />
                ) : (
                  <VolumeX className="h-4 w-4 text-[var(--foreground)]/40" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                loading={del.isPending}
                onClick={() => {
                  if (confirm("این گفتگو حذف شود؟")) del.mutate(id);
                }}
              >
                <Trash2 className="h-4 w-4 text-[var(--foreground)]/40" />
              </Button>
            </div>
          </div>

          {/* Title bar */}
          <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)]/15 text-[var(--primary)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-sm font-semibold text-[var(--foreground)]">
                {data?.title || "جلسه تمرین با مربی"}
              </h1>
              <p className="text-[11px] text-[var(--foreground)]/45">
                صحبت کنید یا بنویسید — مربی هم متنی و هم صوتی پاسخ می‌دهد
              </p>
            </div>
            {isSpeaking && (
              <span className="flex items-center gap-1.5 rounded-full bg-[var(--primary)]/10 px-2.5 py-1 text-[10px] font-medium text-[var(--primary)]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]" />
                در حال صحبت
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)]/50 p-4">
            {isLoading && (
              <div className="space-y-3">
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
                <Skeleton className="mr-auto h-12 w-1/2 rounded-2xl" />
                <Skeleton className="h-20 w-2/3 rounded-2xl" />
              </div>
            )}
            {isError && <ErrorState onRetry={() => refetch()} />}

            {data && (
              <div className="space-y-3">
                {data.messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)]">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        آماده شروع هستید
                      </p>
                      <p className="mt-1 max-w-xs text-xs text-[var(--foreground)]/50">
                        دکمه میکروفون را بزنید و صحبت کنید، یا پیام بنویسید. مربی به شما بازخورد می‌دهد.
                      </p>
                    </div>
                  </div>
                )}

                {data.messages.map((m) => {
                  const isUser = m.role === "user";
                  const clean = isUser ? m.content : stripFeedbackFromContent(m.content);
                  const fb =
                    !isUser && m.id === latestFeedbackMsgId && latestFeedback
                      ? latestFeedback
                      : !isUser
                        ? parseFeedbackFromContent(m.content)
                        : null;
                  return (
                    <div key={m.id} className={cn("max-w-[90%]", isUser ? "mr-auto" : "ml-auto")}>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                          isUser
                            ? "bg-[var(--primary)] text-white"
                            : "border border-[var(--border-color)] bg-[var(--card-bg-solid)] text-[var(--foreground)]"
                        )}
                      >
                        {!isUser && (
                          <div className="mb-1 text-[10px] font-semibold text-[var(--primary)]">
                            مربی
                          </div>
                        )}
                        {clean}
                        {!isUser && ttsEnabled && (
                          <button
                            type="button"
                            onClick={() => speak(clean)}
                            className="mt-1.5 flex items-center gap-1 text-[10px] text-[var(--foreground)]/40 transition hover:text-[var(--primary)]"
                          >
                            <Volume2 className="h-3 w-3" />
                            پخش مجدد
                          </button>
                        )}
                      </div>
                      {fb && <FeedbackPanel feedback={fb} />}
                    </div>
                  );
                })}

                {send.isPending && (
                  <div className="ml-auto flex max-w-[85%] items-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] px-4 py-3">
                    <Spinner size="sm" />
                    <span className="text-xs text-[var(--foreground)]/50">
                      مربی در حال فکر کردن...
                    </span>
                  </div>
                )}

                {/* Live interim transcript */}
                {interimText && (
                  <div className="mr-auto max-w-[85%] rounded-2xl border border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 px-4 py-2.5 text-sm text-[var(--foreground)]/60">
                    <span className="mb-1 block text-[10px] font-medium text-[var(--primary)]">
                      در حال شنیدن...
                    </span>
                    {interimText}
                  </div>
                )}

                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Mic error */}
          {micError && (
            <div className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {micError}
            </div>
          )}

          {/* Input bar */}
          <form onSubmit={onSend} className="mt-3 flex items-end gap-2">
            <Button
              type="button"
              variant={isListening ? "primary" : "glass"}
              onClick={toggleListening}
              disabled={send.isPending}
              className={cn(
                "h-12 w-12 shrink-0 rounded-2xl p-0",
                isListening && "animate-pulse bg-red-500 hover:bg-red-600"
              )}
              title={isListening ? "توقف ضبط" : "شروع صحبت با میکروفون"}
            >
              {isListening ? (
                <Square className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  isListening
                    ? "در حال گوش دادن... می‌توانید ادامه دهید یا ارسال کنید"
                    : "پیام بنویسید یا با میکروفون صحبت کنید..."
                }
                className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg-solid)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                disabled={send.isPending}
                style={{ color: "var(--foreground)" }}
              />
              {isListening && (
                <span className="absolute left-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-[10px] text-red-400">
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
                  زنده
                </span>
              )}
            </div>

            <Button
              type="submit"
              loading={send.isPending}
              disabled={!(text.trim() || interimText.trim())}
              className="h-12 w-12 shrink-0 rounded-2xl p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>

          <p className="mt-2 text-center text-[10px] text-[var(--foreground)]/35">
            میکروفون و پاسخ صوتی مربی همزمان کار می‌کنند · از Chrome برای بهترین نتیجه استفاده کنید
          </p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
