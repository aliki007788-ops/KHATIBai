"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { 
  CreditCard, 
  Search, 
  RefreshCw, 
  TrendingUp, 
  Wallet, 
  Users, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Transaction {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  user_email?: string;
  plan_id?: string;
}

interface Subscription {
  id: string;
  user_email: string;
  plan: string;
  status: string;
  started_at: string;
  expires_at: string | null;
}

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"transactions" | "subscriptions">("transactions");
  const [searchTerm, setSearchTerm] = useState("");

  const { 
    data: transactions, 
    isLoading: txLoading, 
    isError: txError, 
    refetch: txRefetch 
  } = useQuery<Transaction[]>({
    queryKey: ["admin", "transactions"],
    queryFn: async () => (await apiClient.get(endpoints.admin.transactions)).data,
    staleTime: 30_000,
  });

  const { 
    data: subscriptions, 
    isLoading: subLoading, 
    isError: subError, 
    refetch: subRefetch 
  } = useQuery<Subscription[]>({
    queryKey: ["admin", "subscriptions"],
    queryFn: async () => (await apiClient.get(endpoints.admin.subscriptions)).data,
    staleTime: 30_000,
  });

  const totalRevenue = transactions?.reduce((acc, tx) => acc + (tx.status === "success" ? tx.amount : 0), 0) ?? 0;
  const successfulTransactions = transactions?.filter(tx => tx.status === "success").length ?? 0;
  const pendingTransactions = transactions?.filter(tx => tx.status === "pending").length ?? 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === "active").length ?? 0;

  const filteredTransactions = transactions?.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.user_email && tx.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  ) ?? [];

  const filteredSubscriptions = subscriptions?.filter(sub => 
    sub.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "success":
      case "active":
        return <span className={cn(baseClasses, "bg-[#10b981]/10 text-[#10b981]")}><CheckCircle2 className="w-3 h-3" /> {status === "success" ? "موفق" : "فعال"}</span>;
      case "pending":
        return <span className={cn(baseClasses, "bg-[#f59e0b]/10 text-[#f59e0b]")}><Clock className="w-3 h-3" /> در انتظار</span>;
      case "failed":
      case "expired":
        return <span className={cn(baseClasses, "bg-red-500/10 text-red-500")}><XCircle className="w-3 h-3" /> {status === "failed" ? "ناموفق" : "منقضی"}</span>;
      default:
        return <span className={cn(baseClasses, "bg-[var(--foreground)]/10 text-[var(--foreground)]/60")}>{status}</span>;
    }
  };

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

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-8 pb-10">
          
          {/* هدر صفحه */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-2xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت مالی</h1>
                <p className="text-[var(--foreground)]/60 mt-1">مدیریت تراکنش‌ها، اشتراک‌ها و درآمدهای سیستم</p>
              </div>
            </div>
            <Button 
              variant="glass" 
              onClick={() => activeTab === "transactions" ? txRefetch() : subRefetch()}
              className="self-start md:self-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> بروزرسانی
            </Button>
          </div>

          {/* کارت‌های آماری */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-r-4 border-r-[#10b981] border border-[var(--border-color)]">
              <div className="p-4 bg-[#10b981]/10 text-[#10b981] rounded-2xl"><Wallet className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-[var(--foreground)]/60 mb-1">کل درآمد موفق</p>
                <p className="text-2xl font-black text-[var(--foreground)]">{toPersianNumber(totalRevenue)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span></p>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-r-4 border-r-[#3b82f6] border border-[var(--border-color)]">
              <div className="p-4 bg-[#3b82f6]/10 text-[#3b82f6] rounded-2xl"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-[var(--foreground)]/60 mb-1">تراکنش‌های موفق</p>
                <p className="text-2xl font-black text-[var(--foreground)]">{toPersianNumber(successfulTransactions)}</p>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-r-4 border-r-[#f59e0b] border border-[var(--border-color)]">
              <div className="p-4 bg-[#f59e0b]/10 text-[#f59e0b] rounded-2xl"><Clock className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-[var(--foreground)]/60 mb-1">در انتظار پرداخت</p>
                <p className="text-2xl font-black text-[var(--foreground)]">{toPersianNumber(pendingTransactions)}</p>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-r-4 border-r-[#8b5cf6] border border-[var(--border-color)]">
              <div className="p-4 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-2xl"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-sm text-[var(--foreground)]/60 mb-1">اشتراک‌های فعال</p>
                <p className="text-2xl font-black text-[var(--foreground)]">{toPersianNumber(activeSubscriptions)}</p>
              </div>
            </div>
          </div>

          {/* تب‌ها و جستجو */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-[var(--foreground)]/5 p-1 rounded-2xl w-fit border border-[var(--border-color)]">
              <button
                onClick={() => { setActiveTab("transactions"); setSearchTerm(""); }}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === "transactions" 
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" 
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                )}
              >
                تراکنش‌ها
              </button>
              <button
                onClick={() => { setActiveTab("subscriptions"); setSearchTerm(""); }}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === "subscriptions" 
                    ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" 
                    : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                )}
              >
                اشتراک‌ها
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/40" />
              <input
                type="text"
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 pr-10 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* جدول تراکنش‌ها */}
          {activeTab === "transactions" && (
            <>
              {txLoading && <Skeleton className="h-96 rounded-3xl" />}
              {txError && <ErrorState onRetry={() => txRefetch()} />}
              {transactions && (
                <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)]">
                        <tr className="text-sm text-[var(--foreground)]/60">
                          <th className="p-4 font-medium">شناسه تراکنش</th>
                          <th className="p-4 font-medium">کاربر</th>
                          <th className="p-4 font-medium">مبلغ</th>
                          <th className="p-4 font-medium">پلن</th>
                          <th className="p-4 font-medium">وضعیت</th>
                          <th className="p-4 font-medium">تاریخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-[var(--foreground)]/40">
                              تراکنشی یافت نشد.
                            </td>
                          </tr>
                        ) : (
                          filteredTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                              <td className="p-4 text-sm font-mono text-[var(--foreground)]/60" dir="ltr">
                                {tx.id.slice(0, 8)}...
                              </td>
                              <td className="p-4 text-sm text-[var(--foreground)]/80">
                                {tx.user_email ?? "—"}
                              </td>
                              <td className="p-4 font-bold text-[var(--foreground)]">
                                {toPersianNumber(tx.amount)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span>
                              </td>
                              <td className="p-4 text-sm">
                                {tx.plan_id ? (
                                  <span className="px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs">
                                    {tx.plan_id}
                                  </span>
                                ) : "—"}
                              </td>
                              <td className="p-4">{getStatusBadge(tx.status)}</td>
                              <td className="p-4 text-sm text-[var(--foreground)]/60">
                                {formatDate(tx.created_at)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* جدول اشتراک‌ها */}
          {activeTab === "subscriptions" && (
            <>
              {subLoading && <Skeleton className="h-96 rounded-3xl" />}
              {subError && <ErrorState onRetry={() => subRefetch()} />}
              {subscriptions && (
                <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)]">
                        <tr className="text-sm text-[var(--foreground)]/60">
                          <th className="p-4 font-medium">کاربر</th>
                          <th className="p-4 font-medium">پلن</th>
                          <th className="p-4 font-medium">وضعیت</th>
                          <th className="p-4 font-medium">تاریخ شروع</th>
                          <th className="p-4 font-medium">تاریخ انقضا</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredSubscriptions.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-[var(--foreground)]/40">
                              اشتراکی یافت نشد.
                            </td>
                          </tr>
                        ) : (
                          filteredSubscriptions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                              <td className="p-4 text-sm text-[var(--foreground)]/80">{sub.user_email}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#8b5cf6]/10 text-[#8b5cf6]">
                                  {sub.plan}
                                </span>
                              </td>
                              <td className="p-4">{getStatusBadge(sub.status)}</td>
                              <td className="p-4 text-sm text-[var(--foreground)]/60">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(sub.started_at)}
                                </div>
                              </td>
                              <td className="p-4 text-sm text-[var(--foreground)]/60">
                                {sub.expires_at ? (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(sub.expires_at)}
                                  </div>
                                ) : (
                                  <span className="text-[#10b981] text-xs">نامحدود</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}