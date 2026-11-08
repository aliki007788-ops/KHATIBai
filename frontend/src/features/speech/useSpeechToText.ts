"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";

/* تایپ‌های حداقلی Web Speech API (در lib.dom پیش‌فرض TypeScript نیست) */
interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const ERROR_FA: Record<string, string> = {
  "not-allowed": "دسترسی به میکروفون رد شد. از آیکن قفل کنار آدرس مرورگر اجازه‌ی میکروفون را بدهید.",
  "service-not-allowed": "دسترسی به میکروفون رد شد. از تنظیمات مرورگر اجازه بدهید.",
  "audio-capture": "میکروفونی روی این دستگاه پیدا نشد. یک میکروفون وصل کنید یا پیام را تایپ کنید.",
  "no-speech": "صدایی شنیده نشد. نزدیک‌تر به میکروفون حرف بزنید و دوباره امتحان کنید.",
  network: "برای تبدیل گفتار به متن، اتصال اینترنت لازم است.",
  "language-not-supported": "مرورگر شما این زبان را برای تشخیص گفتار پشتیبانی نمی‌کند؛ پیام را تایپ کنید.",
};

const MIC_ERROR_FA: Record<string, string> = {
  NotAllowedError: "دسترسی به میکروفون رد شد. از آیکن قفل کنار آدرس مرورگر اجازه‌ی میکروفون را بدهید.",
  PermissionDeniedError: "دسترسی به میکروفون رد شد. از تنظیمات مرورگر اجازه بدهید.",
  NotFoundError: "میکروفونی روی این دستگاه پیدا نشد. یک میکروفون وصل کنید یا پیام را تایپ کنید.",
  NotReadableError: "میکروفون در برنامه‌ی دیگری در حال استفاده است. آن را ببندید و دوباره امتحان کنید.",
};

/**
 * تبدیل گفتار به متن:
 *  - Chrome/Edge/Safari: Web Speech API مرورگر (آنی، رایگان)
 *  - Firefox و بقیه: ضبط صدا با MediaRecorder و تبدیل در سرور (/api/learning/transcribe، نیازمند کلید AI)
 * متن در onText برمی‌گردد و کاربر قبل از ارسال می‌تواند ویرایشش کند.
 */
export function useSpeechToText(onText: (text: string, isFinal: boolean) => void, lang = "ar-IQ") {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const cbRef = useRef(onText);
  cbRef.current = onText;

  const hasSR =
    typeof window !== "undefined" &&
    !!((window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition);
  const hasRecorder =
    typeof window !== "undefined" && typeof MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
  const supported = hasSR || hasRecorder;

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    else recRef.current?.stop();
  }, []);

  const startRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsListening(false);
        const blob = new Blob(chunksRef.current, { type: mime });
        if (blob.size < 1500) {
          setError("صدایی ضبط نشد. نزدیک‌تر به میکروفون حرف بزنید و دوباره امتحان کنید.");
          return;
        }
        setIsTranscribing(true);
        try {
          const form = new FormData();
          form.append("file", blob, mime === "audio/webm" ? "voice.webm" : "voice.mp4");
          form.append("language", lang.startsWith("ar") ? "ar" : "fa");
          const res = await apiClient.post<{ text: string }>("/api/learning/transcribe", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data.text) cbRef.current(res.data.text, true);
          else setError("چیزی تشخیص داده نشد. دوباره امتحان کنید یا تایپ کنید.");
        } catch (e) {
          setError(getErrorMessage(e) || "تبدیل گفتار به متن انجام نشد. پیام را تایپ کنید.");
        } finally {
          setIsTranscribing(false);
        }
      };
      mediaRef.current = rec;
      rec.start();
      setIsListening(true);
    } catch (e) {
      const name = (e as { name?: string }).name ?? "";
      setError(MIC_ERROR_FA[name] ?? "دسترسی به میکروفون ممکن نشد. پیام را تایپ کنید.");
    }
  }, [lang]);

  const start = useCallback(() => {
    setError(null);
    const w = window as unknown as Record<string, SpeechRecognitionCtor | undefined>;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      if (hasRecorder) {
        void startRecorder();
      } else {
        setError("مرورگر شما ضبط صدا ندارد. از Chrome یا Edge استفاده کنید یا پیام را تایپ کنید.");
      }
      return;
    }
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = "";
      let final = false;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
        if (e.results[i].isFinal) final = true;
      }
      cbRef.current(text.trim(), final);
    };
    rec.onerror = (e) => {
      setError(ERROR_FA[e.error] ?? "تشخیص گفتار با خطا روبه‌رو شد. دوباره امتحان کنید یا تایپ کنید.");
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setError("شروع تشخیص گفتار ممکن نشد. چند ثانیه بعد دوباره امتحان کنید.");
    }
  }, [lang, hasRecorder, startRecorder]);

  useEffect(
    () => () => {
      recRef.current?.abort();
      if (mediaRef.current && mediaRef.current.state !== "inactive") mediaRef.current.stop();
    },
    []
  );

  return { supported, isListening, isTranscribing, error, start, stop };
}
