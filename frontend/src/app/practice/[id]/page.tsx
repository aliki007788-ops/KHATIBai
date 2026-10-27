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
  TrendingUp, FileText, Mic2, X,
} from "lucide-react";
import {
  type Language,
  type DimensionKey,
  DEFAULT_LANGUAGE,
  t,
  tDimension,
  getScoreLabel,
  getScoreColor,
  DIMENSION_ICONS,
  VOCAL_METRIC_LABELS,
  DERIVED_DELIVERY_LABELS,
  CONTENT_DIMENSION_ORDER,
  DELIVERY_DIMENSION_ORDER,
} from "@/features/practice/constants";

// ---------- یک کارت تحلیل کلیک‌پذیر ----------
interface CardModel {
  key: string;
  label: string;
  icon: string;
  score: number | null;
  explanation: string;
  rawValue?: string;
}

function DimensionCard({ card, onOpen }: { card: CardModel; onOpen: (c: CardModel) => void }) {
  const hasScore = card.score != null;
  const color = hasScore ? getScoreColor(card.score as number) : "#6b7280";
  return (
    <button
      onClick={() => onOpen(card)}
      className="glass-panel p-4 rounded-2xl text-center group hover:scale-105 transition-transform text-right w-full"
    >
      <div className="text-3xl mb-2">{card.icon}</div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {hasScore ? toPersianNumber(Math.round(card.score as number)) : "—"}
      </div>
      <div className="text-xs text-[var(--foreground)]/60">{card.label}</div>
      {card.rawValue && (
        <div className="text-[10px] text-[var(--foreground)]/40 mt-1">{card.rawValue}</div>
      )}
    </button>
  );
}

function DimensionModal({ card, language, onClose }: { card: CardModel; language: Language; onClose: () => void }) {
  const hasScore = card.score != null;
  const color = hasScore ? getScoreColor(card.score as number) : "#6b7280";
  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel p-6 md:p-8 rounded-[2rem] w-full max-w-md border border-[var(--border-color)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{card.icon}</span>
            <h3 className="text-lg font-bold">{card.label}</h3>
          </div>
          <button onClick={onClose} className="text-[var(--foreground)]/40 hover:text-[var(--foreground)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-5xl font-bold" style={{ color }}>
            {hasScore ? toPersianNumber(Math.round(card.score as number)) : "—"}
          </div>
          {hasScore && (
            <div className="text-xs mt-1" style={{ color }}>
              {getScoreLabel(card.score as number, language)}
            </div>
          )}
        </div>

        <div className="mb-2 text-xs font-bold text-[var(--foreground)]/50">{t("whyThisScore", language)}</div>
        <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{card.explanation}</p>

        <Button onClick={onClose} variant="secondary" className="w-full mt-6">
          {t("closeModal", language)}
        </Button>
      </div>
    </div>
  );
}

