/**
 * تحلیل سمت‌مرورگر برای حضور چهره و تقریب تماس چشمی.
 * موتور: FaceDetector (Chrome/Edge) در صورت پشتیبانی؛ در غیر این صورت تخمین ساده‌تر مبتنی بر ناحیه مرکزی.
 * تماس چشمی واقعی نیاز به مدل gaze دارد؛ اینجا از مرکز صورت در ناحیه مرکزی کادر به‌عنوان پروکسی استفاده می‌شود.
 */

export type FrameSample = {
  t: number;
  face: boolean;
  eyeContact: boolean;
  cx?: number;
  cy?: number;
};

export type VideoMetrics = {
  durationSeconds: number;
  framesSampled: number;
  facePresencePct: number;
  eyeContactPct: number;
  lookingAwayPct: number;
  stabilityScore: number;
  overallScore: number;
  engine: string;
  tips: string[];
  timeline: FrameSample[];
};

type FaceBox = { x: number; y: number; width: number; height: number };

function getFaceDetector(): { detect: (src: ImageBitmap | HTMLCanvasElement | HTMLVideoElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>> } | null {
  const FD = (window as unknown as { FaceDetector?: new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => unknown }).FaceDetector;
  if (!FD) return null;
  try {
    return new FD({ fastMode: true, maxDetectedFaces: 1 }) as {
      detect: (src: ImageBitmap | HTMLCanvasElement | HTMLVideoElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  } catch {
    return null;
  }
}

/** تخمین بسیار ساده بدون مدل: تراکم پیکسل پوست در ناحیه مرکزی */
function heuristicCenterFace(ctx: CanvasRenderingContext2D, w: number, h: number): FaceBox | null {
  const sx = Math.floor(w * 0.25);
  const sy = Math.floor(h * 0.15);
  const sw = Math.floor(w * 0.5);
  const sh = Math.floor(h * 0.55);
  const data = ctx.getImageData(sx, sy, sw, sh).data;
  let skin = 0;
  const step = 16;
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // قانون ساده پوست
    if (r > 95 && g > 40 && b > 20 && r > g && r > b && Math.abs(r - g) > 15) skin++;
  }
  const samples = Math.max(1, Math.floor(data.length / (4 * step)));
  const ratio = skin / samples;
  if (ratio < 0.08) return null;
  return { x: sx, y: sy, width: sw, height: sh };
}

function isEyeContact(box: FaceBox, frameW: number, frameH: number): boolean {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  // ناحیه مرکزی افقی و کمی بالاتر از وسط عمودی (نگاه به دوربین)
  const inX = cx > frameW * 0.3 && cx < frameW * 0.7;
  const inY = cy > frameH * 0.2 && cy < frameH * 0.55;
  // صورت نباید خیلی کوچک یا خیلی بزرگ باشد
  const area = (box.width * box.height) / (frameW * frameH);
  const sizeOk = area > 0.04 && area < 0.45;
  return inX && inY && sizeOk;
}

function buildTips(m: Omit<VideoMetrics, "tips" | "timeline">): string[] {
  const tips: string[] = [];
  if (m.facePresencePct < 70) tips.push("چهره‌تان در بخش زیادی از ویدیو در کادر نبود؛ دوربین را روبه‌رو و در سطح چشم قرار دهید.");
  if (m.eyeContactPct < 50) tips.push("تماس چشمی با دوربین کم بود؛ به لنز دوربین نگاه کنید، نه به تصویر خودتان روی صفحه.");
  if (m.lookingAwayPct > 40) tips.push("نگاه به اطراف زیاد تکرار شده؛ یک نقطه ثابت نزدیک لنز انتخاب کنید.");
  if (m.stabilityScore < 50) tips.push("سر یا دوربین زیاد تکان خورده؛ موقعیت نشستن را ثابت‌تر کنید.");
  if (m.eyeContactPct >= 70 && m.facePresencePct >= 80) tips.push("حضور چهره و جهت نگاه خوب بود؛ روی تداوم همین حالت در جملات طولانی کار کنید.");
  if (tips.length === 0) tips.push("عملکرد قابل قبول است؛ برای بهبود بیشتر، بخش‌های نگاه‌دور را در بازپخش پیدا و تکرار کنید.");
  return tips;
}

function overallFrom(face: number, eye: number, stability: number): number {
  return Math.round(face * 0.35 + eye * 0.45 + stability * 0.2);
}

export async function analyzeVideoElement(
  video: HTMLVideoElement,
  opts?: { intervalMs?: number; maxFrames?: number }
): Promise<VideoMetrics> {
  const intervalMs = opts?.intervalMs ?? 250;
  const maxFrames = opts?.maxFrames ?? 240;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas پشتیبانی نمی‌شود.");

  const detector = getFaceDetector();
  const engine = detector ? "FaceDetector" : "heuristic-center";

  // ensure metadata
  if (video.readyState < 1) {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("بارگذاری ویدیو ناموفق"));
    });
  }

  const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
  const samples: FrameSample[] = [];
  const positions: Array<{ x: number; y: number }> = [];

  const targetFrames = duration > 0
    ? Math.min(maxFrames, Math.max(8, Math.floor((duration * 1000) / intervalMs)))
    : Math.min(maxFrames, 40);

  for (let i = 0; i < targetFrames; i++) {
    const t = duration > 0 ? (i / Math.max(1, targetFrames - 1)) * duration : i * (intervalMs / 1000);
    video.currentTime = Math.min(t, Math.max(0, duration - 0.05));
    await new Promise<void>((resolve) => {
      const onSeek = () => {
        video.removeEventListener("seeked", onSeek);
        resolve();
      };
      video.addEventListener("seeked", onSeek);
      // fallback
      setTimeout(resolve, 120);
    });

    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    let box: FaceBox | null = null;
    if (detector) {
      try {
        const faces = await detector.detect(canvas);
        if (faces[0]) {
          const b = faces[0].boundingBox;
          box = { x: b.x, y: b.y, width: b.width, height: b.height };
        }
      } catch {
        box = heuristicCenterFace(ctx, w, h);
      }
    } else {
      box = heuristicCenterFace(ctx, w, h);
    }

    const face = !!box;
    const eye = box ? isEyeContact(box, w, h) : false;
    if (box) positions.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
    samples.push({ t, face, eyeContact: eye, cx: box ? box.x + box.width / 2 : undefined, cy: box ? box.y + box.height / 2 : undefined });
  }

  const n = samples.length || 1;
  const faceN = samples.filter((s) => s.face).length;
  const eyeN = samples.filter((s) => s.eyeContact).length;
  const facePresencePct = (faceN / n) * 100;
  const eyeContactPct = (eyeN / n) * 100;
  const lookingAwayPct = faceN > 0 ? ((faceN - eyeN) / n) * 100 : 100 - facePresencePct;

  let stabilityScore = 70;
  if (positions.length >= 3) {
    const meanX = positions.reduce((a, p) => a + p.x, 0) / positions.length;
    const meanY = positions.reduce((a, p) => a + p.y, 0) / positions.length;
    const varSum = positions.reduce((a, p) => a + (p.x - meanX) ** 2 + (p.y - meanY) ** 2, 0) / positions.length;
    const norm = Math.sqrt(varSum) / (video.videoWidth || 640);
    stabilityScore = Math.max(0, Math.min(100, 100 - norm * 400));
  }

  const base = {
    durationSeconds: duration || samples.length * (intervalMs / 1000),
    framesSampled: samples.length,
    facePresencePct: Math.round(facePresencePct * 10) / 10,
    eyeContactPct: Math.round(eyeContactPct * 10) / 10,
    lookingAwayPct: Math.round(lookingAwayPct * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    overallScore: 0,
    engine,
  };
  base.overallScore = overallFrom(base.facePresencePct, base.eyeContactPct, base.stabilityScore);

  return {
    ...base,
    tips: buildTips(base),
    timeline: samples,
  };
}

