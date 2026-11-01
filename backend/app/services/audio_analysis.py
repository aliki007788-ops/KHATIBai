"""
تحلیل صوتی واقعی با librosa (گزینه B).

این ماژول کاملاً مستقل از GPT است و باید قبل از فراخوانی GPT اجرا شود.
اگر librosa یا فایل صوتی قابل پردازش نباشد، به‌جای کرش کردن کل فرآیند
تحلیل، مقدار None برمی‌گرداند و خطا را لاگ می‌کند — تحلیل متنی (گزینه A)
باید مستقل از این بخش کار کند.
"""
from __future__ import annotations

import logging

logger = logging.getLogger("khatib.audio_analysis")

# مکث‌های کوتاه (ثانیه) که به‌عنوان نشانه تنفس در نظر گرفته می‌شوند
_BREATH_PAUSE_MIN = 0.2
_BREATH_PAUSE_MAX = 0.5
# مکث‌هایی طولانی‌تر از این آستانه به‌عنوان «مکث گفتاری» شمرده می‌شوند
_PAUSE_THRESHOLD_SEC = 0.5


def compute_audio_metrics(file_path: str, transcript: str | None = None) -> dict | None:
    """
    از روی waveform یک فایل صوتی، معیارهای زیر را محاسبه می‌کند:
    duration_sec, word_count, speech_rate_wpm, pause_count,
    avg_pause_duration_sec, breathing_rate_per_min, silence_ratio,
    energy_mean, energy_std, pitch_mean_hz, pitch_variation.

    در صورت هر خطایی (librosa نصب نیست، فایل خراب است، و...) None
    برمی‌گرداند تا پردازش اصلی speech متوقف نشود.
    """
    try:
        import numpy as np
        import librosa
    except ImportError:
        logger.warning("librosa/numpy در دسترس نیست؛ تحلیل صوتی (گزینه B) رد شد.")
        return None

    try:
        y, sr = librosa.load(file_path, sr=None, mono=True)
        if y is None or len(y) == 0:
            return None

        duration_sec = float(librosa.get_duration(y=y, sr=sr))
        if duration_sec <= 0:
            return None

        # --- کلمات و سرعت گفتار ---
        word_count = len(transcript.split()) if transcript else 0
        speech_rate_wpm = (word_count / (duration_sec / 60.0)) if duration_sec > 0 else 0.0

        # --- تشخیص سکوت/گفتار برای مکث و تنفس ---
        intervals = librosa.effects.split(y, top_db=30)  # بازه‌های غیرساکت [start, end] به sample
        pause_durations: list[float] = []
        breath_count = 0
        total_voiced_sec = 0.0

        for i, (start, end) in enumerate(intervals):
            total_voiced_sec += (end - start) / sr
            if i > 0:
                prev_end = intervals[i - 1][1]
                gap_sec = (start - prev_end) / sr
                if gap_sec >= _PAUSE_THRESHOLD_SEC:
                    pause_durations.append(gap_sec)
                elif _BREATH_PAUSE_MIN <= gap_sec < _BREATH_PAUSE_MAX:
                    breath_count += 1

        pause_count = len(pause_durations)
        avg_pause_duration_sec = (sum(pause_durations) / pause_count) if pause_count else 0.0
        silence_sec = max(0.0, duration_sec - total_voiced_sec)
        silence_ratio = silence_sec / duration_sec if duration_sec > 0 else 0.0
        breathing_rate_per_min = breath_count / (duration_sec / 60.0) if duration_sec > 0 else 0.0

        # --- انرژی (RMS) ---
        rms = librosa.feature.rms(y=y)[0]
        energy_mean = float(np.mean(rms)) if len(rms) else 0.0
        energy_std = float(np.std(rms)) if len(rms) else 0.0

        # --- Pitch (فرکانس پایه) ---
        pitch_mean_hz = 0.0
        pitch_variation = 0.0
        try:
            f0 = librosa.yin(y, fmin=60, fmax=400, sr=sr)
            voiced = f0[(f0 > 0) & ~np.isnan(f0)]
            if len(voiced):
                pitch_mean_hz = float(np.mean(voiced))
                pitch_variation = float(np.std(voiced) / pitch_mean_hz) if pitch_mean_hz > 0 else 0.0
        except Exception:
            logger.warning("محاسبه pitch با librosa.yin ناموفق بود؛ از مقدار صفر استفاده می‌شود.")

        return {
            "duration_sec": round(duration_sec, 2),
            "word_count": word_count,
            "speech_rate_wpm": round(speech_rate_wpm, 1),
            "pause_count": pause_count,
            "avg_pause_duration_sec": round(avg_pause_duration_sec, 2),
            "breathing_rate_per_min": round(breathing_rate_per_min, 1),
            "silence_ratio": round(silence_ratio, 3),
            "energy_mean": round(energy_mean, 4),
            "energy_std": round(energy_std, 4),
            "pitch_mean_hz": round(pitch_mean_hz, 1),
            "pitch_variation": round(pitch_variation, 3),
        }
    except Exception:
        logger.exception("تحلیل صوتی librosa با خطا مواجه شد؛ گزینه B نادیده گرفته شد.")
        return None
