"use client";

import { useState, useEffect, useRef } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCreateAudioSpeech, useSpeech } from "@/features/speech/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import { 
  Mic, Square, Lightbulb, Gauge
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PracticeMode = "free" | "script" | "impromptu" | "presentation";

// آدرس WebSocket رو از env می‌خونیم تا هاردکد نشه
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/coach";

export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>("free");
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [waveHeights, setWaveHeights] = useState<number[]>(Array(40).fill(10));
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [speechId, setSpeechId] = useState<string | null>(null);
  const [practiceText, setPracticeText] = useState<string>("به نام خداوند بخشنده مهربان...");
  const [impromptuTopic, setImpromptuTopic] = useState<string>("");
  const [liveFeedback, setLiveFeedback] = useState<string>("");
  
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      } catch {
        // ignore parse errors
      }
    };

    ws.onerror = () => {
      console.error("WebSocket error");
      setLiveFeedback("خطا در اتصال به مربی آنلاین.");
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
          { topic: "تمرین سخنرانی", file },
          { onSuccess: (data) => setSpeechId(data.id) }
        );
      };

      recorder.start(500);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setTimer(0);
      setSpeechId(null);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("دسترسی به میکروفون امکان‌پذیر نیست.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isProcessing = createAudio.isPending || (speechData && (speechData.status === "pending" || speechData.status === "processing"));
  const isCompleted = speechData && speechData.status === "completed";

  // نگاشت کلیدهای بک‌اند به برچسب‌های فارسی
  const dimensionLabels: Record<string, string> = {
    confidence: "اعتماد به نفس",
    pace: "سرعت گفتار",
    clarity: "وضوح",
    tone: "لحن",
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-6 p-4 md:p-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Button variant={mode === "free" ? "primary" : "glass"} onClick={() => setMode("free")}>آزاد</Button>
          <Button variant={mode === "script" ? "primary" : "glass"} onClick={() => setMode("script")}>متن‌خوانی</Button>
          <Button variant={mode === "impromptu" ? "primary" : "glass"} onClick={() => { setMode("impromptu"); generateImpromptuTopic(); }}>بداهه</Button>
          <Button variant={mode === "presentation" ? "primary" : "glass"} onClick={() => setMode("presentation")}>ارائه</Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-6">
            {mode === "script" && <div className="glass-panel p-6 rounded-[2rem]"><p className="text-lg leading-loose">{practiceText}</p></div>}
            {mode === "impromptu" && <div className="glass-panel p-6 rounded-[2rem]"><p className="text-lg leading-loose">{impromptuTopic}</p></div>}
            
            <div className="glass-panel flex-1 min-h-[400px] rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="flex items-center justify-center gap-1.5 h-32 w-full max-w-2xl mb-6">
                {waveHeights.map((height, i) => (
                  <div key={i} className="w-2 rounded-full bg-gradient-to-t from-[#8b5cf6] to-[#3b82f6]" style={{ height: `${height}%`, opacity: isRecording ? 0.8 : 0.2 }} />
                ))}
              </div>
              <div className="flex flex-col items-center gap-6">
                <div className="text-5xl font-mono">{formatTime(timer)}</div>
                <button onClick={isRecording ? stopRecording : startRecording} disabled={isProcessing} className={cn("w-24 h-24 rounded-full flex items-center justify-center", isRecording ? "bg-red-500" : "bg-white")}>
                  {isRecording ? <Square className="w-8 h-8 text-white" /> : <Mic className="w-10 h-10 text-red-500" />}
                </button>
              </div>
            </div>

            {isRecording && liveFeedback && (
              <div className="glass-panel p-4 rounded-2xl bg-yellow-50 animate-pulse">
                <p className="text-sm text-yellow-800 flex items-center gap-2"><Gauge className="w-5 h-5" />{liveFeedback}</p>
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 flex flex-col gap-6">
            <div className="glass-panel p-6 rounded-[2rem] text-center">
              <h3 className="text-sm text-gray-500 mb-2">امتیاز کلی</h3>
              {isSpeechLoading || isProcessing ? <Skeleton className="h-16 w-32 mx-auto" /> : <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8b5cf6] to-[#10b981]">{speechData?.overall_score != null ? toPersianNumber(speechData.overall_score) : "—"}</div>}
            </div>
            <div className="glass-panel p-6 rounded-[2rem]">
              <h3 className="text-lg font-semibold mb-4">تحلیل ابعاد</h3>
              {["confidence", "pace", "clarity", "tone"].map((key) => {
                // از dimension_scores استفاده می‌کنیم (نام واقعی فیلد بک‌اند)
                const value = speechData?.dimension_scores?.[key] ?? null;
                const label = dimensionLabels[key] ?? key;
                return (
                  <div key={key} className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>{label}</span>
                      <span>{value != null ? `${toPersianNumber(Math.round(value))}٪` : "—"}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: value != null ? `${value}%` : "0%" }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="glass-panel p-6 rounded-[2rem] border-l-4 border-l-[var(--accent)]">
              <h3 className="text-sm text-[var(--accent)] mb-2 flex items-center gap-2"><Lightbulb className="w-4 h-4" /> پیشنهاد مربی</h3>
              <p className="text-sm text-gray-600">
                {speechData?.next_practice ?? speechData?.structure_notes ?? "برای دریافت پیشنهاد، تمرین کنید."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}