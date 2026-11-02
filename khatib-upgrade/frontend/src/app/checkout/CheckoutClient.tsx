"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/lib/api/errors';
import { toPersianNumber } from '@/lib/utils/number';
import {
  absoluteApiUrl,
  planPrice,
  plansService,
  usePaymentOptions,
  usePlans,
  type Period,
} from '@/features/plans/plans';

const fmt = (n: number) => toPersianNumber(n.toLocaleString('en-US'));

export default function CheckoutClient({
  initialPlan,
  initialPeriod,
}: {
  initialPlan: string;
  initialPeriod: Period;
}) {
  const router = useRouter();
  const { data: plans, isLoading, isError, refetch } = usePlans();
  const { data: payOptions } = usePaymentOptions();

  const [planCode, setPlanCode] = useState(initialPlan);
  const [period, setPeriod] = useState<Period>(initialPeriod);
  const [providerChoice, setProviderChoice] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // فقط پلن‌های پولی در چک‌اوت
  const paidPlans = useMemo(
    () => (plans ?? []).filter((p) => (p.price_monthly_toman ?? 0) > 0 || (p.price_yearly_toman ?? 0) > 0),
    [plans]
  );
  const plan = paidPlans.find((p) => p.code === planCode) ?? paidPlans[0];
  const effectivePeriod: Period = plan
    ? planPrice(plan, period) != null && (planPrice(plan, period) ?? 0) > 0
      ? period
      : period === 'monthly'
      ? 'yearly'
      : 'monthly'
    : period;
  const price = plan ? planPrice(plan, effectivePeriod) ?? 0 : 0;

  const providers = payOptions?.providers ?? [];
  const provider = providerChoice ?? payOptions?.default ?? null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan || price <= 0) return;
    setError(null);

    // پرداخت به حساب کاربری نیاز دارد
    if (!useAuthStore.getState().accessToken) {
      const back = `/checkout?plan=${encodeURIComponent(plan.code)}&period=${effectivePeriod}`;
      router.push(`/login?redirect=${encodeURIComponent(back)}`);
      return;
    }

    setIsProcessing(true);
    try {
      const res = await plansService.checkout({ plan: plan.code, period: effectivePeriod, provider });
      // زرین‌پال: انتقال به درگاه | آزمایشی: تأیید توسط سرور و بازگشت به /payment-result
      window.location.href = absoluteApiUrl(res.payment_url);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      <header className="w-full navbar-glass sticky top-0 z-50 px-6 h-16 flex items-center justify-between border-b border-[var(--border-color)]">
        <Link href="/pricing" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--primary)] transition-colors">
          → بازگشت به تعرفه‌ها
        </Link>
        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
          تکمیل خرید
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 mt-8">
        <div className="flex-1">
          {isLoading && <Skeleton className="h-64" />}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {plans && paidPlans.length === 0 && (
            <p className="text-[var(--foreground)]/60">فعلاً پلن پولی فعالی وجود ندارد.</p>
          )}

          {plan && (
            <form onSubmit={handlePayment}>
              <h2 className="text-2xl font-bold mb-6">۱. انتخاب پلن</h2>
              <div className="space-y-4">
                {paidPlans.map((p) => {
                  const active = p.code === plan.code;
                  const pp = planPrice(p, effectivePeriod) ?? planPrice(p, effectivePeriod === 'monthly' ? 'yearly' : 'monthly') ?? 0;
                  return (
                    <div
                      key={p.code}
                      onClick={() => setPlanCode(p.code)}
                      className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                        active ? 'border-2 border-[var(--primary)] shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border border-[var(--border-color)] hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${active ? 'border-[var(--primary)]' : 'border-white/30'}`}>
                            {active && <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{p.name_fa}</h3>
                            <p className="text-sm text-[var(--foreground)]/50">{p.description_fa}</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold">
                          {fmt(pp)} <span className="text-sm font-normal text-[var(--foreground)]/50">تومان</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <h2 className="text-2xl font-bold mb-6 mt-10">۲. دوره‌ی پرداخت</h2>
              <div className="inline-flex rounded-2xl border border-[var(--border-color)] p-1">
                {(['monthly', 'yearly'] as Period[]).map((p) => {
                  const available = (planPrice(plan, p) ?? 0) > 0;
                  return (
                    <button
                      key={p}
                      type="button"
                      disabled={!available}
                      onClick={() => setPeriod(p)}
                      className={`px-6 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-30 ${
                        effectivePeriod === p ? 'bg-[var(--primary)] text-white' : 'text-[var(--foreground)]/60'
                      }`}
                    >
                      {p === 'monthly' ? 'ماهانه' : 'سالانه'}
                      {p === 'yearly' && plan.yearly_discount_percent > 0 && (
                        <span className="mr-2 text-xs text-[#10b981]">{toPersianNumber(plan.yearly_discount_percent)}٪ تخفیف</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <h2 className="text-2xl font-bold mb-6 mt-10">۳. روش پرداخت</h2>
              {providers.length === 0 ? (
                <p className="text-sm text-red-400">هیچ روش پرداختی فعال نیست. تنظیمات PAYMENT_PROVIDER سرور را بررسی کنید.</p>
              ) : (
                <div className="space-y-3">
                  {providers.map((pr) => (
                    <label
                      key={pr.id}
                      className={`flex items-center gap-3 glass-panel p-4 rounded-2xl cursor-pointer border ${
                        provider === pr.id ? 'border-[var(--primary)]' : 'border-[var(--border-color)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="provider"
                        checked={provider === pr.id}
                        onChange={() => setProviderChoice(pr.id)}
                      />
                      <span className="font-medium">{pr.label}</span>
                      {pr.test_mode && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">حالت تست</span>
                      )}
                    </label>
                  ))}
                  <p className="text-xs text-[var(--foreground)]/50">
                    اطلاعات کارت در سایت خطیب وارد نمی‌شود؛ پرداخت در صفحه‌ی امن درگاه انجام می‌شود.
                  </p>
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

              <Button
                type="submit"
                size="lg"
                className="w-full mt-8 py-4 rounded-xl text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                disabled={isProcessing || providers.length === 0 || price <= 0}
              >
                {isProcessing ? 'در حال اتصال به درگاه...' : `پرداخت ${fmt(price)} تومان`}
              </Button>
            </form>
          )}
        </div>

        <div className="w-full lg:w-96">
          <div className="glass-panel p-8 rounded-3xl sticky top-24 border-t-4 border-t-[var(--primary)]">
            <h3 className="text-xl font-bold mb-6">خلاصه سفارش</h3>
            {plan && (
              <>
                <div className="space-y-4 text-sm mb-6 border-b border-white/10 pb-6">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">پلن</span>
                    <span className="font-medium">{plan.name_fa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground)]/60">دوره</span>
                    <span className="font-medium">{effectivePeriod === 'yearly' ? 'سالانه' : 'ماهانه'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">مبلغ قابل پرداخت</span>
                  <span className="text-2xl font-black text-[var(--primary)]">
                    {fmt(price)} <span className="text-sm font-normal text-[var(--foreground)]/50">تومان</span>
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
