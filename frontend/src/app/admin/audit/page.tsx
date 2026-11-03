"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Sidebar } from "@/components/layout/Sidebar";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { toPersianNumber } from "@/lib/utils/number";

interface AuditItem {
  id: string;
  user_id: string | null;
  action: string;
  detail: string | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_FA: Record<string, string> = {
  admin_set_user_plan: "تغییر پلن کاربر",
  admin_set_user_role: "تغییر نقش کاربر",
  admin_change_user_active: "فعال/غیرفعال‌کردن کاربر",
  admin_plan_create: "ساخت پلن",
  admin_plan_update: "ویرایش پلن",
  admin_plan_delete: "حذف پلن",
  checkout_created: "ایجاد پرداخت",
  payment_success: "پرداخت موفق",
};

export default function AdminAuditPage() {
  const [filter, setFilter] = useState("");
  const { data, isLoading, isError, refetch } = useQuery<AuditItem[]>({
    queryKey: ["admin", "audit"],
    queryFn: async () => (await apiClient.get("/api/admin/audit?limit=200")).data,
  });

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((r) =>
      [r.action, ACTION_FA[r.action] ?? "", r.detail ?? "", r.ip_address ?? "", r.user_id ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [data, filter]);

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("fa-IR");
    } catch {
      return d;
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar role="admin" />
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
                گزارش فعالیت‌ها
              </h1>
              <p className="mt-1 text-sm text-[var(--foreground)]/60">آخرین ۲۰۰ اقدام ثبت‌شده‌ی مدیران و پرداخت‌ها</p>
            </div>
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <Link href="/admin">
                <Button variant="glass">← بازگشت</Button>
              </Link>
            </div>
          </header>

          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="جستجو در اقدام، جزئیات یا IP..."
            className="mb-6 w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)]"
          />

          {isLoading && <Skeleton className="h-64" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)] text-[var(--foreground)]/60">
                    <tr>
                      <th className="p-4 font-medium">زمان</th>
                      <th className="p-4 font-medium">اقدام</th>
                      <th className="p-4 font-medium">جزئیات</th>
                      <th className="p-4 font-medium">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-[var(--foreground)]/40">
                          موردی یافت نشد.
                        </td>
                      </tr>
                    )}
                    {rows.map((r) => (
                      <tr key={r.id}>
                        <td className="p-4 whitespace-nowrap text-[var(--foreground)]/60">{fmtDate(r.created_at)}</td>
                        <td className="p-4 font-medium">{ACTION_FA[r.action] ?? r.action}</td>
                        <td className="p-4 text-[var(--foreground)]/60" dir="ltr">{r.detail ?? "—"}</td>
                        <td className="p-4 text-[var(--foreground)]/60" dir="ltr">{r.ip_address ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {data && (
            <p className="mt-4 text-sm text-[var(--foreground)]/50">نمایش {toPersianNumber(rows.length)} مورد</p>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
