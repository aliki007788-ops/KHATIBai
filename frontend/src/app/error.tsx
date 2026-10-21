"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
      <h1 className="text-xl font-bold text-gray-900">خطایی رخ داد</h1>
      <p className="max-w-md text-sm text-gray-500">
        مشکلی در بارگذاری این صفحه پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      <Button onClick={reset}>تلاش مجدد</Button>
    </div>
  );
}
