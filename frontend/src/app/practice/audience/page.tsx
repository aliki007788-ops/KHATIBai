"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { audienceService } from "@/features/audience/audience.service";
import { toPersianNumber } from "@/lib/utils/number";
import { Users, Mic, MicOff, Maximize2, ArrowRight, Save, Glasses } from "lucide-react";

type PersonState = "idle" | "engaged" | "bored" | "clap";

type Person = {
  id: number;
  row: number;
  seat: number;
  hue: number;
  state: PersonState;
  nod: number;
};

function buildAudience(size: number): Person[] {
  const rows = size <= 9 ? 2 : size <= 18 ? 3 : 4;
  const perRow = Math.ceil(size / rows);
  const people: Person[] = [];
  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let s = 0; s < perRow && id < size; s++) {
      people.push({
        id: id++,
        row: r,
        seat: s,
        hue: (id * 47) % 360,
        state: "idle",
        nod: Math.random() * 0.4,
      });
    }
  }
  return people;
}

export default function VirtualAudiencePage() {
  const [size, setSize] = useState(12);
  const [people, setPeople] = useState<Person[]>(() => buildAudience(12));
  const [listening, setListening] = useState(false);
  const [energy, setEnergy] = useState(0);
  const [immersive, setImmersive] = useState(false);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [xrSupported, setXrSupported] = useState(false);
  const [summary, setSummary] = useState<{
    avg: number;
    peak: number;
    engagement: number;
    silence: number;
    duration: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const energyHistRef = useRef<number[]>([]);
  const silenceRef = useRef(0);
  const startRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: history } = useQuery({
    queryKey: ["audience", "sessions"],
    queryFn: () => audienceService.list(),
  });

  useEffect(() => {
    setPeople(buildAudience(size));
  }, [size]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.xr) {
      navigator.xr.isSessionSupported?.("immersive-vr").then((ok) => setXrSupported(!!ok)).catch(() => setXrSupported(false));
    }
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  const updateAudienceReaction = useCallback((level: number) => {
    setPeople((prev) =>
      prev.map((p) => {
        let state: PersonState = "idle";
        // هر نفر کمی آستانه متفاوت دارد
        const bias = (p.id % 5) * 0.04;
        if (level > 0.55 + bias) state = "clap";
        else if (level > 0.22 + bias) state = "engaged";
        else if (level < 0.08) state = "bored";
        else state = "idle";
        return {
          ...p,
          state,
          nod: state === "engaged" || state === "clap" ? 0.2 + level * 0.8 : p.nod * 0.9,
        };
      })
    );
  }, []);

  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = (data[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / data.length);
    const level = Math.min(1, rms * 4.5);
    setEnergy(level * 100);
    energyHistRef.current.push(level * 100);
    if (level < 0.06) silenceRef.current += 1 / 60;
    updateAudienceReaction(level);
    if (running) setElapsed((performance.now() - startRef.current) / 1000);
    rafRef.current = requestAnimationFrame(tick);
  }, [running, updateAudienceReaction]);

  const startMic = async () => {
    setError(null);
    setSummary(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;
      setListening(true);
      energyHistRef.current = [];
      silenceRef.current = 0;
      startRef.current = performance.now();
      setRunning(true);
      setElapsed(0);
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError("دسترسی به میکروفون ممکن نشد.");
    }
  };

  const stopSession = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    audioCtxRef.current?.close().catch(() => undefined);
    audioCtxRef.current = null;
    analyserRef.current = null;
    setListening(false);
    setRunning(false);
    const hist = energyHistRef.current;
    const duration = Math.max(0, (performance.now() - startRef.current) / 1000);
    if (hist.length > 5) {
      const avg = hist.reduce((a, b) => a + b, 0) / hist.length;
      const peak = Math.max(...hist);
      const engagedRatio = hist.filter((v) => v > 22).length / hist.length;
      const engagement = Math.round(engagedRatio * 70 + Math.min(30, avg * 0.3));
      setSummary({
        avg: Math.round(avg * 10) / 10,
        peak: Math.round(peak * 10) / 10,
        engagement,
        silence: Math.round(silenceRef.current * 10) / 10,
        duration: Math.round(duration * 10) / 10,
      });
    }
    setPeople((prev) => prev.map((p) => ({ ...p, state: "idle" })));
    setEnergy(0);
  };

  const enterImmersive = async () => {
    setImmersive(true);
    const el = stageRef.current;
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        /* ignore */
      }
    }
  };

  const tryWebXr = async () => {
    setError(null);
    if (!navigator.xr) {
      setError("این مرورگر WebXR را پشتیبانی نمی‌کند. از حالت تمام‌صفحه استفاده کنید.");
      return;
    }
    try {
      const ok = await navigator.xr.isSessionSupported("immersive-vr");
      if (!ok) {
        setError("هدست VR متصل/پشتیبانی‌شده نیست. حالت immersive (تمام‌صفحه) در دسترس است.");
        await enterImmersive();
        return;
      }
      // جلسه کوتاه برای اثبات پشتیبانی — صحنه سه‌بعدی کامل هدست نیاز به Three.js/WebGL دارد
      setError("VR پشتیبانی می‌شود. برای رندر کامل داخل هدست، مرحله بعد می‌تواند Three.js باشد. فعلاً حالت immersive فعال شد.");
      await enterImmersive();
    } catch {
      setError("ورود به VR ممکن نشد.");
    }
  };

  const save = async () => {
    if (!summary) return;
    setSaving(true);
    try {
      await audienceService.save({
        duration_seconds: summary.duration,
        avg_energy: summary.avg,
        peak_energy: summary.peak,
        engagement_score: summary.engagement,
        silence_seconds: summary.silence,
        audience_size: size,
        mode: immersive ? "immersive" : "standard",
      });
      qc.invalidateQueries({ queryKey: ["audience", "sessions"] });
    } catch {
      setError("ذخیره جلسه ممکن نشد.");
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(() => {
    const map = new Map<number, Person[]>();
    for (const p of people) {
      const list = map.get(p.row) || [];
      list.push(p);
      map.set(p.row, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [people]);

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-6 pb-12">
          <Link href="/practice" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--foreground)] inline-flex items-center gap-1">
            <ArrowRight className="w-4 h-4" /> استودیو تمرین
          </Link>

          <header className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-[#8b5cf6]/15 text-[#c4b5fd]">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">مخاطب مجازی</h1>
                <p className="text-sm text-[var(--foreground)]/60 mt-1">
                  برای حضار صحبت کنید؛ انرژی صدای شما واکنش آن‌ها را تغییر می‌دهد. مناسب تمرین حضور صحنه قبل از ارائه واقعی.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={size}
                disabled={running}
                onChange={(e) => setSize(Number(e.target.value))}
                className="rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm"
              >
                <option value={6}>۶ نفر</option>
                <option value={12}>۱۲ نفر</option>
                <option value={18}>۱۸ نفر</option>
                <option value={24}>۲۴ نفر</option>
              </select>
              <Button variant="secondary" onClick={enterImmersive} className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4" /> تمام‌صفحه
              </Button>
              <Button variant="secondary" onClick={tryWebXr} className="flex items-center gap-1">
                <Glasses className="w-4 h-4" /> VR {xrSupported ? "✓" : ""}
              </Button>
            </div>
          </header>

          <div
            ref={stageRef}
            className={`relative rounded-[2rem] overflow-hidden border border-white/10 ${
              immersive ? "min-h-[100vh] rounded-none" : "min-h-[420px]"
            }`}
            style={{
              background: "radial-gradient(ellipse at center top, #1a1030 0%, #0b0f1a 55%, #05070d 100%)",
              perspective: "900px",
            }}
          >
            {/* سقف نور صحنه */}
            <div
              className="absolute inset-x-0 top-0 h-32 pointer-events-none opacity-60"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, rgba(139,92,246,${0.15 + energy / 400}) 0%, transparent 70%)`,
              }}
            />

            {/* صحنه سخنران (پایین) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-center">
              <div
                className="mx-auto mb-2 h-1.5 rounded-full bg-white/10 overflow-hidden"
                style={{ width: 160 }}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#10b981] transition-all duration-100"
                  style={{ width: `${Math.min(100, energy)}%` }}
                />
              </div>
              <div className="text-xs text-white/50">
                {running ? `انرژی صدا: ${toPersianNumber(Math.round(energy))}٪ · ${toPersianNumber(Math.round(elapsed))}ث` : "میکروفون را روشن کنید و صحبت کنید"}
              </div>
            </div>

            {/* ردیف‌های حضار */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center pt-8 pb-24"
              style={{ transformStyle: "preserve-3d" }}
            >
              {rows.map(([rowIdx, rowPeople]) => (
                <div
                  key={rowIdx}
                  className="flex items-end justify-center gap-2 md:gap-3 mb-3 md:mb-4"
                  style={{
                    transform: `translateZ(${-rowIdx * 40}px) scale(${1 - rowIdx * 0.08})`,
                    opacity: 1 - rowIdx * 0.08,
                  }}
                >
                  {rowPeople.map((p) => (
                    <AudienceAvatar key={p.id} person={p} />
                  ))}
                </div>
              ))}
            </div>

            {immersive && (
              <button
                type="button"
                className="absolute top-4 left-4 z-30 text-xs bg-black/50 px-3 py-1.5 rounded-lg text-white/80"
                onClick={() => {
                  setImmersive(false);
                  if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
                }}
              >
                خروج از تمام‌صفحه
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {!listening ? (
              <Button onClick={startMic} className="flex items-center gap-2">
                <Mic className="w-4 h-4" /> شروع تمرین با میکروفون
              </Button>
            ) : (
              <Button variant="secondary" onClick={stopSession} className="flex items-center gap-2">
                <MicOff className="w-4 h-4" /> پایان جلسه
              </Button>
            )}
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}

          {summary && (
            <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-6 space-y-3">
              <h2 className="font-bold text-lg">خلاصه جلسه</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <Stat label="مدت" value={`${toPersianNumber(summary.duration)} ث`} />
                <Stat label="میانگین انرژی" value={`${toPersianNumber(summary.avg)}٪`} />
                <Stat label="اوج انرژی" value={`${toPersianNumber(summary.peak)}٪`} />
                <Stat label="امتیاز تعامل" value={toPersianNumber(summary.engagement)} />
              </div>
              <p className="text-xs text-[var(--foreground)]/50">
                سکوت تقریبی: {toPersianNumber(summary.silence)} ثانیه
                {summary.engagement >= 70
                  ? " — تعامل حضار خوب بود."
                  : " — با صدای رساتر و تنوع آهنگ، واکنش حضار قوی‌تر می‌شود."}
              </p>
              <Button onClick={save} disabled={saving} className="flex items-center gap-2">
                <Save className="w-4 h-4" /> {saving ? "…" : "ذخیره جلسه"}
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-bold">جلسات اخیر</h3>
            {!history?.length && <p className="text-xs text-[var(--foreground)]/40">هنوز جلسه‌ای ذخیره نشده.</p>}
            {history?.slice(0, 5).map((h) => (
              <div key={h.id} className="flex justify-between text-xs rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <span>{toPersianNumber(Math.round(h.duration_seconds))}ث · {toPersianNumber(h.audience_size)} نفر</span>
                <span className="text-[#10b981] font-bold">{toPersianNumber(Math.round(h.engagement_score))}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-[var(--foreground)]/35 leading-relaxed">
            این نسخه مخاطب مجازی ۲.۵بعدی واکنش‌گر به صدا است. رندر کامل داخل هدست VR (WebXR + مدل سه‌بعدی) می‌تواند در مرحله بعد با Three.js گسترش یابد.
            دکمه VR در صورت پشتیبانی مرورگر/هدست، حالت immersive را فعال می‌کند.
          </p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function AudienceAvatar({ person }: { person: Person }) {
  const scale =
    person.state === "clap" ? 1.08 : person.state === "engaged" ? 1.04 : person.state === "bored" ? 0.96 : 1;
  const y =
    person.state === "clap" ? -6 : person.state === "engaged" ? -3 * person.nod : person.state === "bored" ? 4 : 0;
  const opacity = person.state === "bored" ? 0.55 : 1;

  return (
    <div
      className="flex flex-col items-center transition-transform duration-200"
      style={{ transform: `translateY(${y}px) scale(${scale})`, opacity }}
    >
      <div
        className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-white/20 shadow-lg flex items-center justify-center text-sm"
        style={{
          background: `linear-gradient(145deg, hsl(${person.hue} 45% 42%), hsl(${person.hue} 35% 22%))`,
        }}
      >
        {person.state === "clap" ? "👏" : person.state === "bored" ? "😐" : person.state === "engaged" ? "🙂" : "👤"}
      </div>
      <div className="w-8 h-6 md:w-10 md:h-7 mt-0.5 rounded-t-lg bg-white/10 border border-white/10" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-[var(--foreground)]/50 text-xs mb-1">{label}</div>
      <div className="font-bold">{value}</div>
    </div>
  );
}
