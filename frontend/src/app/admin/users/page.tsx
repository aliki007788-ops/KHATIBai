"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { Users, CheckCircle2, XCircle, Plus, X } from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });

  const { data, isLoading, isError, refetch } = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => (await apiClient.get(endpoints.admin.users)).data,
    staleTime: 30_000,
  });

  const createUser = useMutation({
    mutationFn: (payload: { name: string; email: string; password: string }) =>
      apiClient.post(endpoints.auth.register, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", password: "" });
    },
  });

  const updatePlan = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      apiClient.patch(endpoints.admin.user(id) + "/plan", { plan }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      apiClient.patch(endpoints.admin.user(id) + "/active", { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-6xl space-y-8 pb-10">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-2xl"><Users className="w-8 h-8" /></div>
              <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">مدیریت کاربران</h1>
                <p className="text-[var(--foreground)]/60 mt-1">مشاهده، ویرایش پلن و افزودن کاربر جدید</p>
              </div>
            </div>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> افزودن کاربر
            </Button>
          </div>

          {isLoading && <Skeleton className="h-64 rounded-3xl" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <div className="glass-panel rounded-3xl overflow-hidden border border-[var(--border-color)]">
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-[var(--foreground)]/5">
                    <tr className="text-sm text-[var(--foreground)]/60">
                      <th className="p-4 font-medium">نام</th>
                      <th className="p-4 font-medium">ایمیل</th>
                      <th className="p-4 font-medium">پلن</th>
                      <th className="p-4 font-medium">نقش</th>
                      <th className="p-4 font-medium">وضعیت</th>
                      <th className="p-4 font-medium">تاریخ عضویت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {data.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--foreground)]/5 transition">
                        <td className="p-4 font-medium text-[var(--foreground)]">{user.name ?? "—"}</td>
                        <td className="p-4 text-[var(--foreground)]/60 text-sm" dir="ltr">{user.email}</td>
                        <td className="p-4">
                          <select
                            value={user.plan}
                            onChange={(e) => updatePlan.mutate({ id: user.id, plan: e.target.value })}
                            className="text-xs border border-[var(--border-color)] rounded-lg px-2 py-1 bg-[var(--background)] text-[var(--foreground)]"
                          >
                            <option value="free">رایگان</option>
                            <option value="base">پایه</option>
                            <option value="pro">حرفه‌ای</option>
                            <option value="enterprise">سازمانی</option>
                          </select>
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "admin" 
                              ? "bg-[#8b5cf6]/20 text-[#8b5cf6]" 
                              : "bg-[var(--foreground)]/10 text-[var(--foreground)]/60"
                          }`}>
                            {user.role === "admin" ? "مدیر" : "کاربر"}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => toggleActive.mutate({ id: user.id, is_active: !user.is_active })}
                            className={`flex items-center gap-1 text-xs font-medium ${user.is_active ? "text-green-500" : "text-red-500"}`}
                          >
                            {user.is_active ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                            {user.is_active ? "فعال" : "غیرفعال"}
                          </button>
                        </td>
                        <td className="p-4 text-sm text-[var(--foreground)]/60">{new Date(user.created_at).toLocaleDateString("fa-IR")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
                  createUser.mutate(newUser);
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
                <Button type="submit" className="w-full justify-center" loading={createUser.isPending}>
                  ثبت کاربر
                </Button>
              </form>
            </div>
          </div>
        )}
      </AppShell>
    </AuthGuard>
  );
}