// ---------- محاسبه کارت‌های مشتق از معیار صوتی (گزینه B) ----------
function buildVocalCards(audioMetrics: Record<string, number> | null, language: Language): CardModel[] {
  if (!audioMetrics) return [];

  const silenceRatio = audioMetrics.silence_ratio ?? 0;
  const fluencyScore = Math.max(0, Math.min(100, Math.round(100 - silenceRatio * 150)));
  const wordCount = audioMetrics.word_count ?? 0;
  // تخمین تعداد جمله از روی تعداد مکث‌های کوتاه + ۱ (ساده‌شده)
  const estimatedSentences = Math.max(1, Math.round((audioMetrics.pause_count ?? 0) * 0.6) + 1);
  const avgSentenceLength = wordCount > 0 ? Math.round(wordCount / estimatedSentences) : 0;
  // توزیع انرژی: انحراف‌معیار بالاتر از میانگین → تنوع بیشتر → امتیاز بالاتر (تا سقف منطقی)
  const energyStd = audioMetrics.energy_std ?? 0;
  const energyScore = Math.max(0, Math.min(100, Math.round(energyStd * 1200)));

  return [
    {
      key: "speech_rate",
      label: VOCAL_METRIC_LABELS.speech_rate[language],
      icon: DIMENSION_ICONS.speech_rate,
      score: audioMetrics.speech_rate_wpm != null
        ? Math.max(0, Math.min(100, Math.round(100 - Math.abs((audioMetrics.speech_rate_wpm - 130) / 1.3))))
        : null,
      rawValue: audioMetrics.speech_rate_wpm != null
        ? `${toPersianNumber(Math.round(audioMetrics.speech_rate_wpm))} ${t("wordsPerMinute", language)}`
        : undefined,
      explanation: audioMetrics.speech_rate_wpm != null
        ? `سرعت گفتار شما ${toPersianNumber(Math.round(audioMetrics.speech_rate_wpm))} کلمه در دقیقه است. سرعت ایده‌آل برای سخنرانی معمولاً بین ۱۱۰ تا ۱۵۰ کلمه در دقیقه است.`
        : "داده‌ای موجود نیست.",
    },
    {
      key: "pause_count",
      label: VOCAL_METRIC_LABELS.pause_count[language],
      icon: DIMENSION_ICONS.pause_count,
      score: Math.max(0, Math.min(100, 100 - (audioMetrics.pause_count ?? 0) * 6)),
      rawValue: `${toPersianNumber(audioMetrics.pause_count ?? 0)} مکث`,
      explanation: `در طول سخنرانی ${toPersianNumber(audioMetrics.pause_count ?? 0)} مکث طولانی (بیش از نیم ثانیه) ثبت شد، با میانگین طول ${toPersianNumber((audioMetrics.avg_pause_duration_sec ?? 0).toFixed(1))} ${t("seconds", language)}.`,
    },
    {
      key: "breathing",
      label: VOCAL_METRIC_LABELS.breathing[language],
      icon: DIMENSION_ICONS.breathing,
      score: Math.max(0, Math.min(100, Math.round(100 - Math.abs((audioMetrics.breathing_rate_per_min ?? 0) - 12) * 4))),
      rawValue: `${toPersianNumber((audioMetrics.breathing_rate_per_min ?? 0).toFixed(1))} ${t("perMinute", language)}`,
      explanation: `نرخ تنفس تخمینی شما ${toPersianNumber((audioMetrics.breathing_rate_per_min ?? 0).toFixed(1))} بار در دقیقه است. تنفس منظم به کنترل بهتر صدا کمک می‌کند.`,
    },
    {
      key: "fluency",
      label: VOCAL_METRIC_LABELS.fluency[language],
      icon: DIMENSION_ICONS.fluency,
      score: fluencyScore,
      rawValue: `${toPersianNumber(Math.round(silenceRatio * 100))}٪ سکوت`,
      explanation: `${toPersianNumber(Math.round(silenceRatio * 100))}٪ از زمان سخنرانی شما سکوت بوده است. هرچه این نسبت کمتر باشد، گفتار روان‌تر به نظر می‌رسد.`,
    },
    {
      key: "energy_distribution",
      label: VOCAL_METRIC_LABELS.energy_distribution[language],
      icon: DIMENSION_ICONS.energy_distribution,
      score: energyScore,
      rawValue: undefined,
      explanation: "تنوع انرژی صدا نشان می‌دهد چقدر بلندی صدای شما در طول سخنرانی تغییر کرده؛ تنوع متعادل، سخنرانی را جذاب‌تر می‌کند.",
    },
    {
      key: "sentence_length",
      label: VOCAL_METRIC_LABELS.sentence_length[language],
      icon: DIMENSION_ICONS.sentence_length,
      score: avgSentenceLength > 0
        ? Math.max(0, Math.min(100, Math.round(100 - Math.abs(avgSentenceLength - 15) * 4)))
        : null,
      rawValue: avgSentenceLength > 0 ? `${toPersianNumber(avgSentenceLength)} ${t("words", language)}` : undefined,
      explanation: avgSentenceLength > 0
        ? `میانگین طول جملات شما حدود ${toPersianNumber(avgSentenceLength)} کلمه است (تخمینی). جملات کوتاه‌تر معمولاً برای شنونده واضح‌ترند.`
        : "داده‌ای موجود نیست.",
    },
  ];
}

