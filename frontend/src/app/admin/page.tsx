"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { Users, CreditCard, BarChart3, Activity, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminStats {
  total_users: number;
  active_subscriptions: number;
  monthly_revenue: number;
  today_practices: number;
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => (await apiClient.get(endpoints.admin.stats)).data,
    staleTime: 30_000,
  });

  const stats = [
    { title: "کل کاربران", value: data?.total_users, color: "text-[#8b5cf6]", icon: Users },
    { title: "اشتراک فعال", value: data?.active_subscriptions, color: "text-[#10b981]", icon: CreditCard },
    { title: "درآمد ماهانه", value: data?.monthly_revenue, color: "text-[#3b82f6]", icon: BarChart3, suffix: "تومان" },
    { title: "تمرین امروز", value: data?.today_practices, color: "text-[#ffd56b]", icon: Activity },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-6xl space-y-8 pb-10">
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">پنل مدیریت خطیب</h1>
              <p className="text-gray-500 mt-1">آمار کلی سیستم و دسترسی سریع به بخش‌ها</p>
            </div>
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <Card key={i} className="p-6 rounded-3xl flex flex-col items-center justify-center text-center">
                    <stat.icon className={`w-8 h-8 mb-3 ${stat.color}`} />
                    <h3 className="text-sm text-gray-500 mb-1">{stat.title}</h3>
                    <div className={`text-2xl font-black ${stat.color}`}>
                      {stat.value != null ? toPersianNumber(stat.value) : "—"}
                      {stat.suffix && <span className="text-xs font-normal text-gray-400 mr-1">{stat.suffix}</span>}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/users">
                  <Card className="p-6 rounded-3xl flex items-center justify-between hover:border-purple-200 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Users className="w-6 h-6" /></div>
                      <div>
                        <h3 className="font-bold text-gray-900">مدیریت کاربران</h3>
                        <p className="text-xs text-gray-500">مشاهده و ویرایش کاربران</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
                  </Card>
                </Link>

                <Link href="/admin/finance">
                  <Card className="p-6 rounded-3xl flex items-center justify-between hover:border-green-200 transition cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><CreditCard className="w-6 h-6" /></div>
                      <div>
                        <h3 className="font-bold text-gray-900">مدیریت مالی</h3>
                        <p className="text-xs text-gray-500">تراکنش‌ها و اشتراک‌ها</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition" />
                  </Card>
                </Link>
              </div>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}