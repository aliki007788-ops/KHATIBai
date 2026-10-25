"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient } from "@/lib/api/client";
import { toPersianNumber } from "@/lib/utils/number";
import { ArrowRight, Printer, Download } from "lucide-react";

interface InvoiceDetails {
  id: string;
  invoice_number: string;
  user_id: string;
  user_name: string;
  user_email: string;
  plan: string;
  amount_toman: number;
  issued_at: string;
  transaction_ref: string;
}

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, isError } = useQuery<InvoiceDetails>({
    queryKey: ["admin", "finance", "invoice", invoiceId],
    queryFn: async () => (await apiClient.get(`/api/admin/finance/invoices/${invoiceId}`)).data,
    enabled: !!invoiceId,
  });

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch { return dateString; }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-8 pb-10">
          
          {/* دکمه‌های عملیات (در چاپ مخفی می‌شوند) */}
          <div className="flex justify-between items-center print:hidden">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowRight className="w-5 h-5" /> بازگشت
            </button>
            <div className="flex gap-2">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-colors shadow-md"
              >
                <Printer className="w-4 h-4" /> چاپ فاکتور
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl glass-panel hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4" /> دانلود PDF
              </button>
            </div>
          </div>

          {/* بدنه فاکتور */}
          {isLoading && <Skeleton className="h-[600px] rounded-3xl" />}
          {isError && (
            <div className="text-center text-red-500 p-8 glass-panel rounded-3xl">
              خطا در دریافت اطلاعات فاکتور. لطفاً دوباره تلاش کنید.
            </div>
          )}

          {invoice && (
            <div id="invoice-content" className="glass-panel p-10 rounded-3xl border border-[var(--border-color)] relative overflow-hidden print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
              
              {/* هدر فاکتور */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[var(--border-color)] pb-8 mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    خ
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-[var(--foreground)] print:text-black">خطیب</h1>
                    <p className="text-sm text-[var(--foreground)]/60 print:text-gray-600">پلتفرم هوشمند سخنرانی</p>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <h2 className="text-xl font-bold text-[var(--foreground)] print:text-black mb-1">فاکتور رسمی</h2>
                  <p className="text-sm text-[var(--foreground)]/60 print:text-gray-600 font-mono" dir="ltr">{invoice.invoice_number}</p>
                </div>
              </div>

              {/* اطلاعات کاربر و فاکتور */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)]/40 print:text-gray-500 mb-3 uppercase tracking-wider">صادر شده برای:</h3>
                  <p className="text-lg font-bold text-[var(--foreground)] print:text-black">{invoice.user_name || "کاربر خطیب"}</p>
                  <p className="text-sm text-[var(--foreground)]/60 print:text-gray-600" dir="ltr">{invoice.user_email}</p>
                </div>
                <div className="md:text-left">
                  <h3 className="text-sm font-bold text-[var(--foreground)]/40 print:text-gray-500 mb-3 uppercase tracking-wider">جزئیات فاکتور:</h3>
                  <div className="space-y-1 text-sm">
                    <p className="print:text-black"><span className="text-[var(--foreground)]/60 print:text-gray-600">تاریخ صدور:</span> <span className="font-medium">{formatDate(invoice.issued_at)}</span></p>
                    <p className="print:text-black"><span className="text-[var(--foreground)]/60 print:text-gray-600">شناسه تراکنش:</span> <span className="font-mono text-xs">{invoice.transaction_ref || "—"}</span></p>
                  </div>
                </div>
              </div>

              {/* جدول اقلام */}
              <div className="border border-[var(--border-color)] print:border-gray-300 rounded-2xl overflow-hidden mb-10">
                <table className="w-full text-right">
                  <thead className="bg-[var(--foreground)]/5 print:bg-gray-100">
                    <tr className="text-sm text-[var(--foreground)]/60 print:text-gray-600">
                      <th className="p-4 font-medium">شرح خدمات</th>
                      <th className="p-4 font-medium">پلن</th>
                      <th className="p-4 font-medium text-left">مبلغ (تومان)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[var(--border-color)] print:border-gray-300">
                      <td className="p-4 font-medium text-[var(--foreground)] print:text-black">اشتراک خطیب</td>
                      <td className="p-4">
                        <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/10 text-[#8b5cf6] text-xs font-bold">
                          {invoice.plan}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-left text-[var(--foreground)] print:text-black" dir="ltr">
                        {toPersianNumber(invoice.amount_toman)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* جمع کل */}
              <div className="flex justify-end mb-10">
                <div className="w-full md:w-1/2 space-y-3">
                  <div className="flex justify-between p-3 rounded-xl bg-[var(--foreground)]/5 print:bg-gray-100">
                    <span className="text-sm text-[var(--foreground)]/60 print:text-gray-600">جمع کل:</span>
                    <span className="font-bold text-[var(--foreground)] print:text-black">{toPersianNumber(invoice.amount_toman)} تومان</span>
                  </div>
                  <div className="flex justify-between p-4 rounded-xl bg-gradient-to-r from-[#8b5cf6]/10 to-[#3b82f6]/10 print:from-transparent print:to-transparent border border-[#8b5cf6]/20 print:border-gray-300">
                    <span className="font-bold text-[var(--foreground)] print:text-black">مبلغ نهایی:</span>
                    <span className="font-black text-lg text-[#8b5cf6] print:text-black">{toPersianNumber(invoice.amount_toman)} تومان</span>
                  </div>
                </div>
              </div>

              {/* فوتر فاکتور */}
              <div className="text-center border-t border-[var(--border-color)] print:border-gray-300 pt-8">
                <p className="text-sm text-[var(--foreground)]/60 print:text-gray-600 mb-1">از اعتماد شما سپاسگزاریم.</p>
                <p className="text-xs text-[var(--foreground)]/40 print:text-gray-400">این فاکتور به صورت الکترونیکی صادر شده و نیازی به مهر و امضا ندارد.</p>
              </div>

            </div>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}