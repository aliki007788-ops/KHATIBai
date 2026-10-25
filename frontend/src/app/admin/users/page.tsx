"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { Search, UserCheck, UserX, Plus, X, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  active: boolean;
  email_verified: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const queryClient = useQueryClient();

  // دریافت لیست کاربران
  const { data: users, isLoading, isError, refetch } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users", searchTerm],
    queryFn: async () => {
      const url = searchTerm 
        ? `${endpoints.admin.users}?search=${encodeURIComponent(searchTerm)}`
        : endpoints.admin.users;
      const res = await apiClient.get(url);
      return res.data;
    },
    staleTime: 30_000,
  });

  // تغییر وضعیت فعال/غیرفعال
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ userId, active }: { userId: string; active: boolean }) => {
      const res = await apiClient.patch(`${endpoints.admin.users}/${userId}/active`, { active });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  // تغییر پلن کاربر
  const changePlanMutation = useMutation({
    mutationFn: async ({ userId, plan }: { userId: string; plan: string }) => {
      const res = await apiClient.patch(`${endpoints.admin.users}/${userId}/plan`, { plan });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  // ایجاد کاربر جدید
  const createUserMutation = useMutation({
    mutationFn: async (payload: { name: string; email: string; password: string }) => {
      const res = await apiClient.post(endpoints.auth.register, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", password: "" });
      alert("کاربر با موفقیت ایجاد شد.");
    },
    onError: () => {
      alert("خطا در ایجاد کاربر.");
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

  const getPlanBadge = (plan: string) => {
    const plans: Record<string, { label: string; color: string }> = {
      free: { label: "رایگان", color: "bg-gray-500/10 text-gray-500" },
      pro: { label: "حرفه‌ای", color: "bg-[#8b5cf6]/10 text-[#8b5cf6]" },
      enterprise: { label: "سازمانی", color: "bg-[#3b82f6]/10 text-[#3b82f6]" },
    };
    const p = plans[plan] || { label: plan, color: "bg-gray-500/10 text-gray-500" };
    return <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", p.color)}>{p.label}</span>;
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl space-y-8 pb-10">
          
          {/* هدر */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-6">
            <div>
              <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت کاربران</h1>
              <p className="text-[var(--foreground)]/60 mt-1">مشاهده، ویرایش پلن و افزودن کاربر جدید</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> افزودن کاربر
              </Button>
              <Link href="/admin">
                <Button variant="glass">← بازگشت</Button>
              </Link>
            </div>
          </div>

          {/* نوار جستجو */}
          <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground)]/40" />
              <input
                type="text"
                placeholder="جستجو بر اساس نام یا ایمیل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-3 pr-12 text-sm outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* جدول کاربران */}
          {isLoading && <Skeleton className="h-96 rounded-3xl" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {users && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[var(--foreground)]/5 border-b border-[var(--border-color)]">
                    <tr className="text-sm text-[var(--foreground)]/60">
                      <th className="p-4 font-medium">کاربر</th>
                      <th className="p-4 font-medium">ایمیل</th>
                      <th className="p-4 font-medium">نقش</th>
                      <th className="p-4 font-medium">پلن</th>
                      <th className="p-4 font-medium">تاریخ عضویت</th>
                      <th className="p-4 font-medium">وضعیت</th>
                      <th className="p-4 font-medium">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[var(--foreground)]/40">
                          کاربری یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-[var(--foreground)]/5 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white font-bold">
                                {user.name?.charAt(0) || "?"}
                              </div>
                              <span className="font-medium">{user.name || "—"}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-[var(--foreground)]/60" dir="ltr">{user.email}</td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-xs font-medium",
                              user.role === "admin" ? "bg-[#ff7b54]/10 text-[#ff7b54]" : "bg-gray-500/10 text-gray-500"
                            )}>
                              {user.role === "admin" ? "مدیر" : "کاربر"}
                            </span>
                          </td>
                          <td className="p-4">
                            <select
                              value={user.plan}
                              onChange={(e) => changePlanMutation.mutate({ userId: user.id, plan: e.target.value })}
                              className="text-xs border border-[var(--border-color)] rounded-lg px-2 py-1 bg-[var(--background)] text-[var(--foreground)]"
                            >
                              <option value="free">رایگان</option>
                              <option value="base">پایه</option>
                              <option value="pro">حرفه‌ای</option>
                              <option value="enterprise">سازمانی</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm text-[var(--foreground)]/60">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.created_at)}
                            </div>
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => toggleActiveMutation.mutate({ userId: user.id, active: !user.active })}
                              className={cn(
                                "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                                user.active 
                                  ? "bg-[#10b981]/10 text-[#10b981] hover:bg-[#10b981]/20" 
                                  : "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                              )}
                            >
                              {user.active ? (
                                <><UserCheck className="w-3 h-3" /> فعال</>
                              ) : (
                                <><UserX className="w-3 h-3" /> غیرفعال</>
                              )}
                            </button>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2 justify-end">
                              <button
                                onClick={() => toggleActiveMutation.mutate({ userId: user.id, active: !user.active })}
                                className={cn(
                                  "p-2 rounded-lg transition-colors",
                                  user.active 
                                    ? "hover:bg-red-500/10 text-red-400" 
                                    : "hover:bg-green-500/10 text-green-400"
                                )}
                                title={user.active ? "غیرفعال کردن" : "فعال کردن"}
                              >
                                {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* شمارنده */}
          {users && (
            <div className="text-sm text-[var(--foreground)]/50 text-left">
              نمایش {toPersianNumber(users.length)} کاربر
            </div>
          )}

        </div>

        {/* مودال افزودن کاربر */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="glass-panel w-full max-w-md p-6 rounded-3xl relative border border-[var(--border-color)] bg-[var(--background)]">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 left-4 p-1 text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold mb-6 text-[var(--foreground)]">افزودن کاربر جدید</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createUserMutation.mutate(newUser);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm text-[var(--foreground)]/60 mb-1">نام</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground)]/60 mb-1">ایمیل</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--foreground)]/60 mb-1">رمز عبور</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--background)] text-[var(--foreground)] px-4 py-2.5 text-sm outline-none focus:border-[var(--primary)]"
                    dir="ltr"
                    required
                  />
                </div>
                <Button type="submit" className="w-full justify-center" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "در حال ثبت..." : "ثبت کاربر"}
                </Button>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}