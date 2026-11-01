"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { toPersianNumber } from "@/lib/utils/number";
import { 
  CreditCard, RefreshCw, Wallet, Search, Plus, FileText,
  CheckCircle2, XCircle, Clock, ArrowUpRight, ArrowDownRight, PieChart, X
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Transaction {
  id: string;
  amount_toman: number;
  status: string;
  plan: string;
  created_at: string;
}

interface FinanceSummary {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
}

interface Expense {
  id: string;
  category: string;
  title: string;
  amount_toman: number;
  description: string | null;
  expense_date: string;
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  transaction_id: string;
  plan: string;
  amount_toman: number;
  issued_at: string;
}

export default function AdminFinancePage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"summary" | "transactions" | "expenses" | "invoices">("summary");
  const [searchTerm, setSearchTerm] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: "other", title: "", amount_toman: 0, description: "" });

  // =========================================================
  // Queries
  // =========================================================

  const { data: summary, isLoading: summaryLoading, isError: summaryError, refetch: summaryRefetch } = useQuery<FinanceSummary>({
    queryKey: ["admin", "finance", "summary"],
    queryFn: async () => (await apiClient.get("/api/admin/finance/summary")).data,
    staleTime: 30_000,
  });

  const { data: transactions, isLoading: txLoading, isError: txError, refetch: txRefetch } = useQuery<Transaction[]>({
    queryKey: ["admin", "transactions"],
    queryFn: async () => (await apiClient.get("/api/admin/transactions")).data,
    staleTime: 30_000,
  });

  const { data: expenses, isLoading: expLoading, isError: expError, refetch: expRefetch } = useQuery<Expense[]>({
    queryKey: ["admin", "finance", "expenses"],
    queryFn: async () => (await apiClient.get("/api/admin/finance/expenses")).data,
    staleTime: 30_000,
  });

  const { data: invoices, isLoading: invLoading, isError: invError, refetch: invRefetch } = useQuery<Invoice[]>({
    queryKey: ["admin", "finance", "invoices"],
    queryFn: async () => (await apiClient.get("/api/admin/finance/invoices")).data,
    staleTime: 30_000,
  });

  // =========================================================
  // Mutations
  // =========================================================

  const createExpense = useMutation({
    mutationFn: (payload: any) => apiClient.post("/api/admin/finance/expenses", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "finance", "expenses"] });
      qc.invalidateQueries({ queryKey: ["admin", "finance", "summary"] });
      setIsExpenseModalOpen(false);
      setNewExpense({ category: "other", title: "", amount_toman: 0, description: "" });
      alert("هزینه با موفقیت ثبت شد.");
    },
    onError: (err) => {
      console.error("Error creating expense:", err);
      alert("خطا در ثبت هزینه.");
    },
  });

  const issueInvoice = useMutation({
    mutationFn: (transactionId: string) => apiClient.post(`/api/admin/finance/invoices/${transactionId}`),
    onSuccess: (response) => {
      qc.invalidateQueries({ queryKey: ["admin", "finance", "invoices"] });
      alert("فاکتور با موفقیت صادر شد.");
      // هدایت به صفحه فاکتور با استفاده از شناسه فاکتور
      if (response.data?.id) {
        router.push(`/admin/finance/invoices/${response.data.id}`);
      } else {
        // اگر پاسخ شناسه نداشت، به تب فاکتورها برو
        setActiveTab("invoices");
      }
    },
    onError: (err) => {
      console.error("Error issuing invoice:", err);
      alert("خطا در صدور فاکتور.");
    },
  });

  // =========================================================
  // Helpers
  // =========================================================

  const getStatusBadge = (status: string) => {
    const base = "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium";
    if (status === "paid" || status === "success") {
      return <span className={cn(base, "bg-[#10b981]/10 text-[#10b981]")}><CheckCircle2 className="w-3 h-3" /> پرداخت شده</span>;
    }
    if (status === "pending" || status === "created") {
      return <span className={cn(base, "bg-[#f59e0b]/10 text-[#f59e0b]")}><Clock className="w-3 h-3" /> در انتظار</span>;
    }
    return <span className={cn(base, "bg-red-500/10 text-red-500")}><XCircle className="w-3 h-3" /> ناموفق</span>;
  };

  const getCategoryLabel = (cat: string) => {
    const map: Record<string, string> = {
      server: "سرور و زیرساخت",
      ai_api: "هوش مصنوعی (API)",
      marketing: "بازاریابی",
      salary: "حقوق و دستمزد",
      tools: "ابزارها و نرم‌افزار",
      other: "سایر",
    };
    return map[cat] || cat;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" });
    } catch { return dateString; }
  };

  const filteredTransactions = transactions?.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const filteredExpenses = expenses?.filter(ex => 
    ex.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  const filteredInvoices = invoices?.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

  // =========================================================
  // Render
  // =========================================================

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-8 pb-10">
          
          {/* هدر */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-2xl">
                <CreditCard className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت مالی و حسابداری</h1>
                <p className="text-[var(--foreground)]/60 mt-1">سود و زیان، هزینه‌ها، فاکتورها و تراکنش‌ها</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="glass" 
                onClick={() => {
                  summaryRefetch();
                  txRefetch();
                  expRefetch();
                  invRefetch();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" /> بروزرسانی
              </Button>
              <Button onClick={() => setIsExpenseModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> ثبت هزینه
              </Button>
            </div>
          </div>

          {/* کارت‌های خلاصه */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] border-r-4 border-r-[#10b981]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--foreground)]/60">درآمد کل</span>
                <ArrowUpRight className="w-5 h-5 text-[#10b981]" />
              </div>
              {summaryLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-black text-[#10b981]">
                  {toPersianNumber(summary?.total_revenue ?? 0)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] border-r-4 border-r-red-500">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--foreground)]/60">هزینه کل</span>
                <ArrowDownRight className="w-5 h-5 text-red-500" />
              </div>
              {summaryLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-black text-red-500">
                  {toPersianNumber(summary?.total_expenses ?? 0)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] border-r-4 border-r-[#3b82f6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--foreground)]/60">سود خالص</span>
                <Wallet className="w-5 h-5 text-[#3b82f6]" />
              </div>
              {summaryLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className={cn("text-2xl font-black", (summary?.net_profit ?? 0) >= 0 ? "text-[#3b82f6]" : "text-red-500")}>
                  {toPersianNumber(summary?.net_profit ?? 0)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span>
                </div>
              )}
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] border-r-4 border-r-[#8b5cf6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--foreground)]/60">حاشیه سود</span>
                <PieChart className="w-5 h-5 text-[#8b5cf6]" />
              </div>
              {summaryLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-2xl font-black text-[#8b5cf6]">
                  {summary?.profit_margin ?? 0}٪
                </div>
              )}
            </div>
          </div>

          {/* تب‌ها و جستجو */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex bg-[var(--foreground)]/5 p-1 rounded-2xl w-fit border border-[var(--border-color)] flex-wrap">
              {[
                { id: "summary", label: "خلاصه مالی" },
                { id: "transactions", label: "تراکنش‌ها" },
                { id: "expenses", label: "هزینه‌ها" },
                { id: "invoices", label: "فاکتورها" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setSearchTerm(""); }}
                  className={cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    activeTab === tab.id 
                      ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" 
                      : "text-[var(--foreground)]/60 hover:text-[var(--foreground)]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
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

          {/* محتوای تب‌ها */}
          {activeTab === "summary" && (
            <div className="glass-panel p-8 rounded-3xl border border-[var(--border-color)]">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">خلاصه دوره</h3>
              {summaryLoading ? <Skeleton className="h-24" /> : summaryError ? (
                <div className="text-center text-red-500 p-4">خطا در دریافت اطلاعات خلاصه.</div>
              ) : summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded-xl bg-[var(--foreground)]/5">
                      <span className="text-sm text-[var(--foreground)]/60">درآمد کل</span>
                      <span className="font-bold text-[#10b981]">{toPersianNumber(summary.total_revenue)} تومان</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[var(--foreground)]/5">
                      <span className="text-sm text-[var(--foreground)]/60">کل هزینه‌ها</span>
                      <span className="font-bold text-red-500">{toPersianNumber(summary.total_expenses)} تومان</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 rounded-xl bg-[var(--foreground)]/5">
                      <span className="text-sm text-[var(--foreground)]/60">سود خالص</span>
                      <span className={cn("font-bold", summary.net_profit >= 0 ? "text-[#10b981]" : "text-red-500")}>
                        {toPersianNumber(summary.net_profit)} تومان
                      </span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-[var(--foreground)]/5">
                      <span className="text-sm text-[var(--foreground)]/60">حاشیه سود</span>
                      <span className="font-bold text-[#8b5cf6]">{summary.profit_margin}٪</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

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
                          <th className="p-4 font-medium">شناسه</th>
                          <th className="p-4 font-medium">مبلغ</th>
                          <th className="p-4 font-medium">پلن</th>
                          <th className="p-4 font-medium">وضعیت</th>
                          <th className="p-4 font-medium">تاریخ</th>
                          <th className="p-4 font-medium">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredTransactions.length === 0 ? (
                          <tr><td colSpan={6} className="p-8 text-center text-[var(--foreground)]/40">تراکنشی یافت نشد.</td></tr>
                        ) : filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                            <td className="p-4 text-sm font-mono text-[var(--foreground)]/60" dir="ltr">{tx.id.slice(0, 8)}...</td>
                            <td className="p-4 font-bold text-[var(--foreground)]">{toPersianNumber(tx.amount_toman)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span></td>
                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs">{tx.plan}</span></td>
                            <td className="p-4">{getStatusBadge(tx.status)}</td>
                            <td className="p-4 text-sm text-[var(--foreground)]/60">{formatDate(tx.created_at)}</td>
                            <td className="p-4">
                              {tx.status === "paid" && (
                                <button 
                                  onClick={() => issueInvoice.mutate(tx.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors text-xs font-medium shadow-md"
                                >
                                  <FileText className="w-3 h-3" /> صدور فاکتور
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "expenses" && (
            <>
              {expLoading && <Skeleton className="h-96 rounded-3xl" />}
              {expError && <ErrorState onRetry={() => expRefetch()} />}
              {expenses && (
                <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)]">
                        <tr className="text-sm text-[var(--foreground)]/60">
                          <th className="p-4 font-medium">عنوان</th>
                          <th className="p-4 font-medium">دسته‌بندی</th>
                          <th className="p-4 font-medium">مبلغ</th>
                          <th className="p-4 font-medium">تاریخ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredExpenses.length === 0 ? (
                          <tr><td colSpan={4} className="p-8 text-center text-[var(--foreground)]/40">هزینه‌ای ثبت نشده است. برای شروع، روی دکمه «ثبت هزینه» کلیک کنید.</td></tr>
                        ) : filteredExpenses.map((ex) => (
                          <tr key={ex.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                            <td className="p-4 font-medium text-[var(--foreground)]">{ex.title}</td>
                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs">{getCategoryLabel(ex.category)}</span></td>
                            <td className="p-4 font-bold text-red-500">{toPersianNumber(ex.amount_toman)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span></td>
                            <td className="p-4 text-sm text-[var(--foreground)]/60">{formatDate(ex.expense_date)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "invoices" && (
            <>
              {invLoading && <Skeleton className="h-96 rounded-3xl" />}
              {invError && <ErrorState onRetry={() => invRefetch()} />}
              {invoices && (
                <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)]">
                        <tr className="text-sm text-[var(--foreground)]/60">
                          <th className="p-4 font-medium">شماره فاکتور</th>
                          <th className="p-4 font-medium">مبلغ</th>
                          <th className="p-4 font-medium">پلن</th>
                          <th className="p-4 font-medium">تاریخ صدور</th>
                          <th className="p-4 font-medium">عملیات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {filteredInvoices.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-[var(--foreground)]/40">فاکتوری صادر نشده است.</td></tr>
                        ) : filteredInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                            <td className="p-4 font-mono text-sm text-[var(--foreground)]">{inv.invoice_number}</td>
                            <td className="p-4 font-bold text-[var(--foreground)]">{toPersianNumber(inv.amount_toman)} <span className="text-xs font-normal text-[var(--foreground)]/40">تومان</span></td>
                            <td className="p-4"><span className="px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6] text-xs">{inv.plan}</span></td>
                            <td className="p-4 text-sm text-[var(--foreground)]/60">{formatDate(inv.issued_at)}</td>
                            <td className="p-4">
                              <button 
                                onClick={() => router.push(`/admin/finance/invoices/${inv.id}`)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors text-xs font-medium shadow-md"
                              >
                                <FileText className="w-3 h-3" /> مشاهده فاکتور
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* مودال ثبت هزینه */}
          {isExpenseModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative border border-[var(--border-color)] bg-[var(--background)]">
                <button 
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="absolute top-4 left-4 p-1 text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold mb-6 text-[var(--foreground)]">ثبت هزینه جدید</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createExpense.mutate(newExpense);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm text-[var(--foreground)]/60 mb-1">عنوان</label>
                    <input
                      type="text"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--foreground)]/60 mb-1">دسته‌بندی</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none"
                    >
                      <option value="server">سرور و زیرساخت</option>
                      <option value="ai_api">هوش مصنوعی (API)</option>
                      <option value="marketing">بازاریابی</option>
                      <option value="salary">حقوق و دستمزد</option>
                      <option value="tools">ابزارها و نرم‌افزار</option>
                      <option value="other">سایر</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--foreground)]/60 mb-1">مبلغ (تومان)</label>
                    <input
                      type="number"
                      value={newExpense.amount_toman}
                      onChange={(e) => setNewExpense({ ...newExpense, amount_toman: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[var(--foreground)]/60 mb-1">توضیحات (اختیاری)</label>
                    <textarea
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button type="button" variant="glass" onClick={() => setIsExpenseModalOpen(false)}>لغو</Button>
                    <Button type="submit" disabled={createExpense.isPending}>ثبت هزینه</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}