"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSpeech } from "@/features/speech/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import { 
  ArrowRight, Share2, Printer, Download, RefreshCw, 
  Check, Lightbulb, AlertCircle, CheckCircle2, 
  TrendingUp, FileText
} from "lucide-react";
import {
  type Language,
  type DimensionKey,
  DEFAULT_LANGUAGE,
  t,
  tDimension,
  getScoreLabel,
  getScoreColor,
} from "@/features/practice/constants";

export default function PracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [copied, setCopied] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const { data, isLoading, isError, refetch } = useSpeech(id);

  const isProcessing = data?.status === "pending" || data?.status === "processing";

  const handleShare = async () => {
    const url = window.location.href;
    const text = `${t("shareText", language)}\n${url}`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: t("analysisTitle", language),
          text: text,
          url: url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => window.print();
  const handleRetry = () => router.push("/practice");

  const score = data?.overall_score ?? 0;
  const scoreColor = getScoreColor(score);
  const scoreLabel = getScoreLabel(score, language);
  const dimensions = data?.dimension_scores ?? {};

  const statusText = data ? ({
    pending: t("pending", language),
    processing: t("processing", language),
    completed: t("completed", language),
    failed: t("failed", language),
  }[data.status] ?? data.status) : "";

  return (
    <AuthGuard>
      <AppShell>
        {/* پس‌زمینه انتزاعی */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden print:hidden">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#8b5cf6] rounded-full filter blur-[200px] opacity-20" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#10b981] rounded-full filter blur-[200px] opacity-15" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">
          
          {/* هدر */}
          <div className="flex items-center justify-between gap-4 print:hidden">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              {t("back", language)}
            </button>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="glass-panel px-3 py-2 rounded-lg text-sm bg-transparent border border-white/10"
            >
              <option value="fa">فارسی</option>
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* عنوان */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#60a5fa]">
              {t("analysisTitle", language)}
            </h1>
            <p className="text-sm text-[var(--foreground)]/50">
              {data?.topic_label || t("analysisSubtitle", language)} · {statusText}
            </p>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {isError && (
            <div className="glass-panel p-8 rounded-[2rem] text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">{t("noData", language)}</h2>
              <Button onClick={() => refetch()} className="mt-4">
                <RefreshCw className="w-4 h-4" /> {t("retry", language)}
              </Button>
            </div>
          )}

          {data && (
            <>
              {/* دایره امتیاز */}
              {isProcessing ? (
                <div className="glass-panel p-12 rounded-[2rem] text-center">
                  <div className="animate-spin w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-sm text-[var(--foreground)]/60">{t("analyzing", language)}</p>
                </div>
              ) : (
                <div className="glass-panel p-8 md:p-12 rounded-[2rem] flex flex-col items-center">
                  <div className="relative w-48 h-48 md:w-56 md:h-56">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="currentColor" strokeWidth="6"
                        className="text-white/5"
                      />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke={scoreColor} strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={`${(score / 100) * 264} 264`}
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 20px ${scoreColor}80)` }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-6xl md:text-7xl font-bold" style={{ color: scoreColor }}>
                        {toPersianNumber(score)}
                      </span>
                      <span className="text-sm text-[var(--foreground)]/50 mt-1">
                        {t("overallScore", language)}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="mt-6 px-4 py-2 rounded-full text-sm font-medium"
                    style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
                  >
                    {scoreLabel}
                  </div>
                </div>
              )}

              {/* ابعاد تحلیل */}
              {Object.keys(dimensions).length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                    {t("dimensionAnalysis", language)}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(dimensions).map(([key, value]) => {
                      const numericValue = typeof value === "number" ? value : 0;
                      const color = getScoreColor(numericValue);
                      return (
                        <div 
                          key={key} 
                          className="glass-panel p-4 rounded-2xl text-center group hover:scale-105 transition-transform"
                        >
                          <div className="text-3xl mb-2">{getDimensionIcon(key)}</div>
                          <div className="text-2xl font-bold mb-1" style={{ color }}>
                            {toPersianNumber(Math.round(numericValue))}
                          </div>
                          <div className="text-xs text-[var(--foreground)]/60">
                            {tDimension(key as DimensionKey, language)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* نقاط قوت */}
              {data.strengths && data.strengths.length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-r-4 border-r-[#10b981]">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#10b981]">
                    <CheckCircle2 className="w-5 h-5" />
                    {t("strengths", language)}
                  </h2>
                  <ul className="space-y-2">
                    {data.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                        <span className="text-[#10b981] mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* نقاط ضعف */}
              {data.weaknesses && data.weaknesses.length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-r-4 border-r-[#f59e0b]">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#f59e0b]">
                    <AlertCircle className="w-5 h-5" />
                    {t("weaknesses", language)}
                  </h2>
                  <ul className="space-y-2">
                    {data.weaknesses.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                        <span className="text-[#f59e0b] mt-0.5">⚠</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* پیشنهادهای بهبود */}
              {data.improvements && data.improvements.length > 0 && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem] border-r-4 border-r-[var(--accent)]">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[var(--accent)]">
                    <Lightbulb className="w-5 h-5" />
                    {t("improvements", language)}
                  </h2>
                  <ul className="space-y-2">
                    {data.improvements.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]/80">
                        <span className="text-[var(--accent)] mt-0.5">💡</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* متن پیاده‌شده */}
              {(data.transcript || data.input_text) && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="w-full flex items-center justify-between text-right"
                  >
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--primary)]" />
                      {t("transcript", language)}
                    </h2>
                    <span className="text-sm text-[var(--foreground)]/50">
                      {showTranscript ? "▲" : "▼"}
                    </span>
                  </button>
                  {showTranscript && (
                    <p className="mt-4 text-sm leading-loose text-[var(--foreground)]/70 whitespace-pre-wrap">
                      {data.transcript || data.input_text}
                    </p>
                  )}
                </div>
              )}

              {/* دکمه‌های اقدام */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:hidden">
                <Button onClick={handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  {t("retry", language)}
                </Button>
                
                <Button onClick={handleShare} variant="secondary" className="flex items-center gap-2">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                  {copied ? t("copied", language) : t("shareAnalysis", language)}
                </Button>
                
                <Button onClick={handlePrint} variant="secondary" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  {t("print", language)}
                </Button>
                
                <Button onClick={handlePrint} variant="secondary" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  {t("downloadPdf", language)}
                </Button>
              </div>
            </>
          )}

          <div className="text-center text-xs text-[var(--foreground)]/30 pt-4 print:hidden">
            خطیب © {new Date().getFullYear()}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function getDimensionIcon(key: string): string {
  const icons: Record<string, string> = {
    confidence: "🎯",
    pace: "💨",
    clarity: "💎",
    tone: "🎭",
    fluency: "🌊",
    structure: "🏗️",
    content: "📝",
  };
  return icons[key] ?? "📊";
}