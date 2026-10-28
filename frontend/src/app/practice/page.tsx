"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateAudioSpeech, useSpeech, useSpeechList } from "@/features/speech/hooks";
import { useSuggestPractice } from "@/features/practice/hooks";
import { practiceService } from "@/features/practice/practice.service";
import { toPersianNumber } from "@/lib/utils/number";
import {
  Mic, Square, Lightbulb, Paperclip, History, Sparkles,
  Shuffle, MessageCircle, User as UserIcon, GraduationCap, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  type Language,
  type PracticeMode,
  type DimensionKey,
  DEFAULT_LANGUAGE,
  PRACTICE_MODES,
  t,
  tMode,
  tDimension,
  getScoreColor,
} from "@/features/practice/constants";
import {
  type PracticeLevel,
  PRACTICE_LEVELS,
  SCRIPT_BANK,
  IMPROMPTU_BANK,
  PRESENTATION_BANK,
  filterByLevel,
} from "@/features/practice/content";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/coach";
const REALTIME_SAMPLE_RATE = 24000;

interface LiveFeedEntry {
  id: string;
  role: "user" | "coach";
  text: string;
}

// ---------- Web Audio helpers (PCM16 capture for the live coach) ----------
function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (outputRate === inputRate) return buffer;
  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let accum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i];
      count++;
    }
    result[offsetResult] = count > 0 ? accum / count : 0;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

