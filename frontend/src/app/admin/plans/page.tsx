"use client";

import { useState } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { toPersianNumber } from "@/lib/utils/number";
import {
  useAdminPlans,
  useAdminSections,
  useDeletePlan,
  useSavePlan,
  type AdminPlan,
  type PlanUpsert,
} from "@/features/plans/plans";
import { Plus, Pencil, Trash2, X } from "lucide-react";

interface FormState {
  code: string;
  name_fa: string;
  description_fa: string;
  sort_order: string;
  is_active: boolean;
  is_popular: boolean;
  price_monthly: string; // خالی = عرضه نمی‌شود
  price_yearly: string;
  features: string; // هر خط یک ویژگی
  sections: string[];
  max_speech: string; // خالی = نامحدود
  max_seconds: string;
}

const emptyForm: FormState = {
  code: "",
  name_fa: "",
  description_fa: "",
  sort_order: "10",
  is_active: true,
  is_popular: false,
  price_monthly: "",
  price_yearly: "",
  features: "",
  sections: [],
  max_speech: "",
  max_seconds: "",
};

const num = (s: string): number | null => {
  const t = s.replace(/[,\s]/g, "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : null;
};

const fromPlan = (p: AdminPlan): FormState => ({
  code: p.code,
  name_fa: p.name_fa,
  description_fa: p.description_fa,
  sort_order: String(p.sort_order),
  is_active: p.is_active,
  is_popular: p.is_popular,
  price_monthly: p.price_monthly_toman == null ? "" : String(p.price_monthly_toman),
  price_yearly: p.price_yearly_toman == null ? "" : String(p.price_yearly_toman),
  features: p.features.join("\n"),
  sections: p.sections,
  max_speech: p.limits.max_speech_per_month == null ? "" : String(p.limits.max_speech_per_month),
  max_seconds: p.limits.max_audio_seconds_per_month == null ? "" : String(p.limits.max_audio_seconds_per_month),
});

const toPayload = (f: FormState, creating: boolean): PlanUpsert => ({
  ...(creating ? { code: f.code.trim().toLowerCase() } : {}),
  name_fa: f.name_fa.trim(),
  description_fa: f.description_fa.trim(),
  sort_order: num(f.sort_order) ?? 0,
  is_active: f.is_active,
  is_popular: f.is_popular,
  price_monthly_toman: num(f.price_monthly),
  price_yearly_toman: num(f.price_yearly),
  features: f.features.split("\n").map((s) => s.trim()).filter(Boolean),
  sections: f.sections,
  max_speech_per_month: num(f.max_speech),
  max_audio_seconds_per_month: num(f.max_seconds),
});

const inputCls =
  "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]";

export default function AdminPlansPage() {
  const { data: plans, isLoading, isError, refetch } = useAdminPlans();
  const { data: sections } = useAdminSections();
  const save = useSavePlan();
  const remove = useDeletePlan();

  const [editing, setEditing] = useState<string | null>(null); // کد پلن در حال ویرایش
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const open = creating || editing !== null;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
  };
  const openEdit = (p: AdminPlan) => {
    setForm(fromPlan(p));
    setCreating(false);
    setEditing(p.code);
  };
  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const autoYearly = () => {
    const m = num(form.price_monthly);
    if (m) set("price_yearly", String(Math.round((m * 12 * 0.8) / 1000) * 1000));
  };

  const toggleSection = (key: string) =>
    set("sections", form.sections.includes(key) ? form.sections.filter((s) => s !== key) : [...form.sections, key]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    save.mutate(
      { code: creating ? null : editing, body: toPayload(form, creating) },
      { onSuccess: close }
    );
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold">مدیریت پلن‌ها</h1>
              <p className="text-sm text-[var(--foreground)]/60">
                قیمت ماهانه و سالانه، ویژگی‌ها، سقف مصرف و بخش‌های در دسترس هر پلن را اینجا تعیین کنید.
              </p>
            </div>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> پلن جدید
            </Button>
          </div>

          {isLoading && <Skeleton className="h-40" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          <div className="grid gap-4 md:grid-cols-2">
            {plans?.map((p) => (
              <div key={p.code} className="glass-panel rounded-2xl border border-[var(--border-color)] p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold">
                      {p.name_fa} <span className="text-xs font-normal text-[var(--foreground)]/40">({p.code})</span>
                    </h3>
                    <p className="text-xs text-[var(--foreground)]/60">{p.description_fa}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {!p.is_active && <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-red-400">غیرفعال</span>}
                    {p.is_popular && <span className="rounded-full bg-[#8b5cf6]/15 px-2 py-0.5 text-[#8b5cf6]">ویژه</span>}
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-[var(--foreground)]/50">ماهانه</dt>
                    <dd>{p.price_monthly_toman == null ? "عرضه نمی‌شود" : `${toPersianNumber(p.price_monthly_toman.toLocaleString("en-US"))} تومان`}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--foreground)]/50">سالانه</dt>
                    <dd>{p.price_yearly_toman == null ? "عرضه نمی‌شود" : `${toPersianNumber(p.price_yearly_toman.toLocaleString("en-US"))} تومان`}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--foreground)]/50">سقف تحلیل در ماه</dt>
                    <dd>{p.limits.max_speech_per_month == null ? "نامحدود" : toPersianNumber(p.limits.max_speech_per_month)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--foreground)]/50">کاربران / اشتراک‌ها</dt>
                    <dd>{toPersianNumber(p.user_count)} / {toPersianNumber(p.subscription_count)}</dd>
                  </div>
                </dl>

                <p className="mt-3 text-xs text-[var(--foreground)]/50">
                  بخش‌ها: {p.sections.length === 0 ? "هیچ‌کدام" : toPersianNumber(p.sections.length) + " بخش"}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="glass" onClick={() => openEdit(p)}>
                    <Pencil className="h-3 w-3" /> ویرایش
                  </Button>
                  {p.code !== "free" && (
                    <Button
                      size="sm"
                      variant="danger"
                      loading={remove.isPending}
                      onClick={() => {
                        if (confirm(`پلن «${p.name_fa}» حذف شود؟`)) remove.mutate(p.code);
                      }}
                    >
                      <Trash2 className="h-3 w-3" /> حذف
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {open && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4">
            <form
              onSubmit={submit}
              className="glass-panel my-8 w-full max-w-2xl space-y-4 rounded-3xl border border-[var(--border-color)] bg-[var(--background)] p-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">{creating ? "پلن جدید" : `ویرایش «${form.name_fa}»`}</h2>
                <button type="button" onClick={close} aria-label="بستن">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm">
                  کد پلن (انگلیسی، بعد از ساخت تغییر نمی‌کند)
                  <input
                    className={inputCls}
                    value={form.code}
                    disabled={!creating}
                    placeholder="مثلاً team-plus"
                    onChange={(e) => set("code", e.target.value)}
                    required={creating}
                    dir="ltr"
                  />
                </label>
                <label className="text-sm">
                  نام نمایشی
                  <input className={inputCls} value={form.name_fa} onChange={(e) => set("name_fa", e.target.value)} required />
                </label>
                <label className="text-sm md:col-span-2">
                  توضیح کوتاه
                  <input className={inputCls} value={form.description_fa} onChange={(e) => set("description_fa", e.target.value)} />
                </label>
                <label className="text-sm">
                  قیمت ماهانه (تومان؛ خالی = عرضه نشود، ۰ = رایگان)
                  <input className={inputCls} inputMode="numeric" value={form.price_monthly} onChange={(e) => set("price_monthly", e.target.value)} dir="ltr" />
                </label>
                <label className="text-sm">
                  قیمت سالانه (تومان؛ خالی = عرضه نشود)
                  <div className="flex gap-2">
                    <input className={inputCls} inputMode="numeric" value={form.price_yearly} onChange={(e) => set("price_yearly", e.target.value)} dir="ltr" />
                    <Button type="button" size="sm" variant="glass" onClick={autoYearly} title="۱۲ ماه با ۲۰٪ تخفیف">
                      ۲۰٪
                    </Button>
                  </div>
                </label>
                <label className="text-sm">
                  سقف تحلیل در ماه (خالی = نامحدود)
                  <input className={inputCls} inputMode="numeric" value={form.max_speech} onChange={(e) => set("max_speech", e.target.value)} dir="ltr" />
                </label>
                <label className="text-sm">
                  سقف ثانیه‌ی صوت در ماه (خالی = نامحدود)
                  <input className={inputCls} inputMode="numeric" value={form.max_seconds} onChange={(e) => set("max_seconds", e.target.value)} dir="ltr" />
                </label>
                <label className="text-sm">
                  ترتیب نمایش (کوچک‌تر = اول)
                  <input className={inputCls} inputMode="numeric" value={form.sort_order} onChange={(e) => set("sort_order", e.target.value)} dir="ltr" />
                </label>
                <div className="flex items-end gap-6 pb-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} />
                    فعال
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_popular} onChange={(e) => set("is_popular", e.target.checked)} />
                    پیشنهاد ویژه
                  </label>
                </div>
              </div>

              <label className="block text-sm">
                ویژگی‌ها (هر خط یک مورد، در صفحه‌ی تعرفه نمایش داده می‌شود)
                <textarea className={inputCls} rows={5} value={form.features} onChange={(e) => set("features", e.target.value)} />
              </label>

              <div>
                <p className="mb-2 text-sm">بخش‌های قابل دسترس در این پلن</p>
                <div className="grid gap-2 md:grid-cols-2">
                  {sections?.map((s) => (
                    <label key={s.key} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.sections.includes(s.key)} onChange={() => toggleSection(s.key)} />
                      {s.label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-[var(--foreground)]/50">
                  بخشی که تیک نخورد، برای کاربران این پلن در سرور قفل می‌شود (ادمین‌ها همیشه دسترسی دارند).
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={close}>
                  انصراف
                </Button>
                <Button type="submit" loading={save.isPending}>
                  ذخیره
                </Button>
              </div>
            </form>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}
