"use client";

import { useState, use } from "react";
import { usePublicSpeech, useAddComment } from "@/features/share/hooks";
import { getScoreColor, getScoreLabel, tDimension, DIMENSION_ICONS, type DimensionKey } from "@/features/practice/constants";
import { Mic2, Send, MessageCircle, AlertCircle } from "lucide-react";

/**
 * صفحه‌ی عمومیِ بازخورد همتا — بدون نیاز به ورود.
 * هیچ داده‌ی شناسایی‌کننده کاربر (ایمیل/شناسه) اینجا نمایش داده نمی‌شود.
 */
export default function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data, isLoading, isError } = usePublicSpeech(token);
  const addComment = useAddComment(token);

  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!authorName.trim() || !content.trim()) {
      setFormError("نام و متن بازخورد را وارد کنید.");
      return;
    }
    try {
      await addComment.mutateAsync({ author_name: authorName.trim(), content: content.trim() });
      setContent("");
    } catch {
      setFormError("ثبت بازخورد ممکن نشد. دوباره تلاش کنید.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white/70">
        در حال بارگذاری…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#0b0f1a] text-white/70 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p>این لینک اشتراک‌گذاری یافت نشد یا دیگر معتبر نیست.</p>
      </div>
    );
  }

  const score = data.overall_score ?? 0;
  const scoreColor = getScoreColor(score);
  const dimensionEntries = Object.entries(data.dimension_scores ?? {});

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
        <header className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#10b981] flex items-center justify-center">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold">خطیب — بازخورد همتا</h1>
            <p className="text-xs text-white/50">این صفحه عمومی و فقط‌خواندنی است؛ هویت صاحب تمرین نمایش داده نمی‌شود.</p>
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-xl font-bold mb-1">{data.topic_label || "تمرین سخنرانی"}</h2>
          {data.overall_score !== null && (
            <div className="flex items-center gap-3 mt-3">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: `${scoreColor}22`, color: scoreColor, border: `2px solid ${scoreColor}` }}
              >
                {score}
              </div>
              <span className="text-sm text-white/70">{getScoreLabel(score, "fa")}</span>
            </div>
          )}

          {dimensionEntries.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
              {dimensionEntries.map(([key, value]) => (
                <div key={key} className="rounded-xl bg-white/5 border border-white/10 p-3">
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <span>{DIMENSION_ICONS[key] ?? "•"}</span>
                    <span>{tDimension(key as DimensionKey, "fa")}</span>
                  </div>
                  <div className="text-lg font-bold mt-1">{value}</div>
                </div>
              ))}
            </div>
          )}

          {(data.transcript || data.input_text) && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-white/70 mb-2">متن</h3>
              <p className="text-sm leading-7 text-white/80 whitespace-pre-wrap">
                {data.transcript || data.input_text}
              </p>
            </div>
          )}

          {data.strengths && data.strengths.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-2">نقاط قوت</h3>
              <ul className="text-sm text-white/80 list-disc pr-5 space-y-1">
                {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {data.improvements && data.improvements.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-2">پیشنهادهای بهبود</h3>
              <ul className="text-sm text-white/80 list-disc pr-5 space-y-1">
                {data.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
            <MessageCircle className="w-4 h-4" />
            بازخورد همتا ({data.comments.length})
          </h3>

          <div className="flex flex-col gap-3 mb-5">
            {data.comments.length === 0 && (
              <p className="text-sm text-white/40">هنوز بازخوردی ثبت نشده — اولین نفر باشید.</p>
            )}
            {data.comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-white/5 border border-white/10 p-3">
                <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                  <span className="font-medium text-white/80">{c.author_name}</span>
                  <span>{new Date(c.created_at).toLocaleDateString("fa-IR")}</span>
                </div>
                <p className="text-sm text-white/80 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
            <input
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="نام شما"
              maxLength={100}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-[#8b5cf6]"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="بازخورد خود را بنویسید…"
              maxLength={2000}
              rows={3}
              className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm outline-none focus:border-[#8b5cf6] resize-none"
            />
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            <button
              type="submit"
              disabled={addComment.isPending}
              className="self-start flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#10b981] px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {addComment.isPending ? "در حال ارسال…" : "ارسال بازخورد"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
