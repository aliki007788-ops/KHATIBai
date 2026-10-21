"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowRight, Construction, MailCheck } from "lucide-react";

/**
 * Backend has ForgotPasswordRequest schema but router endpoints for
 * forgot/reset may not be fully exposed yet. UI is ready; shows
 * unavailable state when API is missing.
 */
export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const [status, setStatus] = useState<"idle" | "sent" | "unavailable">("idle");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (_values: ForgotPasswordFormValues) => {
    setLoading(true);
    // Endpoint not confirmed in routers — show unavailable for now
    await new Promise((r) => setTimeout(r, 600));
    setStatus("unavailable");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        {status === "idle" && (
          <>
            <h1 className="mb-1 text-xl font-bold text-gray-900">بازیابی رمز عبور</h1>
            <p className="mb-6 text-sm text-gray-500">
              ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="ایمیل"
                type="email"
                error={errors.email?.message}
                {...register("email")}
              />
              <Button type="submit" loading={loading} className="w-full">
                ارسال لینک بازیابی
              </Button>
            </form>
          </>
        )}

        {status === "sent" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-500">
              <MailCheck className="h-7 w-7" />
            </div>
            <h2 className="font-bold text-gray-900">لینک بازیابی ارسال شد</h2>
            <p className="text-sm text-gray-500">
              اگر حسابی با «{getValues("email")}» وجود داشته باشد، لینک ارسال می‌شود.
            </p>
          </div>
        )}

        {status === "unavailable" && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
              <Construction className="h-7 w-7" />
            </div>
            <h2 className="font-bold text-gray-900">این قابلیت به‌زودی راه‌اندازی می‌شود</h2>
            <p className="text-sm text-gray-500">
              لطفاً برای بازیابی حساب با پشتیبانی تماس بگیرید.
            </p>
            <a
              href="mailto:support@khatib.app"
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              support@khatib.app
            </a>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowRight className="h-4 w-4" /> بازگشت به ورود
          </Link>
        </div>
      </Card>
    </div>
  );
}
