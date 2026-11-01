"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { meetingService, type MeetingSession } from "@/features/meeting/meeting.service";
import { Video, ExternalLink, CheckCircle2, ArrowRight } from "lucide-react";

function providerLabel(p: string) {
  if (p === "zoom") return "Zoom";
  if (p === "meet") return "Google Meet";
  return "سایر";
}

export default function MeetingPracticePage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("تمرین سخنرانی آنلاین");
  const [url, setUrl] = useState("");
  const [focus, setFocus] = useState<"general" | "pronunciation">("general");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<MeetingSession | null>(null);

  const { data: sessions } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => meetingService.list(),
  });

  const createMut = useMutation({
    mutationFn: () =>
      meetingService.create({
        title: title.trim() || "جلسه تمرین",
        meeting_url: url.trim(),
        focus,
        notes: notes.trim() || undefined,
      }),
    onSuccess: (row) => {
      setActive(row);
      setError(null);
      qc.invalidateQueries({ queryKey: ["meetings"] });
      window.open(row.meeting_url, "_blank", "noopener,noreferrer");
    },
    onError: () => setError("ثبت جلسه ممکن نشد. آدرس را بررسی کنید."),
  });

  const endMut = useMutation({
    mutationFn: (id: string) => meetingService.end(id, { notes: notes.trim() || undefined }),
    onSuccess: () => {
      setActive(null);
      qc.invalidateQueries({ queryKey: ["meetings"] });
    },
  });

  const start = () => {
    setError(null);
    const u = url.trim();
    if (!u.startsWith("http://") && !u.startsWith("https://")) {
      setError("آدرس باید با https شروع شود (لینک Zoom یا Meet).");
      return;
    }
    createMut.mutate();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-3xl space-y-8 pb-12">
          <div className="flex items-center gap-3">
            <Link href="/practice" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] flex items-center gap-1">
              <ArrowRight className="w-4 h-4" /> استودیو تمرین
            </Link>
          </div>

          <header className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#8b5cf6]/15 text-[#c4b5fd]">
              <Video className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">تمرین با جلسه آنلاین</h1>
              <p className="text-sm text-[var(--foreground)]/60 mt-1">
                لینک Zoom یا Google Meet را وارد کنید، جلسه را باز کنید، بعد از اتمام صوت را در استودیو آپلود کنید تا تحلیل شود.
                اتصال رسمی SDK نیاز به حساب توسعه‌دهنده Zoom/Google دارد؛ این مسیر بدون SDK کار می‌کند.
              </p>
            </div>
          </header>

          <section className="glass-panel rounded-3xl border border-[var(--border-color)] p-6 space-y-4">
            <label className="block text-sm space-y-1">
              <span className="text-[var(--foreground)]/60">عنوان جلسه</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              />
            </label>
            <label className="block text-sm space-y-1">
              <span className="text-[var(--foreground)]/60">لینک Zoom / Meet</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://meet.google.com/... یا https://zoom.us/j/..."
                dir="ltr"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-left"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFocus("general")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  focus === "general" ? "border-[#8b5cf6] bg-[#8b5cf6]/15" : "border-white/10"
                }`}
              >
                تمرین عمومی
              </button>
              <button
                type="button"
                onClick={() => setFocus("pronunciation")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  focus === "pronunciation" ? "border-[#10b981] bg-[#10b981]/15" : "border-white/10"
                }`}
              >
                تمرکز تلفظ
              </button>
            </div>
            <label className="block text-sm space-y-1">
              <span className="text-[var(--foreground)]/60">یادداشت (اختیاری)</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm resize-none"
              />
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <Button onClick={start} disabled={createMut.isPending}>
                {createMut.isPending ? "…" : "شروع و باز کردن جلسه"}
              </Button>
              {active && (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => window.open(active.meeting_url, "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> باز کردن مجدد
                  </Button>
                  <Button variant="secondary" onClick={() => endMut.mutate(active.id)}>
                    پایان جلسه
                  </Button>
                  <Link
                    href={
                      active.focus === "pronunciation"
                        ? "/practice?mode=pronunciation"
                        : "/practice"
                    }
                    className="inline-flex items-center rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
                  >
                    آپلود صوت برای تحلیل
                  </Link>
                </>
              )}
            </div>
          </section>

          {active && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                جلسه «{active.title}» ثبت شد ({providerLabel(active.provider)}).
                بعد از صحبت، فایل صوتی ضبط‌شده را در استودیو تمرین بارگذاری کنید.
              </div>
            </div>
          )}

          <section className="space-y-3">
            <h2 className="font-bold text-lg">جلسات اخیر</h2>
            {!sessions?.length && (
              <p className="text-sm text-[var(--foreground)]/40">هنوز جلسه‌ای ثبت نشده است.</p>
            )}
            <div className="space-y-2">
              {sessions?.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-[var(--foreground)]/50">
                      {providerLabel(s.provider)}
                      {s.focus ? ` · ${s.focus === "pronunciation" ? "تلفظ" : "عمومی"}` : ""}
                      {s.ended_at ? " · پایان‌یافته" : " · باز"}
                    </div>
                  </div>
                  <a
                    href={s.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#8b5cf6] flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> لینک
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