export default function PracticePage() {
  const router = useRouter();
  const [mode, setMode] = useState<PracticeMode>("free");
  const [level, setLevel] = useState<PracticeLevel>("intermediate");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(40).fill(10));
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechId, setSpeechId] = useState<string | null>(null);

  const [practiceText, setPracticeText] = useState<string>(SCRIPT_BANK[0].text);
  const [impromptuTopic, setImpromptuTopic] = useState<string>("");
  const [guidanceText, setGuidanceText] = useState<string>("");
  const [selectedBankId, setSelectedBankId] = useState<string>(SCRIPT_BANK[0].id);
  const [aiHint, setAiHint] = useState<string>("");
  const [aiDraft, setAiDraft] = useState<{ title: string; prompt_text: string; guidance: string } | null>(null);

  const [liveFeed, setLiveFeed] = useState<LiveFeedEntry[]>([]);
  const [coachBuffer, setCoachBuffer] = useState<string>("");
  const [coachConnected, setCoachConnected] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const muteGainRef = useRef<GainNode | null>(null);
  // هر اتصال مربی زنده یک شماره‌ی جلسه دارد؛ اگر کاربر وسط گرفتن بلیت ضبط را قطع کند، اتصال کهنه باز نمی‌شود.
  const coachSessionRef = useRef(0);

  const createAudio = useCreateAudioSpeech();
  const { data: recentSpeeches } = useSpeechList();
  // بعد از ضبط، کاربر بلافاصله به /practice/[id] هدایت می‌شود، پس speechId در این
  // صفحه معمولاً هرگز ست نمی‌شود — برای اینکه سایدبار همیشه خالی نماند، در نبود
  // یک جلسه فعال، آخرین تمرینِ تکمیل‌شده کاربر را نشان می‌دهیم.
  const latestCompletedId = recentSpeeches?.find((s) => s.status === "completed")?.id ?? null;
  const { data: speechData, isLoading: isSpeechLoading } = useSpeech(speechId ?? latestCompletedId);
  const suggestMutation = useSuggestPractice();

  // ---------- Content bank wiring ----------
  const activeBank = useMemo(() => {
    if (mode === "script") return filterByLevel(SCRIPT_BANK, level);
    if (mode === "impromptu") return filterByLevel(IMPROMPTU_BANK, level);
    if (mode === "presentation") return filterByLevel(PRESENTATION_BANK, level);
    return [];
  }, [mode, level]);

  const applyBankItem = (item: (typeof SCRIPT_BANK)[number] | (typeof IMPROMPTU_BANK)[number]) => {
    setSelectedBankId(item.id);
    if ("text" in item) {
      setPracticeText(item.text);
      setGuidanceText("");
    } else {
      setImpromptuTopic(item.prompt);
      setGuidanceText(item.guidance);
    }
  };

  useEffect(() => {
    if (mode === "free") return;
    if (activeBank.length > 0) {
      applyBankItem(activeBank[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, level]);

  // اگر از یک «مسیر آموزشی چندهفته‌ای» با mode/level/id مشخص به این صفحه آمده‌ایم،
  // همان حالت و متن دقیق آن هفته را انتخاب می‌کنیم (بدون بازنویسی سایر منطق بالا).
  const queryParamsAppliedRef = useRef(false);
  const queryItemAppliedRef = useRef(false);

  useEffect(() => {
    if (queryParamsAppliedRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const qMode = params.get("mode");
    const qLevel = params.get("level");
    if (!qMode) return;
    queryParamsAppliedRef.current = true;
    if (qMode === "script" || qMode === "impromptu" || qMode === "presentation" || qMode === "free") {
      setMode(qMode as PracticeMode);
    }
    if (qLevel === "beginner" || qLevel === "intermediate" || qLevel === "advanced") {
      setLevel(qLevel as PracticeLevel);
    }
  }, []);

  useEffect(() => {
    if (!queryParamsAppliedRef.current || queryItemAppliedRef.current) return;
    if (typeof window === "undefined") return;
    const qId = new URLSearchParams(window.location.search).get("id");
    if (!qId) return;
    const item = activeBank.find((b) => b.id === qId);
    if (item) {
      applyBankItem(item);
      queryItemAppliedRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBank]);

  // گفتگوی پیشنهاد-و-تأیید: پیشنهاد هوش مصنوعی فقط در یک پیش‌نمایش نشان داده
  // می‌شود و تا وقتی کاربر «تایید و استفاده» را نزند، جایگزین متن تمرین نمی‌شود.
  const requestAiDraft = (regenerate = false) => {
    if (mode === "free") return;
    suggestMutation.mutate(
      {
        mode,
        level,
        hint: aiHint.trim() || undefined,
        previousTitle: regenerate ? aiDraft?.title : undefined,
      },
      {
        onSuccess: (data) => setAiDraft(data),
      }
    );
  };

  const approveAiDraft = () => {
    if (!aiDraft) return;
    setSelectedBankId("ai-" + Date.now());
    setGuidanceText(aiDraft.guidance);
    if (mode === "script") {
      setPracticeText(aiDraft.prompt_text);
    } else {
      setImpromptuTopic(`${aiDraft.title}\n${aiDraft.prompt_text}`);
    }
    setAiDraft(null);
  };

  const discardAiDraft = () => setAiDraft(null);

  // ---------- Recording timer / waveform ----------
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
        setWaveHeights(Array(40).fill(0).map(() => Math.random() * 100));
      }, 100);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setWaveHeights(Array(40).fill(10));
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveFeed, coachBuffer]);

  // ---------- Teardown on unmount ----------
  useEffect(() => {
    return () => {
      closeLiveCoach();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeLiveCoach = () => {
    coachSessionRef.current += 1;
    try {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      muteGainRef.current?.disconnect();
      audioCtxRef.current?.close();
    } catch {
      /* best-effort cleanup */
    }
    processorRef.current = null;
    sourceRef.current = null;
    muteGainRef.current = null;
    audioCtxRef.current = null;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        /* already closed */
      }
      wsRef.current = null;
    }
    setCoachConnected(false);
  };

  const connectLiveCoach = async (stream: MediaStream) => {
    const sessionId = ++coachSessionRef.current;
    try {
      // ۱) گراف صدا همین‌جا و بدون await ساخته می‌شود (داخل همان تعامل کاربر)، چون سافاری و برخی
      //    مرورگرها AudioContextِ ساخته‌شده بعد از await را suspended نگه می‌دارند.
      const AudioContextCtor: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextCtor();
      audioCtxRef.current = audioCtx;
      if (audioCtx.state === "suspended") {
        void audioCtx.resume();
      }

      const source = audioCtx.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const muteGain = audioCtx.createGain();
      muteGain.gain.value = 0;
      muteGainRef.current = muteGain;

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        const input = e.inputBuffer.getChannelData(0);
        const downsampled = downsampleBuffer(input, audioCtx.sampleRate, REALTIME_SAMPLE_RATE);
        const pcm16 = floatTo16BitPCM(downsampled);
        wsRef.current.send(pcm16.buffer as ArrayBuffer);
      };

      // processor must be connected to a destination to fire onaudioprocess;
      // route it through a silent gain node so the user never hears an echo.
      source.connect(processor);
      processor.connect(muteGain);
      muteGain.connect(audioCtx.destination);

      // ۲) بلیت کوتاه‌مدت از سرور می‌گیریم (WebSocket هدر Authorization ندارد) و بعد وصل می‌شویم.
      const { ticket } = await practiceService.coachTicket();
      if (sessionId !== coachSessionRef.current) return; // کاربر در این فاصله ضبط را قطع کرده

      const ws = new WebSocket(`${WS_URL}?ticket=${encodeURIComponent(ticket)}`);
      wsRef.current = ws;

      ws.onopen = () => setCoachConnected(true);
      ws.onerror = () => setCoachConnected(false);
      ws.onclose = () => setCoachConnected(false);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "conversation.item.input_audio_transcription.completed" && data.transcript) {
            setLiveFeed((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: data.transcript }]);
          } else if (data.type === "response.text.delta" && typeof data.delta === "string") {
            setCoachBuffer((prev) => prev + data.delta);
          } else if (data.type === "response.text.done" || data.type === "response.done") {
            setCoachBuffer((prevBuf) => {
              const finalText = prevBuf.trim();
              if (finalText) {
                setLiveFeed((prev) => [...prev, { id: crypto.randomUUID(), role: "coach", text: finalText }]);
              }
              return "";
            });
          }
        } catch {
          /* non-JSON or unrecognized event — ignore */
        }
      };
    } catch (err) {
      console.error("Live coach setup error:", err);
      setCoachConnected(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        createAudio.mutate(
          { topic: tMode(mode, language), file },
          { onSuccess: (data) => router.push(`/practice/${data.id}`) }
        );
      };

      recorder.start(500);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTimer(0);
      setSpeechId(null);
      setErrorMessage("");
      setLiveFeed([]);
      setCoachBuffer("");

      // Parallel PCM16 pipeline for the live coach — independent of the
      // MediaRecorder webm blob, which is still used for the final upload.
      void connectLiveCoach(stream);
    } catch (err) {
      console.error("Microphone error:", err);
      setErrorMessage(t("micError", language));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    closeLiveCoach();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/")) {
      setErrorMessage(t("audioFileError", language));
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setSpeechId(null);

    try {
      createAudio.mutate(
        { topic: tMode(mode, language), file },
        {
          onSuccess: (data) => {
            setIsUploading(false);
            router.push(`/practice/${data.id}`);
          },
          onError: () => {
            setErrorMessage("خطا در پردازش فایل صوتی.");
            setIsUploading(false);
          },
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMessage("خطا در پردازش فایل صوتی.");
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isProcessing = createAudio.isPending || (speechData && (speechData.status === "pending" || speechData.status === "processing"));

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {(Object.keys(PRACTICE_MODES) as PracticeMode[]).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "primary" : "glass"}
                onClick={() => setMode(m)}
              >
                {tMode(m, language)}
              </Button>
            ))}
          </div>

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

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            {mode !== "free" && (
              <div className="glass-panel p-5 rounded-[2rem] flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-sm font-medium">{t("levelLabel", language)}</span>
                    <div className="flex gap-1 mr-2">
                      {(Object.keys(PRACTICE_LEVELS) as PracticeLevel[]).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setLevel(lvl)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs transition-all border",
                            level === lvl
                              ? "bg-[var(--accent)] text-white border-transparent"
                              : "border-white/10 hover:bg-white/5"
                          )}
                        >
                          {PRACTICE_LEVELS[lvl][language]}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={aiHint}
                    onChange={(e) => setAiHint(e.target.value)}
                    disabled={isRecording}
                    placeholder={t("aiHintPlaceholder", language)}
                    className="flex-1 glass-panel px-4 py-2 rounded-xl text-sm bg-transparent border border-white/10 focus:border-[var(--accent)] outline-none"
                  />
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => requestAiDraft(false)}
                    loading={suggestMutation.isPending}
                    disabled={isRecording}
                  >
                    <Sparkles className="w-4 h-4" />
                    {suggestMutation.isPending ? t("suggestingTopic", language) : t("suggestNewTopic", language)}
                  </Button>
                </div>

                {suggestMutation.isError && (
                  <p className="text-xs text-red-400">{t("suggestError", language)}</p>
                )}

                {aiDraft && (
                  <div className="glass-panel p-4 rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                      <Sparkles className="w-4 h-4" />
                      {t("draftTitle", language)}
                    </div>
                    <p className="font-medium">{aiDraft.title}</p>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{aiDraft.prompt_text}</p>
                    <p className="text-xs text-gray-500">
                      <span className="font-medium">{t("guidanceLabel", language)}: </span>
                      {aiDraft.guidance}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button size="sm" variant="primary" onClick={approveAiDraft}>
                        {t("approveDraft", language)}
                      </Button>
                      <Button
                        size="sm"
                        variant="glass"
                        onClick={() => requestAiDraft(true)}
                        loading={suggestMutation.isPending}
                      >
                        <Sparkles className="w-4 h-4" />
                        {t("regenerateDraft", language)}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={discardAiDraft}>
                        {t("discardDraft", language)}
                      </Button>
                    </div>
                  </div>
                )}

                {activeBank.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Shuffle className="w-4 h-4 text-gray-400 shrink-0" />
                    {activeBank.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => applyBankItem(item)}
                        disabled={isRecording}
                        className={cn(
                          "shrink-0 px-3 py-1.5 rounded-full text-xs border transition-all whitespace-nowrap",
                          selectedBankId === item.id
                            ? "bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)]"
                            : "border-white/10 hover:bg-white/5"
                        )}
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}

                {suggestMutation.isError && (
                  <p className="text-xs text-red-400">{t("suggestError", language)}</p>
                )}

                <p className="text-lg leading-loose whitespace-pre-line">
                  {mode === "script" ? practiceText : impromptuTopic}
                </p>

                {guidanceText && (
                  <div className="flex items-start gap-2 text-sm text-gray-500 border-t border-white/10 pt-3">
                    <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                    <p>
                      <span className="font-medium text-[var(--foreground)]">{t("guidanceLabel", language)}: </span>
                      {guidanceText}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="glass-panel flex-1 min-h-[400px] rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 h-32 w-full max-w-2xl mb-6">
                {waveHeights.map((height, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-full bg-gradient-to-t from-[#8b5cf6] to-[#3b82f6]"
                    style={{ height: `${height}%`, opacity: isRecording ? 0.8 : 0.2 }}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="text-5xl font-mono">{formatTime(Math.floor(timer / 10))}</div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing || isUploading}
                  className={cn(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all",
                    isRecording ? "bg-red-500" : "bg-white"
                  )}
                >
                  {isRecording ? (
                    <Square className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-10 h-10 text-red-500" />
                  )}
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording || isProcessing || isUploading}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/40 text-green-500 hover:bg-green-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isUploading || isProcessing ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                  <span>{isUploading || isProcessing ? t("processingAudio", language) : t("uploadAudio", language)}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
              </div>
            </div>

            {isRecording && (
              <div className="glass-panel p-4 rounded-2xl flex flex-col gap-3 max-h-72">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
                    {t("liveCoachTitle", language)}
                  </h3>
                  <span className={cn("w-2 h-2 rounded-full", coachConnected ? "bg-green-500" : "bg-gray-400")} />
                </div>

                <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
                  {liveFeed.length === 0 && !coachBuffer && (
                    <p className="text-sm text-gray-500">{t("liveCoachWaiting", language)}</p>
                  )}
                  {liveFeed.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex items-start gap-2 text-sm rounded-xl px-3 py-2",
                        entry.role === "coach"
                          ? "bg-[var(--accent)]/10 self-start"
                          : "bg-white/5 self-end text-right"
                      )}
                    >
                      {entry.role === "coach" ? (
                        <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                      ) : (
                        <UserIcon className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                      )}
                      <span>{entry.text}</span>
                    </div>
                  ))}
                  {coachBuffer && (
                    <div className="flex items-start gap-2 text-sm rounded-xl px-3 py-2 bg-[var(--accent)]/10 animate-pulse">
                      <MessageCircle className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                      <span>{coachBuffer}</span>
                    </div>
                  )}
                  <div ref={feedEndRef} />
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="glass-panel p-4 rounded-xl border-r-4 border-r-red-500 bg-red-500/10">
                <p className="text-sm text-red-400 font-medium">⚠️ {errorMessage}</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-[2rem] text-center">
              <h3 className="text-sm text-gray-500 mb-2">
                {t("overallScore", language)}
                {!speechId && speechData && (
                  <span className="text-xs text-gray-400 font-normal"> (آخرین تمرین)</span>
                )}
              </h3>
              {isSpeechLoading || isProcessing ? (
                <Skeleton className="h-16 w-32 mx-auto" />
              ) : (
                <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#10b981]">
                  {speechData?.overall_score != null
                    ? toPersianNumber(speechData.overall_score)
                    : "—"}
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-[2rem]">
              <h3 className="text-lg font-semibold mb-4">{t("dimensionAnalysis", language)}</h3>
              {(["confidence", "clarity", "persuasion", "engagement"] as DimensionKey[]).map((key) => {
                const value = speechData?.dimension_scores?.[key] ?? null;
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{tDimension(key, language)}</span>
                      <span>
                        {value != null
                          ? `${toPersianNumber(Math.round(value))}٪`
                          : "—"}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: value != null ? `${value}%` : "0%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-l-[var(--accent)]">
              <h3 className="text-sm text-[var(--accent)] mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> {t("coachTip", language)}
              </h3>
              <p className="text-sm text-gray-600">
                {speechData?.next_practice
                  ?? speechData?.structure_notes
                  ?? t("noSuggestion", language)}
              </p>
            </div>

            <div className="glass-panel p-6 rounded-[2rem]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--accent)]" />
                  {t("recentPractices", language)}
                </h3>
                <Link href="/dashboard" className="text-xs text-[var(--accent)] flex items-center gap-1 hover:underline">
                  {t("viewAll", language)}
                  <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>

              {!recentSpeeches || recentSpeeches.length === 0 ? (
                <p className="text-sm text-gray-500">{t("noRecentPractices", language)}</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentSpeeches.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/practice/${item.id}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-sm"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{item.topic_label ?? t("overallScore", language)}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                      {item.overall_score != null ? (
                        <span
                          className="font-bold shrink-0"
                          style={{ color: getScoreColor(item.overall_score) }}
                        >
                          {toPersianNumber(Math.round(item.overall_score))}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 shrink-0">
                          {item.status === "failed" ? t("failed", language) : t("processing", language)}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
