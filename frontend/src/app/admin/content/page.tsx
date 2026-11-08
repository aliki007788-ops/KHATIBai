"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { toPersianNumber } from "@/lib/utils/number";
import { CATEGORY_FA } from "@/features/learning/iraqi";
import {
  useAdminLevels,
  useAdminScenario,
  useAdminScenarios,
  useAdminVocab,
  useUpdateScenario,
  type AdminScenarioFull,
} from "@/features/learning/adminContent";
import { BookOpen, Languages, MessageSquare, Search, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tab = "levels" | "scenarios" | "vocabulary";

const inputCls =
  "w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[#8b5cf6]";
const selectCls = inputCls + " [&>option]:bg-[var(--background)] [&>option]:text-[var(--foreground)]";
const panel = "rounded-3xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 md:p-6";

const lines = (v: string[]) => v.join("\n");
const unlines = (v: string) => v.split("\n").map((x) => x.trim()).filter(Boolean);

function ScenarioEditor({ id, onClose }: { id: string; onClose: () => void }) {
  const { data, isLoading, isError, refetch } = useAdminScenario(id);
  const save = useUpdateScenario();
  const [f, setF] = useState<AdminScenarioFull | null>(null);

  useEffect(() => {
    if (data) setF(structuredClone(data));
  }, [data]);

  const set = <K extends keyof AdminScenarioFull>(k: K, v: AdminScenarioFull[K]) => setF((p) => (p ? { ...p, [k]: v } : p));

  const submit = () => {
    if (!f) return;
    save.mutate({
      id,
      data: {
        title_fa: f.title_fa,
        title_iq: f.title_iq ?? "",
        situation: f.situation ?? undefined,
        practice_prompt: f.practice_prompt,
        objectives: f.objectives,
        success_criteria: f.success_criteria,
        common_mistakes: f.common_mistakes,
        cultural_note: f.cultural_note ?? "",
        key_vocabulary: f.key_vocabulary.filter((v) => v.iq.trim() && v.fa.trim()),
        model_dialogue: f.model_dialogue,
        difficulty: f.difficulty ?? undefined,
        estimated_minutes: f.estimated_minutes ?? undefined,
        active: f.active,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto bg-black/60 p-4">
      <div className="my-6 h-fit w-full max-w-3xl rounded-3xl border border-[var(--border-color)] bg-[var(--background)] p-5 md:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">ویرایش سناریو {f?.slug && <span className="text-sm font-normal text-[var(--foreground)]/50" dir="ltr">({f.slug})</span>}</h2>
          <button onClick={onClose} aria-label="بستن" className="rounded-lg p-1.5 hover:bg-[var(--foreground)]/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading && <Skeleton className="h-64" />}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {f && (
          <div className="space-y-4 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
              <span>فعال (برای کاربران نمایش داده شود)</span>
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">عنوان فارسی</span>
                <input className={inputCls} value={f.title_fa} onChange={(e) => set("title_fa", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">عنوان عراقی</span>
                <input className={inputCls} dir="rtl" value={f.title_iq ?? ""} onChange={(e) => set("title_iq", e.target.value)} />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">سختی (۱ تا ۵)</span>
                <input type="number" min={1} max={5} className={inputCls} value={f.difficulty ?? 1} onChange={(e) => set("difficulty", Number(e.target.value))} />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">زمان تقریبی (دقیقه)</span>
                <input type="number" min={1} max={60} className={inputCls} value={f.estimated_minutes ?? 8} onChange={(e) => set("estimated_minutes", Number(e.target.value))} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--foreground)]/55">موقعیت</span>
              <textarea rows={4} className={inputCls} value={f.situation ?? ""} onChange={(e) => set("situation", e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--foreground)]/55">جمله‌ی شروع مربی (عراقی + ترجمه + وظیفه)</span>
              <textarea rows={4} className={inputCls} value={f.practice_prompt} onChange={(e) => set("practice_prompt", e.target.value)} />
            </label>
            <div className="grid gap-3 md:grid-cols-3">
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">هدف‌ها (هر خط یکی)</span>
                <textarea rows={6} className={inputCls} value={lines(f.objectives)} onChange={(e) => set("objectives", unlines(e.target.value))} />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">معیار موفقیت (هر خط یکی)</span>
                <textarea rows={6} className={inputCls} value={lines(f.success_criteria)} onChange={(e) => set("success_criteria", unlines(e.target.value))} />
              </label>
              <label>
                <span className="mb-1 block text-xs text-[var(--foreground)]/55">اشتباه‌های رایج (هر خط یکی)</span>
                <textarea rows={6} className={inputCls} value={lines(f.common_mistakes)} onChange={(e) => set("common_mistakes", unlines(e.target.value))} />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-xs text-[var(--foreground)]/55">نکته‌ی فرهنگی</span>
              <textarea rows={3} className={inputCls} value={f.cultural_note ?? ""} onChange={(e) => set("cultural_note", e.target.value)} />
            </label>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-[var(--foreground)]/55">واژگان ({toPersianNumber(f.key_vocabulary.length)})</span>
                <Button size="sm" variant="glass" onClick={() => set("key_vocabulary", [...f.key_vocabulary, { iq: "", fa: "", example_iq: "", example_fa: "" }])}>
                  + واژه
                </Button>
              </div>
              <div className="space-y-2">
                {f.key_vocabulary.map((v, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border border-[var(--border-color)] p-2 md:grid-cols-[1fr_1fr_1.4fr_1.4fr_auto]">
                    {(["iq", "fa", "example_iq", "example_fa"] as const).map((k) => (
                      <input
                        key={k}
                        className={cn(inputCls, k.endsWith("iq") && "text-right")}
                        dir={k.endsWith("iq") ? "rtl" : undefined}
                        placeholder={{ iq: "عراقی", fa: "فارسی", example_iq: "مثال عراقی", example_fa: "مثال فارسی" }[k]}
                        value={v[k] ?? ""}
                        onChange={(e) => set("key_vocabulary", f.key_vocabulary.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)))}
                      />
                    ))}
                    <button onClick={() => set("key_vocabulary", f.key_vocabulary.filter((_, j) => j !== i))} className="px-2 text-red-400" aria-label="حذف">
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {f.needs_review.length > 0 && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-amber-500">
                <div className="mb-1 font-medium">عبارت‌هایی که نیاز به تأیید بومی‌زبان دارند:</div>
                <div dir="rtl" className="leading-6">{f.needs_review.join(" · ")}</div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="glass" onClick={onClose}>
                بستن
              </Button>
              <Button loading={save.isPending} onClick={submit}>
                ذخیره
              </Button>
            </div>
            <p className="text-xs text-[var(--foreground)]/45">
              سناریوی ویرایش‌شده با اجرای دوباره‌ی seed بازنویسی نمی‌شود (مگر با <span dir="ltr">--overwrite</span>). دیالوگ نمونه در این فرم قابل ویرایش نیست.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("levels");
  const [levelCode, setLevelCode] = useState("");
  const [q, setQ] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [vq, setVq] = useState("");
  const [vOffset, setVOffset] = useState(0);

  const levels = useAdminLevels();
  const scenarios = useAdminScenarios(levelCode, q, showInactive);
  const vocab = useAdminVocab(vq, levelCode, vOffset);
  const toggle = useUpdateScenario();

  useEffect(() => setVOffset(0), [vq, levelCode]);

  const tabs = [
    { id: "levels" as const, label: "سطوح یادگیری", icon: BookOpen },
    { id: "scenarios" as const, label: "سناریوها", icon: MessageSquare },
    { id: "vocabulary" as const, label: "واژگان عراقی", icon: Languages },
  ];

  const LevelSelect = (
    <select className={selectCls + " md:max-w-[220px]"} value={levelCode} onChange={(e) => setLevelCode(e.target.value)}>
      <option value="">همه‌ی سطح‌ها</option>
      {(levels.data ?? []).map((l) => (
        <option key={l.id} value={l.code}>
          {l.name_fa}
        </option>
      ))}
    </select>
  );

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar role="admin" />
        <div className="flex-1 overflow-x-hidden p-6 md:p-8">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-l from-[#8b5cf6] to-[#10b981] bg-clip-text text-3xl font-bold text-transparent">مدیریت محتوا</h1>
              <p className="mt-1 text-[var(--foreground)]/50">سطوح، سناریوها و واژگان آموزش عراقی؛ همه از دیتابیس واقعی و قابل ویرایش</p>
            </div>
            <ThemeToggle />
          </header>

          <div className="mb-6 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.id ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-[#a78bfa]" : "border-[var(--border-color)] hover:bg-[var(--foreground)]/5"
                )}
              >
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          {tab === "levels" && (
            <div className={panel}>
              {levels.isLoading && <Skeleton className="h-48" />}
              {levels.isError && <ErrorState onRetry={() => levels.refetch()} />}
              {levels.data && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="border-b border-[var(--border-color)] text-[var(--foreground)]/55">
                      <tr>
                        <th className="p-3 font-medium">سطح</th>
                        <th className="p-3 font-medium">توضیح</th>
                        <th className="p-3 font-medium">فعال</th>
                        <th className="p-3 font-medium">غیرفعال</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/60">
                      {levels.data.map((l) => (
                        <tr key={l.id}>
                          <td className="p-3 font-semibold">{l.name_fa}</td>
                          <td className="p-3 text-[var(--foreground)]/60">{l.description_fa}</td>
                          <td className="p-3 text-[#10b981]">{toPersianNumber(l.active_count)}</td>
                          <td className="p-3 text-[var(--foreground)]/50">{toPersianNumber(l.inactive_count)}</td>
                          <td className="p-3">
                            <Button size="sm" variant="glass" onClick={() => { setLevelCode(l.code); setTab("scenarios"); }}>
                              سناریوها
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "scenarios" && (
            <div className={panel}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {LevelSelect}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[var(--foreground)]/40" />
                  <input className={inputCls + " pr-9"} placeholder="جستجوی عنوان یا کد (مثلاً a2-005)" value={q} onChange={(e) => setQ(e.target.value)} />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} /> نمایش غیرفعال‌ها
                </label>
              </div>
              {scenarios.isLoading && <Skeleton className="h-64" />}
              {scenarios.isError && <ErrorState onRetry={() => scenarios.refetch()} />}
              {scenarios.data && scenarios.data.length === 0 && <p className="py-8 text-center text-sm text-[var(--foreground)]/45">سناریویی پیدا نشد.</p>}
              {scenarios.data && scenarios.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead className="border-b border-[var(--border-color)] text-[var(--foreground)]/55">
                      <tr>
                        <th className="p-3 font-medium">کد</th>
                        <th className="p-3 font-medium">عنوان</th>
                        <th className="p-3 font-medium">موضوع</th>
                        <th className="p-3 font-medium">واژه</th>
                        <th className="p-3 font-medium">نیاز به تأیید</th>
                        <th className="p-3 font-medium">وضعیت</th>
                        <th className="p-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/60">
                      {scenarios.data.map((s) => (
                        <tr key={s.id} className={cn(!s.active && "opacity-50")}>
                          <td className="p-3 text-[var(--foreground)]/55" dir="ltr">{s.slug ?? "—"}</td>
                          <td className="p-3">
                            <div className="font-medium">{s.title_fa}</div>
                            {s.title_iq && <div className="text-xs text-[var(--foreground)]/45" dir="rtl">{s.title_iq}</div>}
                          </td>
                          <td className="p-3 text-[var(--foreground)]/60">{CATEGORY_FA[s.category] ?? s.category}</td>
                          <td className="p-3">{toPersianNumber(s.vocab_count)}</td>
                          <td className={cn("p-3", s.needs_review_count > 0 ? "text-amber-500" : "text-[var(--foreground)]/35")}>{toPersianNumber(s.needs_review_count)}</td>
                          <td className="p-3">
                            <button
                              disabled={toggle.isPending}
                              onClick={() => toggle.mutate({ id: s.id, data: { active: !s.active } })}
                              className={cn("rounded-full px-2.5 py-1 text-xs", s.active ? "bg-[#10b981]/10 text-[#10b981]" : "bg-red-500/10 text-red-400")}
                            >
                              {s.active ? "فعال" : "غیرفعال"}
                            </button>
                            {s.edited_by_admin && <span className="mr-2 text-[11px] text-[#8b5cf6]">ویرایش‌شده</span>}
                          </td>
                          <td className="p-3">
                            <Button size="sm" variant="glass" onClick={() => setEditId(s.id)}>
                              ویرایش
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "vocabulary" && (
            <div className={panel}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                {LevelSelect}
                <div className="relative min-w-[200px] flex-1">
                  <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-[var(--foreground)]/40" />
                  <input className={inputCls + " pr-9"} placeholder="جستجوی واژه (عراقی یا فارسی)" value={vq} onChange={(e) => setVq(e.target.value)} />
                </div>
              </div>
              {vocab.isLoading && <Skeleton className="h-64" />}
              {vocab.isError && <ErrorState onRetry={() => vocab.refetch()} />}
              {vocab.data && (
                <>
                  <p className="mb-3 text-xs text-[var(--foreground)]/50">{toPersianNumber(vocab.data.total)} واژه پیدا شد؛ برای ویرایش، سناریوی مربوطه را باز کنید.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-sm">
                      <thead className="border-b border-[var(--border-color)] text-[var(--foreground)]/55">
                        <tr>
                          <th className="p-3 font-medium">واژه (عراقی)</th>
                          <th className="p-3 font-medium">معنی</th>
                          <th className="p-3 font-medium">مثال</th>
                          <th className="p-3 font-medium">سناریو</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]/60">
                        {vocab.data.items.map((v, i) => (
                          <tr key={`${v.scenario_id}-${i}`}>
                            <td className="p-3 text-base font-semibold" dir="rtl">{v.iq}</td>
                            <td className="p-3">{v.fa}</td>
                            <td className="p-3 text-[var(--foreground)]/60" dir="rtl">{v.example_iq}</td>
                            <td className="p-3">
                              <button className="text-[#8b5cf6] hover:underline" onClick={() => setEditId(v.scenario_id)}>
                                {v.scenario_title}
                              </button>
                              <span className="mr-1 text-xs text-[var(--foreground)]/40" dir="ltr">{v.level_code}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Button size="sm" variant="glass" disabled={vOffset === 0} onClick={() => setVOffset(Math.max(0, vOffset - 100))}>
                      قبلی
                    </Button>
                    <span className="text-xs text-[var(--foreground)]/50">
                      {toPersianNumber(Math.min(vOffset + 1, vocab.data.total))}–{toPersianNumber(Math.min(vOffset + 100, vocab.data.total))}
                    </span>
                    <Button size="sm" variant="glass" disabled={vOffset + 100 >= vocab.data.total} onClick={() => setVOffset(vOffset + 100)}>
                      بعدی
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {editId && <ScenarioEditor id={editId} onClose={() => setEditId(null)} />}
    </AuthGuard>
  );
}
