"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateAudioSpeech, useSpeech } from "@/features/speech/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import { 
  Mic, Square, Lightbulb, Gauge, Paperclip
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
} from "@/features/practice/constants";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/coach";

export default function PracticePage() {
  const router = useRouter();
  const [mode, setMode] = useState<PracticeMode>("free");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(40).fill(10));
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechId, setSpeechId] = useState<string | null>(null);
  const [practiceText, setPracticeText] = useState<string>("به نام خداوند بخشنده مهربان...");
  const [impromptuTopic, setImpromptuTopic] = useState<string>("");
  const [liveFeedback, setLiveFeedback] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createAudio = useCreateAudioSpeech();
  const { data: speechData, isLoading: isSpeechLoading } = useSpeech(speechId);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "conversation.item.input_audio_transcription.completed") {
          setLiveFeedback("📝 شما گفتید: " + data.transcript);
        }
      } catch {}
    };

    ws.onerror = () => {
      console.error("WebSocket error");
    };

    return () => ws.close();
  }, []);

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

  const generateImpromptuTopic = () => {
    const topics = ["موضوع تصادفی ۱...", "موضوع تصادفی ۲..."];
    setImpromptuTopic(topics[Math.floor(Math.random() * topics.length)]);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(e.data);
          }
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
    } catch (err) {
      console.error("Microphone error:", err);
      setErrorMessage(t("micError", language));
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
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
          }
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
                onClick={() => {
                  setMode(m);
                  if (m === "impromptu") generateImpromptuTopic();
                }}
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
            {mode === "script" && (
              <div className="glass-panel p-6 rounded-[2rem]">
                <p className="text-lg leading-loose">{practiceText}</p>
              </div>
            )}
            {mode === "impromptu" && (
              <div className="glass-panel p-6 rounded-[2rem]">
                <p className="text-lg leading-loose">{impromptuTopic}</p>
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
                <div className="text-5xl font-mono">{formatTime(timer)}</div>
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

            {isRecording && liveFeedback && (
              <div className="glass-panel p-4 rounded-2xl bg-yellow-50 animate-pulse">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <Gauge className="w-5 h-5" />{liveFeedback}
                </p>
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
              <h3 className="text-sm text-gray-500 mb-2">{t("overallScore", language)}</h3>
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
              {(["confidence", "pace", "clarity", "tone"] as DimensionKey[]).map((key) => {
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
          </div>
        </div>
      </div>
    </AppShell>
  );
}