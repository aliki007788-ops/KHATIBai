import type { VocabItem } from "./iraqi";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type QuizKind = "iq2fa" | "fa2iq" | "cloze";

export interface QuizQuestion {
  kind: QuizKind;
  prompt: string; // متن سؤال
  hint?: string; // ترجمه‌ی فارسی جمله (فقط cloze)
  options: string[];
  answer: string;
  word: VocabItem;
  /** گزینه‌ها عراقی‌اند (راست‌به‌چپ و درشت) */
  optionsAreIraqi: boolean;
}

function pickDistractors(all: VocabItem[], word: VocabItem, field: "iq" | "fa", n = 3): string[] {
  const seen = new Set<string>([word[field]]);
  const out: string[] = [];
  for (const v of shuffle(all)) {
    const val = v[field];
    if (!val || seen.has(val)) continue;
    // گزینه‌ی اشتباه نباید معنای یکسانی با پاسخ درست داشته باشد
    if (field === "iq" && v.fa === word.fa) continue;
    seen.add(val);
    out.push(val);
    if (out.length === n) break;
  }
  return out;
}

/** آزمون ۸ سؤالی از واژگان همان سناریو؛ بدون نیاز به محتوای جدید. */
export function buildQuiz(vocab: VocabItem[], count = 8): QuizQuestion[] {
  const usable = vocab.filter((v) => v.iq && v.fa);
  if (usable.length < 4) return [];
  const picked = shuffle(usable).slice(0, Math.min(count, usable.length));
  const kinds: QuizKind[] = ["iq2fa", "fa2iq", "cloze"];

  return picked.map((word, i) => {
    let kind = kinds[i % kinds.length];
    const canCloze = !!word.example_iq && word.example_iq.includes(word.iq) && word.iq.length > 2;
    if (kind === "cloze" && !canCloze) kind = i % 2 === 0 ? "iq2fa" : "fa2iq";

    if (kind === "iq2fa") {
      const opts = shuffle([word.fa, ...pickDistractors(usable, word, "fa")]);
      return { kind, prompt: word.iq, options: opts, answer: word.fa, word, optionsAreIraqi: false };
    }
    if (kind === "fa2iq") {
      const opts = shuffle([word.iq, ...pickDistractors(usable, word, "iq")]);
      return { kind, prompt: word.fa, options: opts, answer: word.iq, word, optionsAreIraqi: true };
    }
    const opts = shuffle([word.iq, ...pickDistractors(usable, word, "iq")]);
    return {
      kind,
      prompt: (word.example_iq as string).replace(word.iq, "_____"),
      hint: word.example_fa,
      options: opts,
      answer: word.iq,
      word,
      optionsAreIraqi: true,
    };
  });
}

/* ───── ذخیره‌ی محلی (فقط روی همین دستگاه): واژه‌های مشکل‌دار و بهترین نتیجه ───── */

const MISSED_KEY = "khatib_iq_missed_v1";
const BEST_KEY = "khatib_iq_quiz_best_v1";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* حافظه‌ی مرورگر در دسترس نیست؛ بی‌صدا نادیده گرفته می‌شود */
  }
}

export function getMissed(scenarioId: string): string[] {
  return read<Record<string, string[]>>(MISSED_KEY, {})[scenarioId] ?? [];
}
export function setMissed(scenarioId: string, words: string[]) {
  const all = read<Record<string, string[]>>(MISSED_KEY, {});
  if (words.length) all[scenarioId] = Array.from(new Set(words));
  else delete all[scenarioId];
  write(MISSED_KEY, all);
}
export function getBest(scenarioId: string): number | null {
  const v = read<Record<string, number>>(BEST_KEY, {})[scenarioId];
  return typeof v === "number" ? v : null;
}
export function saveBest(scenarioId: string, pct: number) {
  const all = read<Record<string, number>>(BEST_KEY, {});
  if (pct > (all[scenarioId] ?? -1)) {
    all[scenarioId] = pct;
    write(BEST_KEY, all);
  }
}
