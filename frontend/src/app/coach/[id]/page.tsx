"use client";

import { use, useEffect, useRef, useState } from "react";
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
import { useVoiceRecorder } from "@/features/speech/useVoiceRecorder"; // هوک جدید
import Link from "next/link";
import { ArrowRight, Send, Trash2, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils/cn";

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
  const bottomRef = useRef<HTMLDivElement>(null);

  // استفاده از هوک اختصاصی ضبط صدا
  const { isRecording, error: micError, startRecording, stopRecording } = useVoiceRecorder(
    (blob) => {
      // پس از ضبط، به جای ارسال فایل، فعلاً یک پیام متنی به چت می‌فرستیم
      // در آینده می‌توانید اینجا فایل را به API بک‌اند ارسال کنید
      send.mutate("🎤 [پیام صوتی ضبط شد]");
    }
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length, send.isPending]);

  const onSend = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || send.isPending || isRecording) return;
    send.mutate(t, { onSuccess: () => setText("") });
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
          <div className="mb-3 flex items-center justify-between">
            <Link
              href="/coach"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <ArrowRight className="h-4 w-4" /> گفتگوها
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-gray-900">
                {data?.title || "مربی AI"}
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

          {/* نمایش خطای میکروفون (در صورت وجود) */}
          {micError && (
            <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {micError}
            </div>
          )}

          {isLoading && <Skeleton className="flex-1 w-full" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4">
                {data.messages.length === 0 && (
                  <p className="py-10 text-center text-sm text-gray-400">
                    پیام خود را بنویسید یا دکمه میکروفون را بزنید
                  </p>
                )}
                {data.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "mr-auto bg-blue-600 text-white"
                        : "ml-auto bg-gray-100 text-gray-800"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {send.isPending && (
                  <div className="ml-auto flex max-w-[85%] items-center gap-2 rounded-2xl bg-gray-100 px-4 py-2.5">
                    <Spinner size="sm" />
                    <span className="text-xs text-gray-500">در حال پاسخ...</span>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={onSend} className="mt-3 flex gap-2">
                <Button
                  type="button"
                  variant={isRecording ? "primary" : "glass"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={send.isPending}
                  className={cn(
                    "shrink-0 rounded-xl px-4",
                    isRecording && "bg-red-500 hover:bg-red-600 animate-pulse"
                  )}
                >
                  {isRecording ? (
                    <Square className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </Button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  disabled={send.isPending || isRecording}
                />
                <Button
                  type="submit"
                  loading={send.isPending}
                  disabled={!text.trim() || isRecording}
                >
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