"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { Clock, CreditCard, Mic, Calendar, CheckCircle2, XCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Speech {
  id: string;
  title: string;
  status: string;
  overall_score: number | null;
  created_at: string;
}

interface Transaction {
  id: string;
  plan: string;
  amount_toman: number;
  status: string;
  created_at: string;
}

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<"speeches" | "payments">("speeches");

  // دریافت تاریخچه تمرین‌ها
  const { data: speeches, isLoading: speechesLoading, isError: speechesError, refetch: refetchSpeeches } = useQuery<Speech[]>({
    queryKey: ["speech", "list"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.speech.list);
      return res.data;
    },
  });

  // دریافت تاریخچه پرداخت‌ها
  const { data: payments, isLoading: paymentsLoading, isError: paymentsError, refetch: refetchPayments } = useQuery<Transaction[]>({
    queryKey: ["billing", "history"],
    queryFn: async () => {
      const res = await apiClient.get(endpoints.billing.history);
      return res.data;
    },
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
      case "success":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10b981]/10 text-[#10b981]"><CheckCircle2 className="w-3 h-3" /> موفق</span>;
      case "pending":
      case "processing":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#f59e0b]/10 text-[#f59e0b]"><Clock className="w-3 h-3" /> در انتظار</span>;
      case "failed":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400"><XCircle className="w-3 h-3" /> ناموفق</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">{status}</span>;
    }
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-8 pb-10">
          
          {/* هدر صفحه */}
          <header className="flex items-center gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="p-3 bg-[#3b82f6]/10 text-[#3b82f6] rounded-2xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">تاریخچه فعالیت‌ها</h1>
              <p className="text-[var(--foreground)]/60 mt-1">سابقه تمام تمرین‌ها و پرداخت‌های شما در یک نگاه</p>
            </div>
          </header>

          {/* تب‌ها */}
          <div className="flex border-b border-[var(--border-color)]">
            <button
              onClick={() => setActiveTab("speeches")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "speeches"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
              )}
            >
              <Mic className="w-4 h-4" /> تمرین‌های سخنرانی
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "payments"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
              )}
            >
              <CreditCard className="w-4 h-4" /> سوابق پرداخت
            </button>
          </div>

          {/* محتوای تب تمرین‌ها */}
          {activeTab === "speeches" && (
            <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-8">
              {speechesLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              )}
              {speechesError && <ErrorState onRetry={() => refetchSpeeches()} />}
              
              {speeches && speeches.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4">
                    <Mic className="w-8 h-8 text-[var(--foreground)]/40" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">هنوز تمرینی ثبت نکرده‌اید</h3>
                  <p className="text-sm text-[var(--foreground)]/60 mb-4">برای شروع به استودیوی سخنرانی بروید.</p>
                  <Link href="/practice" className="text-sm text-[var(--primary)] hover:underline">رفتن به استودیو ←</Link>
                </div>
              )}

              {speeches && speeches.length > 0 && (
                <div className="space-y-4">
                  {speeches.map((speech) => (
                    <div key={speech.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:bg-[var(--foreground)]/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                          <Mic className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-medium">{speech.title || "تمرین سخنرانی"}</div>
                          <div className="text-xs text-[var(--foreground)]/50 flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" /> {formatDate(speech.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {speech.overall_score != null && (
                          <div className="text-lg font-bold text-[var(--accent)]">
                            {toPersianNumber(speech.overall_score)} / ۱۰۰
                          </div>
                        )}
                        {getStatusBadge(speech.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* محتوای تب پرداخت‌ها */}
          {activeTab === "payments" && (
            <div className="glass-panel rounded-3xl border border-[var(--border-color)] p-8">
              {paymentsLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
              )}
              {paymentsError && <ErrorState onRetry={() => refetchPayments()} />}

              {payments && payments.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--foreground)]/5 flex items-center justify-center mb-4">
                    <CreditCard className="w-8 h-8 text-[var(--foreground)]/40" />
                  </div>
                  <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">تراکنشی یافت نشد</h3>
                  <p className="text-sm text-[var(--foreground)]/60 mb-4">هنوز هیچ پرداختی انجام نداده‌اید.</p>
                  <Link href="/pricing" className="text-sm text-[var(--primary)] hover:underline">مشاهده پلن‌ها ←</Link>
                </div>
              )}

              {payments && payments.length > 0 && (
                <div className="space-y-4">
                  {payments.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-color)] hover:bg-[var(--foreground)]/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-medium">خرید پلن {tx.plan === "pro" ? "حرفه‌ای" : tx.plan === "enterprise" ? "سازمانی" : "رایگان"}</div>
                          <div className="text-xs text-[var(--foreground)]/50 flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3" /> {formatDate(tx.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-bold">{toPersianNumber(tx.amount_toman)} <span className="text-xs font-normal text-[var(--foreground)]/50">تومان</span></div>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}