function buildDerivedDeliveryCards(audioMetrics: Record<string, number> | null, language: Language): CardModel[] {
  if (!audioMetrics) return [];
  const pauseCount = audioMetrics.pause_count ?? 0;
  const stumbleScore = Math.max(0, Math.min(100, 100 - pauseCount * 7));
  const pitchVariation = audioMetrics.pitch_variation ?? 0;
  const stressScore = Math.max(0, Math.min(100, Math.round(100 - pitchVariation * 180)));

  return [
    {
      key: "stumbles",
      label: DERIVED_DELIVERY_LABELS.stumbles[language],
      icon: DIMENSION_ICONS.stumbles,
      score: stumbleScore,
      explanation: `بر اساس تعداد مکث‌های ناگهانی (${toPersianNumber(pauseCount)} مورد)، این امتیاز میزان توقف و تپق در گفتار شما را تخمین می‌زند.`,
    },
    {
      key: "stress",
      label: DERIVED_DELIVERY_LABELS.stress[language],
      icon: DIMENSION_ICONS.stress,
      score: stressScore,
      explanation: "این امتیاز از روی نوسان زیروبمی صدا (pitch) تخمین زده می‌شود؛ نوسان بسیار بالا می‌تواند نشانه استرس یا هیجان باشد.",
    },
  ];
}

function buildGptDimensionCards(
  keys: readonly string[],
  dimensionScores: Record<string, number>,
  dimensionDetails: Record<string, string> | null,
  language: Language
): CardModel[] {
  return keys.map((key) => ({
    key,
    label: tDimension(key as DimensionKey, language),
    icon: DIMENSION_ICONS[key] ?? "📊",
    score: dimensionScores[key] ?? null,
    explanation: dimensionDetails?.[key] ?? "توضیحی برای این بعد ثبت نشده است.",
  }));
}

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
  const [activeCard, setActiveCard] = useState<CardModel | null>(null);

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
  const dimensionScores = data?.dimension_scores ?? {};
  const dimensionDetails = data?.dimension_details ?? null;
  const audioMetrics = data?.audio_metrics ?? null;

  const contentCards = buildGptDimensionCards(CONTENT_DIMENSION_ORDER, dimensionScores, dimensionDetails, language);
  const deliveryGptCards = buildGptDimensionCards(DELIVERY_DIMENSION_ORDER, dimensionScores, dimensionDetails, language);
  const deliveryDerivedCards = buildDerivedDeliveryCards(audioMetrics, language);
  const deliveryCards = [...deliveryGptCards, ...deliveryDerivedCards];
  const vocalCards = buildVocalCards(audioMetrics, language);

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

              {!isProcessing && (
                <>
                  {/* بخش ۱: Vocal */}
                  <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Mic2 className="w-5 h-5 text-[var(--accent)]" />
                      {t("vocalSectionTitle", language)}
                    </h2>
                    {vocalCards.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {vocalCards.map((card) => (
                          <DimensionCard key={card.key} card={card} onOpen={setActiveCard} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[var(--foreground)]/50 text-center py-6">
                        {t("noAudioMetrics", language)}
                      </p>
                    )}
                  </div>

                  {/* بخش ۲: Delivery */}
                  <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                      {t("deliverySectionTitle", language)}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {deliveryCards.map((card) => (
                        <DimensionCard key={card.key} card={card} onOpen={setActiveCard} />
                      ))}
                    </div>
                  </div>

                  {/* بخش ۳: Content */}
                  <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[var(--accent)]" />
                      {t("contentSectionTitle", language)}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {contentCards.map((card) => (
                        <DimensionCard key={card.key} card={card} onOpen={setActiveCard} />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* بخش ۴: Overall — نقاط قوت/ضعف/پیشنهاد */}
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

              {data.next_practice && (
                <div className="glass-panel p-6 md:p-8 rounded-[2rem]">
                  <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    {t("nextPractice", language)}
                  </h2>
                  <p className="text-sm text-[var(--foreground)]/70 leading-relaxed">{data.next_practice}</p>
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

        {activeCard && (
          <DimensionModal card={activeCard} language={language} onClose={() => setActiveCard(null)} />
        )}
      </AppShell>
    </AuthGuard>
  );
}
