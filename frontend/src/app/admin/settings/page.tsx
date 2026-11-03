"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";

interface SystemStatus {
  environment: string;
  database: string;
  payment_provider: string;
  demo_payment_allowed: boolean;
  zarinpal_configured: boolean;
  zarinpal_available: boolean;
  zarinpal_sandbox: boolean;
  zarinpal_callback_url: string | null;
  ai_configured: boolean;
  ai_model: string;
  storage_backend: string;
  cookie_secure: boolean;
  frontend_url: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--card-bg)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border-color)",
  borderRadius: "1.5rem",
};

function Badge({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        ok ? "bg-[#10b981]/10 text-[#10b981]" : "bg-red-500/10 text-red-400"
      )}
    >
      {ok ? yes : no}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border-color)]/50 py-3 text-sm last:border-0">
      <span className="text-[var(--foreground)]/60">{label}</span>
      <span className="font-medium" dir="ltr">{children}</span>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data, isLoading, isError, refetch } = useQuery<SystemStatus>({
    queryKey: ["admin", "system"],
    queryFn: async () => (await apiClient.get("/api/admin/system")).data,
  });

  const isProd = data?.environment?.toLowerCase() === "production";

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar role="admin" />
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
                وضعیت سیستم
              </h1>
              <p className="mt-1 text-sm text-[var(--foreground)]/60">
                این صفحه فقط‌خواندنی است و تنظیمات واقعی سرور را نشان می‌دهد. برای تغییر، فایل <span dir="ltr">backend/.env</span> را ویرایش و بک‌اند را ری‌استارت کنید.
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <Link href="/admin">
                <Button variant="glass">← بازگشت</Button>
              </Link>
            </div>
          </header>

          {isLoading && <Skeleton className="h-64" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <div className="grid gap-6 md:grid-cols-2">
              <section style={cardStyle} className="p-6">
                <h2 className="mb-2 font-bold">پرداخت</h2>
                <Row label="حالت (PAYMENT_PROVIDER)">{data.payment_provider}</Row>
                <Row label="زرین‌پال">
                  <Badge ok={data.zarinpal_available} yes="فعال" no={data.zarinpal_configured ? "غیرفعال" : "مرچنت‌کد ندارد"} />
                </Row>
                <Row label="حالت تست زرین‌پال (sandbox)">
                  <Badge ok={!data.zarinpal_sandbox} yes="واقعی" no="تست" />
                </Row>
                <Row label="پرداخت آزمایشی (بدون برداشت)">
                  <Badge ok={data.demo_payment_allowed} yes="فعال" no="غیرفعال" />
                </Row>
                <Row label="آدرس بازگشت زرین‌پال">{data.zarinpal_callback_url ?? "—"}</Row>
                {!data.zarinpal_available && (
                  <p className="mt-3 text-xs text-amber-400">
                    برای فعال‌شدن زرین‌پال، <span dir="ltr">ZARINPAL_MERCHANT_ID</span> را در .env بگذارید.
                  </p>
                )}
              </section>

              <section style={cardStyle} className="p-6">
                <h2 className="mb-2 font-bold">هوش مصنوعی</h2>
                <Row label="کلید API">
                  <Badge ok={data.ai_configured} yes="تنظیم شده" no="تنظیم نشده" />
                </Row>
                <Row label="مدل">{data.ai_model}</Row>
                {!data.ai_configured && (
                  <p className="mt-3 text-xs text-amber-400">
                    بدون کلید AI، تحلیل سخنرانی و مربی عراقی کار نمی‌کنند.
                  </p>
                )}
              </section>

              <section style={cardStyle} className="p-6 md:col-span-2">
                <h2 className="mb-2 font-bold">محیط اجرا</h2>
                <Row label="ENVIRONMENT">
                  <Badge ok={isProd} yes="production" no={data.environment} />
                </Row>
                <Row label="پایگاه داده">{data.database}</Row>
                <Row label="ذخیره‌سازی فایل">{data.storage_backend}</Row>
                <Row label="کوکی امن (HTTPS)">
                  <Badge ok={data.cookie_secure} yes="فعال" no="غیرفعال" />
                </Row>
                <Row label="FRONTEND_URL">{data.frontend_url}</Row>
                {!isProd && (
                  <p className="mt-3 text-xs text-[var(--foreground)]/50">
                    این سرور در حالت توسعه است. قبل از فروش، ENVIRONMENT=production، پایگاه داده‌ی PostgreSQL، HTTPS و مرچنت‌کد واقعی لازم است.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
