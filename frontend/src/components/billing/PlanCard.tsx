"use client";

import type { PlanDefinition } from "@/types/billing";
import type { PlanId } from "@/types/auth";
import { Check, X, Sparkles, Building2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatToman } from "@/lib/utils/number";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";

export function PlanCard({
  plan,
  currentPlan,
}: {
  plan: PlanDefinition;
  currentPlan?: PlanId;
}) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const isCurrent = currentPlan === plan.id;

  const getDestination = () => {
    if (plan.id === "free") {
      return accessToken ? "/dashboard" : "/register";
    }
    if (accessToken) {
      return `/checkout?plan=${plan.id}`;
    }
    return `/register?plan=${plan.id}`;
  };

  const getButtonLabel = () => {
    if (plan.id === "free") return accessToken ? "رفتن به داشبورد" : "شروع رایگان";
    return accessToken ? "ارتقا به این پلن" : "ثبت‌نام و ادامه خرید";
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border p-6 transition-all",
        plan.highlighted
          ? "border-blue-300 bg-gradient-to-b from-blue-50/50 to-white shadow-lg"
          : "border-gray-200 bg-white"
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 right-6 flex items-center gap-1 rounded-full bg-gradient-to-l from-blue-600 to-indigo-600 px-3 py-1 text-xs font-medium text-white shadow-sm">
          <Sparkles className="h-3 w-3" /> محبوب‌ترین
        </span>
      )}

      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.tagline}</p>

      <div className="my-5">
        {plan.isEnterprise ? (
          <p className="text-2xl font-bold text-gray-900">تماس با ما</p>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-900">
              {formatToman(plan.price_toman)}
            </span>
            {plan.price_toman > 0 && (
              <span className="text-sm text-gray-400">/ ماه</span>
            )}
          </div>
        )}
      </div>

      <div className="mb-5 space-y-1.5 border-y border-gray-100 py-4 text-sm">
        <p className="flex justify-between text-gray-600">
          <span>تمرین</span>
          <span className="font-medium text-gray-800">{plan.practiceLimit}</span>
        </p>
        <p className="flex justify-between text-gray-600">
          <span>صوت</span>
          <span className="font-medium text-gray-800">{plan.audioLimit}</span>
        </p>
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f.label} className="flex items-center gap-2 text-sm">
            {f.included ? (
              <Check className="h-4 w-4 flex-shrink-0 text-green-500" />
            ) : (
              <X className="h-4 w-4 flex-shrink-0 text-gray-300" />
            )}
            <span className={f.included ? "text-gray-700" : "text-gray-400"}>
              {f.label}
            </span>
          </li>
        ))}
      </ul>

      {plan.isEnterprise ? (
        <Button variant="secondary" className="w-full">
          <Building2 className="ml-1 h-4 w-4" /> تماس با فروش
        </Button>
      ) : isCurrent ? (
        <Button variant="secondary" className="w-full" disabled>
          پلن فعلی شما
        </Button>
      ) : (
        <Link href={getDestination()} className="w-full">
          <Button
            className="w-full"
            variant={plan.highlighted ? "primary" : "secondary"}
          >
            {getButtonLabel()}
          </Button>
        </Link>
      )}
    </div>
  );
}
