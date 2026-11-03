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
import { toPersianNumber } from "@/lib/utils/number";
import { useAdminPlans } from "@/features/plans/plans";

interface Stats {
  total_users: number;
  active_users: number;
  total_speeches: number;
  completed_speeches: number;
  active_subscriptions: number;
  paid_transactions: number;
  total_revenue_toman: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  active: boolean;
  created_at: string;
}

const fmt = (n: number) => toPersianNumber(n.toLocaleString("en-US"));

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--card-bg)",
  backdropFilter: "blur(16px)",
  border: "1px solid var(--border-color)",
  borderRadius: "1.5rem",
  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
};

const LINKS = [
  { href: "/admin/users", title: "مدیریت کاربران", desc: "نقش، پلن و فعال/غیرفعال‌کردن", icon: "👥" },
  { href: "/admin/plans", title: "مدیریت پلن‌ها", desc: "قیمت، ویژگی و بخش‌های هر پلن", icon: "🧩" },
  { href: "/admin/finance", title: "مدیریت مالی", desc: "تراکنش‌ها، هزینه‌ها و فاکتورها", icon: "💰" },
  { href: "/admin/audit", title: "گزارش فعالیت‌ها", desc: "ثبت اقدامات مدیران و پرداخت‌ها", icon: "🧾" },
  { href: "/admin/content", title: "مدیریت محتوا", desc: "سطوح و سناریوهای آموزش", icon: "📝" },
  { href: "/admin/settings", title: "وضعیت سیستم", desc: "پرداخت، هوش مصنوعی و محیط اجرا", icon: "⚙️" },
];

export default function AdminDashboard() {
  const stats = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await apiClient.get("/api/admin/stats")).data,
    staleTime: 30_000,
  });
  const recent = useQuery<AdminUser[]>({
    queryKey: ["admin", "users", "recent"],
    queryFn: async () => (await apiClient.get("/api/admin/users?limit=5")).data,
    staleTime: 30_000,
  });
  const { data: plans } = useAdminPlans();
  const planName = (code: string) => plans?.find((p) => p.code === code)?.name_fa ?? code;

  const s = stats.data;
  const cards = s
    ? [
        { title: "کل کاربران", value: fmt(s.total_users), color: "text-[#8b5cf6]" },
        { title: "اشتراک فعال", value: fmt(s.active_subscriptions), color: "text-[#10b981]" },
        { title: "درآمد کل (تومان)", value: fmt(s.total_revenue_toman), color: "text-[#3b82f6]" },
        { title: "تمرین‌های تکمیل‌شده", value: fmt(s.completed_speeches), color: "text-[#ffd56b]" },
      ]
    : [];

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("fa-IR");
    } catch {
      return d;
    }
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Sidebar role="admin" />

        <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
          <header className="flex justify-between items-center mb-10">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
              پنل مدیریت خطیب
            </h1>
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/dashboard">
                <Button variant="glass">مشاهده سایت</Button>
              </Link>
            </div>
          </header>

          {stats.isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          )}
          {stats.isError && (
            <div className="mb-10">
              <ErrorState onRetry={() => stats.refetch()} />
            </div>
          )}
          {s && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
              {cards.map((c) => (
                <div key={c.title} style={cardStyle} className="p-6 rounded-2xl">
                  <h3 className="text-sm text-[var(--foreground)]/50 mb-2">{c.title}</h3>
                  <div className={`text-3xl font-bold ${c.color}`}>{c.value}</div>
                </div>
              ))}
            </div>
          )}

          <div style={cardStyle} className="rounded-3xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">آخرین کاربران ثبت‌نام‌شده</h2>
              <Link href="/admin/users">
                <Button size="sm" variant="glass">
                  مشاهده همه
                </Button>
              </Link>
            </div>

            {recent.isLoading && <Skeleton className="h-32" />}
            {recent.isError && <ErrorState onRetry={() => recent.refetch()} />}
            {recent.data && (
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-[var(--foreground)]/50 text-sm">
                      <th className="pb-4 font-medium">نام کاربر</th>
                      <th className="pb-4 font-medium">ایمیل</th>
                      <th className="pb-4 font-medium">پلن</th>
                      <th className="pb-4 font-medium">تاریخ عضویت</th>
                      <th className="pb-4 font-medium">وضعیت</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {recent.data.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[var(--foreground)]/40">
                          هنوز کاربری ثبت‌نام نکرده است.
                        </td>
                      </tr>
                    )}
                    {recent.data.map((u) => (
                      <tr key={u.id} className="border-b border-[var(--border-color)]/50">
                        <td className="py-4 font-medium">{u.name || "—"}</td>
                        <td className="py-4 text-[var(--foreground)]/60" dir="ltr">{u.email}</td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">{planName(u.plan)}</span>
                        </td>
                        <td className="py-4 text-[var(--foreground)]/60">{formatDate(u.created_at)}</td>
                        <td className="py-4">
                          <span className={u.active ? "text-[#10b981]" : "text-red-400"}>{u.active ? "فعال" : "غیرفعال"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={cardStyle}
                className="p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-2xl">
                  {l.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{l.title}</h3>
                  <p className="text-sm text-[var(--foreground)]/50">{l.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
