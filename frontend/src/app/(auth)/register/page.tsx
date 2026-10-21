"use client";

import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerSchema, type RegisterFormValues } from "@/features/auth/schemas";
import { useRegister } from "@/features/auth/hooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { getPlanById } from "@/lib/config/plans";
import type { PlanId } from "@/types/auth";
import { Sparkles } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan") as PlanId | null;
  const selectedPlan = planId ? getPlanById(planId) : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useRegister();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-1 text-xl font-bold text-gray-900">ثبت‌نام در خطیب</h1>
        <p className="mb-4 text-sm text-gray-500">حساب کاربری جدید بسازید</p>

        {selectedPlan && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-blue-700">
            <Sparkles className="h-4 w-4 flex-shrink-0" />
            پس از ثبت‌نام، برای پلن «{selectedPlan.name}» وارد شوید و پرداخت را ادامه دهید
          </div>
        )}

        <form
          onSubmit={handleSubmit((v) => registerMutation.mutate(v))}
          className="flex flex-col gap-4"
        >
          <Input
            label="نام (اختیاری)"
            error={errors.name?.message}
            {...register("name")}
          />
          <Input
            label="ایمیل"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="رمز عبور"
            type="password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <Input
            label="تکرار رمز عبور"
            type="password"
            autoComplete="new-password"
            error={errors.password_confirmation?.message}
            {...register("password_confirmation")}
          />

          <label className="flex items-start gap-2 text-sm text-gray-600">
            <input type="checkbox" className="mt-0.5" {...register("accept_terms")} />
            <span>
              با{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                شرایط استفاده
              </Link>{" "}
              موافقم
            </span>
          </label>
          {errors.accept_terms && (
            <span className="text-xs text-red-600">{errors.accept_terms.message}</span>
          )}

          <Button
            type="submit"
            loading={registerMutation.isPending}
            className="mt-2 w-full"
          >
            ثبت‌نام
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link
            href={planId ? `/login?plan=${planId}` : "/login"}
            className="text-blue-600 hover:underline"
          >
            حساب دارید؟ وارد شوید
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
