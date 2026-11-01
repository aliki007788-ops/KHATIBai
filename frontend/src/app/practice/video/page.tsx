"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { analyzeLiveStream, analyzeVideoElement, type VideoMetrics } from "@/features/video/analyzeFrames";
import { videoService } from "@/features/video/video.service";
import { toPersianNumber } from "@/lib/utils/number";
import { Camera, Upload, ArrowRight, Eye, User, Activity, Save } from "lucide-react";

export default function VideoPracticePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [live, setLive] = useState(false);
  const [running, setRunning] = useState(false);
  const [liveHint, setLiveHint] = useState<{ face: boolean; eye: boolean } | null>(null);
  const [metrics, setMetrics] = useState<VideoMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ["video", "analyses"],
    queryFn: () => videoService.list(),
  });

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    setMetrics(null);
    setSavedId(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        await videoRef.current.play();
      }
      setLive(true);
    } catch {
      setError("دسترسی به دوربین ممکن نشد. مجوز مرورگر را بررسی کنید.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(false);
    setLiveHint(null);
  };

  const runLiveAnalysis = async (seconds: number) => {
    if (!videoRef.current || !live) {
      setError("ابتدا دوربین را روشن کنید.");
      return;
    }
    setRunning(true);
    setError(null);
    setMetrics(null);
    setSavedId(null);
    try {
      const result = await analyzeLiveStream(videoRef.current, seconds * 1000, (p) => {
        setLiveHint({ face: p.face, eye: p.eyeContact });
      });
      setMetrics(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تحلیل زنده ناموفق بود.");
    } finally {
      setRunning(false);
      setLiveHint(null);
    }
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setMetrics(null);
    setSavedId(null);
    stopCamera();
    const url = URL.createObjectURL(file);
    const video = videoRef.current;
    if (!video) return;
    video.srcObject = null;
    video.src = url;
    video.muted = true;
    setRunning(true);
    try {
      await video.play().catch(() => undefined);
      video.pause();
      const result = await analyzeVideoElement(video, { intervalMs: 300, maxFrames: 120 });
      setMetrics(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "تحلیل فایل ویدیو ناموفق بود.");
    } finally {
      setRunning(false);
      URL.revokeObjectURL(url);
    }
  };

  const save = async () => {
    if (!metrics) return;
    setSaving(true);
    try {
      const row = await videoService.save(metrics, "تحلیل تماس چشمی");
      setSavedId(row.id);
      qc.invalidateQueries({ queryKey: ["video", "analyses"] });
    } catch {
      setError("ذخیره نتیجه ممکن نشد.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-8 pb-12">
          <Link href="/practice" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> استودیو تمرین
          </Link>

          <header className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#8b5cf6]/15 text-[#c4b5fd]">
              <Camera className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">تحلیل ویدیو و تماس چشمی</h1>
              <p className="text-sm text-[var(--foreground)]/60 mt-1">
                ویدیو را از دوربین یا فایل تحلیل کنید. حضور چهره، تقریب نگاه به دوربین و ثبات سر اندازه‌گیری می‌شود.
                در Chrome/Edge از FaceDetector استفاده می‌شود؛ در مرورگرهای دیگر تخمین ساده‌تر اعمال می‌گردد.
              </p>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black aspect-video">
                <video ref={videoRef} playsInline className="w-full h-full object-cover mirror" style={{ transform: "scaleX(-1)" }} />
                {liveHint && (
                  <div className="absolute top-3 right-3 flex gap-2 text-xs">
                    <span className={`px-2 py-1 rounded-lg ${liveHint.face ? "bg-emerald-500/80" : "bg-red-500/80"}`}>
                      {liveHint.face ? "چهره ✓" : "بدون چهره"}
                    </span>
                    <span className={`px-2 py-1 rounded-lg ${liveHint.eye ? "bg-emerald-500/80" : "bg-amber-500/80"}`}>
                      {liveHint.eye ? "نگاه به دوربین" : "نگاه منحرف"}
                    </span>
                  </div>
                )}
                {running && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-sm">در حال نمونه‌برداری فریم‌ها…</div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {!live ? (
                  <Button onClick={startCamera} className="flex items-center gap-2">
                    <Camera className="w-4 h-4" /> روشن کردن دوربین
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={stopCamera}>خاموش کردن دوربین</Button>
                )}
                <Button variant="secondary" disabled={!live || running} onClick={() => runLiveAnalysis(15)}>
                  تحلیل زنده ۱۵ ثانیه
                </Button>
                <Button variant="secondary" disabled={!live || running} onClick={() => runLiveAnalysis(30)}>
                  تحلیل زنده ۳۰ ثانیه
                </Button>
                <Button
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={running}
                >
                  <Upload className="w-4 h-4" /> آپلود ویدیو
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {metrics ? (
                <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold">نتیجه تحلیل</h2>
                    <span className="text-2xl font-black text-[#10b981]">{toPersianNumber(metrics.overallScore)}</span>
                  </div>
                  <Metric icon={<User className="w-4 h-4" />} label="حضور چهره" value={metrics.facePresencePct} />
                  <Metric icon={<Eye className="w-4 h-4" />} label="تماس چشمی (تقریب)" value={metrics.eyeContactPct} />
                  <Metric icon={<Activity className="w-4 h-4" />} label="ثبات سر/کادر" value={metrics.stabilityScore} />
                  <p className="text-xs text-[var(--foreground)]/40">
                    موتور: {metrics.engine} · {toPersianNumber(metrics.framesSampled)} فریم · {toPersianNumber(Math.round(metrics.durationSeconds))} ثانیه
                  </p>
                  <ul className="text-sm space-y-2 list-disc pr-5 text-[var(--foreground)]/80">
                    {metrics.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                  <Button onClick={save} disabled={saving || !!savedId} className="w-full flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" />
                    {savedId ? "ذخیره شد" : saving ? "در حال ذخیره…" : "ذخیره در حساب"}
                  </Button>
                </div>
              ) : (
                <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-5 text-sm text-[var(--foreground)]/50">
                  پس از تحلیل زنده یا آپلود ویدیو، امتیاز تماس چشمی و پیشنهادها اینجا نمایش داده می‌شود.
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-bold">تاریخچه</h3>
                {!history?.length && <p className="text-xs text-[var(--foreground)]/40">هنوز تحلیلی ذخیره نشده.</p>}
                {history?.slice(0, 5).map((h) => (
                  <div key={h.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs flex justify-between">
                    <span>{h.title || "تحلیل"}</span>
                    <span className="text-[#10b981] font-bold">{toPersianNumber(h.overall_score)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--foreground)]/35 leading-relaxed">
            توجه: «تماس چشمی» در این نسخه تقریب مبتنی بر موقعیت چهره نسبت به کادر و لنز است، نه ردیابی دقیق مردمک.
            برای دقت بالاتر در آینده می‌توان مدل gaze جداگانه اضافه کرد. تحلیل روی دستگاه شما انجام می‌شود و فقط خلاصهٔ متریک‌ها به سرور ارسال می‌گردد.
          </p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="flex items-center gap-1.5 text-[var(--foreground)]/70">{icon}{label}</span>
        <span className="font-bold">{toPersianNumber(Math.round(value))}٪</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981]" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}