/** تحلیل زنده روی استریم وب‌کم (چند ثانیه) */
export async function analyzeLiveStream(
  video: HTMLVideoElement,
  durationMs: number,
  onTick?: (partial: { face: boolean; eyeContact: boolean; elapsedMs: number }) => void
): Promise<VideoMetrics> {
  const detector = getFaceDetector();
  const engine = detector ? "FaceDetector-live" : "heuristic-live";
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas پشتیبانی نمی‌شود.");

  const samples: FrameSample[] = [];
  const positions: Array<{ x: number; y: number }> = [];
  const interval = 200;
  const start = performance.now();

  while (performance.now() - start < durationMs) {
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    if (w > 0 && h > 0) {
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);
      let box: FaceBox | null = null;
      if (detector) {
        try {
          const faces = await detector.detect(canvas);
          if (faces[0]) {
            const b = faces[0].boundingBox;
            box = { x: b.x, y: b.y, width: b.width, height: b.height };
          }
        } catch {
          box = heuristicCenterFace(ctx, w, h);
        }
      } else {
        box = heuristicCenterFace(ctx, w, h);
      }
      const face = !!box;
      const eye = box ? isEyeContact(box, w, h) : false;
      if (box) positions.push({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
      const elapsed = performance.now() - start;
      samples.push({ t: elapsed / 1000, face, eyeContact: eye });
      onTick?.({ face, eyeContact: eye, elapsedMs: elapsed });
    }
    await new Promise((r) => setTimeout(r, interval));
  }

  const n = samples.length || 1;
  const faceN = samples.filter((s) => s.face).length;
  const eyeN = samples.filter((s) => s.eyeContact).length;
  const facePresencePct = (faceN / n) * 100;
  const eyeContactPct = (eyeN / n) * 100;
  const lookingAwayPct = Math.max(0, 100 - eyeContactPct);
  let stabilityScore = 70;
  if (positions.length >= 3) {
    const meanX = positions.reduce((a, p) => a + p.x, 0) / positions.length;
    const meanY = positions.reduce((a, p) => a + p.y, 0) / positions.length;
    const varSum = positions.reduce((a, p) => a + (p.x - meanX) ** 2 + (p.y - meanY) ** 2, 0) / positions.length;
    const norm = Math.sqrt(varSum) / (video.videoWidth || 640);
    stabilityScore = Math.max(0, Math.min(100, 100 - norm * 400));
  }
  const base = {
    durationSeconds: durationMs / 1000,
    framesSampled: samples.length,
    facePresencePct: Math.round(facePresencePct * 10) / 10,
    eyeContactPct: Math.round(eyeContactPct * 10) / 10,
    lookingAwayPct: Math.round(lookingAwayPct * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    overallScore: 0,
    engine,
  };
  base.overallScore = overallFrom(base.facePresencePct, base.eyeContactPct, base.stabilityScore);
  return { ...base, tips: buildTips(base), timeline: samples };
}
