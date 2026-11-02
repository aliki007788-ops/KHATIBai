"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toPersianNumber } from "@/lib/utils/number";
import { useAuthStore } from "@/stores/authStore";
import { usePlans, planPrice, type Period, type Plan } from "@/features/plans/plans";

const fmt = (n: number) => toPersianNumber(n.toLocaleString("en-US"));

export default function PricingPage() {
  const router = useRouter();
  const { data: plans, isLoading, isError, refetch } = usePlans();
  const [period, setPeriod] = useState<Period>("monthly");
  const [loading, setLoading] = useState<string | null>(null);

  // اگر پلنی برای دوره‌ی انتخابی قیمت ندارد، دوره‌ی دیگرش را نشان می‌دهیم
  const effectivePeriod = (p: Plan): Period =>
    planPrice(p, period) != null ? period : period === "monthly" ? "yearly" : "monthly";

  const handleSelect = (plan: Plan) => {
    const per = effectivePeriod(plan);
    const price = planPrice(plan, per) ?? 0;
    if (price <= 0) {
      // پلن رایگان پرداخت ندارد: کاربر واردشده به داشبورد، بقیه به ثبت‌نام
      const loggedIn = !!useAuthStore.getState().accessToken;
      router.push(loggedIn ? "/dashboard" : "/register");
      return;
    }
    setLoading(plan.code);
    router.push(`/checkout?plan=${encodeURIComponent(plan.code)}&period=${per}`);
  };

  const maxDiscount = Math.max(0, ...(plans ?? []).map((p) => p.yearly_discount_percent));

  return (
    <AppShell>
      <div className="flex flex-col items-center py-10 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
            تعرفه‌های خطیب
          </h1>
          <p className="text-lg text-[var(--foreground)]/60 max-w-2xl mx-auto">
            همین حالا ثبت‌نام کنید، پلن خود را انتخاب کنید و از خطیب استفاده کنید.
          </p>
        </div>

        <div className="mb-12 inline-flex rounded-2xl border border-[var(--border-color)] p-1">
          {(["monthly", "yearly"] as Period[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-medium transition-colors",
                period === p ? "bg-[var(--primary)] text-white" : "text-[var(--foreground)]/60"
              )}
            >
              {p === "monthly" ? "ماهانه" : "سالانه"}
              {p === "yearly" && maxDiscount > 0 && (
                <span className="mr-2 text-xs text-[#10b981]">{toPersianNumber(maxDiscount)}٪ تخفیف</span>
              )}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        )}
        {isError && <ErrorState onRetry={() => refetch()} />}

        {plans && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
            {plans.map((plan) => {
              const per = effectivePeriod(plan);
              const price = planPrice(plan, per);
              return (
                <div
                  key={plan.code}
                  className={cn(
                    "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300",
                    plan.is_popular
                      ? "border-[var(--primary)] shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-[var(--background)]"
                      : "border-[var(--border-color)] bg-[var(--background)]/50"
                  )}
                >
                  {plan.is_popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      پیشنهاد ویژه
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{plan.name_fa}</h2>
                    <p className="text-sm text-[var(--foreground)]/60 mb-6">{plan.description_fa}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black">{price ? fmt(price) : "۰"}</span>
                      <span className="text-sm text-[var(--foreground)]/60">
                        تومان / {per === "yearly" ? "سال" : "ماه"}
                      </span>
                    </div>
                    {per === "yearly" && plan.yearly_discount_percent > 0 && (
                      <div className="mt-2 text-xs text-[#10b981]">
                        {toPersianNumber(plan.yearly_discount_percent)}٪ ارزان‌تر از پرداخت ماهانه
                      </div>
                    )}
                    {per !== period && (
                      <div className="mt-2 text-xs text-[var(--foreground)]/50">
                        این پلن فقط {per === "yearly" ? "سالانه" : "ماهانه"} عرضه می‌شود
                      </div>
                    )}
                  </div>

                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-[#10b981]" />
                        </div>
                        <span className="text-[var(--foreground)]/80">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.is_popular ? "primary" : "glass"}
                    size="lg"
                    className="w-full rounded-2xl py-4"
                    onClick={() => handleSelect(plan)}
                    disabled={loading === plan.code}
                  >
                    {loading === plan.code ? "در حال انتقال..." : price ? "انتخاب پلن" : "شروع کنید"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline text-sm font-medium">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
