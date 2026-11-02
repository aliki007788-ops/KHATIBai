"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { CheckCircle2, XCircle } from "lucide-react";
import { usePlans } from "@/features/plans/plans";

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status");
  const planCode = params.get("plan");
  const message = params.get("message");
  const reason = params.get("reason");
  const { data: plans } = usePlans();

  const success = status === "success" || status === "OK";
  const planName = plans?.find((p) => p.code === planCode)?.name_fa ?? planCode;

  // بعد از پرداخت موفق، پس از ۳ ثانیه به داشبورد می‌رویم
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.push("/dashboard"), 3000);
    return () => clearTimeout(t);
  }, [success, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md text-center">
        {success ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">پرداخت موفق</h1>
            <p className="mt-2 text-sm text-gray-500">
              {planName
                ? `پلن «${planName}» برای شما فعال شد. در حال انتقال به داشبورد...`
                : "اشتراک شما با موفقیت به‌روزرسانی شد. در حال انتقال به داشبورد..."}
            </p>
            <Link href="/dashboard" className="mt-6 inline-block">
              <Button>رفتن به داشبورد</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">پرداخت ناموفق</h1>
            <p className="mt-2 text-sm text-gray-500">
              {message || reason || "تراکنش تکمیل نشد. دوباره تلاش کنید."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/pricing">
                <Button>بازگشت به قیمت‌ها</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">داشبورد</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
