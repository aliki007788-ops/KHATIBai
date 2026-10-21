"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { AppShell } from "@/components/layout/AppShell";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const PLANS = [
  {
    id: "free",
    name: "رایگان",
    price: "۰",
    period: "تومان / ماه",
    description: "شروع بدون هزینه",
    features: [
      { name: "۲ جلسه مربی آنلاین (۲ دقیقه‌ای)", included: true },
      { name: "۵ تحلیل فایل صوتی", included: true },
      { name: "دسترسی به سطح مبتدی (A1)", included: true },
      { name: "تاریخچه ۷ روز اخیر", included: true },
      { name: "پشتیبانی انجمن", included: true },
    ],
    buttonText: "شروع کنید",
    variant: "glass",
  },
  {
    id: "basic",
    name: "پایه",
    price: "۱۴۹,۰۰۰",
    period: "تومان / ماه",
    description: "برای تمرین منظم",
    features: [
      { name: "۲۰ جلسه مربی آنلاین (۲ دقیقه‌ای)", included: true },
      { name: "۵۰ تحلیل فایل صوتی", included: true },
      { name: "دسترسی تا سطح B1", included: true },
      { name: "تاریخچه ۳۰ روز اخیر", included: true },
      { name: "پشتیبانی ایمیل (۴۸ ساعته)", included: true },
    ],
    buttonText: "انتخاب پلن",
    variant: "primary",
    popular: true,
  },
  {
    id: "pro",
    name: "حرفه‌ای",
    price: "۲۹۹,۰۰۰",
    period: "تومان / ماه",
    description: "بدون محدودیت",
    features: [
      { name: "۱۰۰ جلسه مربی آنلاین (۲ دقیقه‌ای)", included: true },
      { name: "تحلیل فایل صوتی نامحدود", included: true },
      { name: "دسترسی کامل تا سطح C2", included: true },
      { name: "تاریخچه نامحدود", included: true },
      { name: "پشتیبانی ایمیل و تیکت (۲۴ ساعته)", included: true },
    ],
    buttonText: "انتخاب پلن",
    variant: "glass",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    if (planId === "free") {
      router.push("/register");
      return;
    }
    
    setLoading(planId);
    router.push(`/checkout?plan=${planId}`);
  };

  return (
    <AppShell>
      <div className="flex flex-col items-center py-10 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
            تعرفه‌های خطیب
          </h1>
          <p className="text-lg text-[var(--foreground)]/60 max-w-2xl mx-auto">
            همین حالا ثبت‌نام کنید، پلن خود را انتخاب کنید و از خطیب استفاده کنید.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300",
                plan.popular
                  ? "border-[var(--primary)] shadow-[0_0_40px_rgba(139,92,246,0.15)] bg-[var(--background)]"
                  : "border-[var(--border-color)] bg-[var(--background)]/50"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                  پیشنهاد ویژه
                </div>
              )}

              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <p className="text-sm text-[var(--foreground)]/60 mb-6">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-sm text-[var(--foreground)]/60">{plan.period}</span>
                </div>
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#10b981]" />
                    </div>
                    <span className="text-[var(--foreground)]/80">{feature.name}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "primary" : "glass"}
                size="lg"
                className="w-full rounded-2xl py-4"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading === plan.id}
              >
                {loading === plan.id ? "در حال انتقال..." : plan.buttonText}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline text-sm font-medium">
            بازگشت به داشبورد
          </Link>
        </div>
      </div>
    </AppShell>
  );
}