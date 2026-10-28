"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toPersianNumber } from "@/lib/utils/number";
import { Users, Copy, Check, Download, LogOut, Crown, Shield, UserRound, RefreshCw, Trash2 } from "lucide-react";
import {
  useMyTeam,
  useTeamMembers,
  useCreateTeam,
  useJoinTeam,
  useLeaveTeam,
  useDeleteTeam,
  useTransferOwnership,
  useSetMemberRole,
  useRemoveMember,
  useRegenerateInvite,
} from "@/features/team/hooks";
import { teamService } from "@/features/team/team.service";

function roleLabel(role: string) {
  if (role === "owner") return "مالک تیم";
  if (role === "manager") return "مدیر";
  return "عضو";
}

function errorText(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? fallback;
}

function RoleIcon({ role }: { role: string }) {
  if (role === "owner") return <Crown className="w-4 h-4 text-amber-400" />;
  if (role === "manager") return <Shield className="w-4 h-4 text-blue-400" />;
  return <UserRound className="w-4 h-4 text-gray-400" />;
}

function CreateOrJoinTeam() {
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const createTeam = useCreateTeam();
  const joinTeam = useJoinTeam();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--accent)]" />
          ساخت یک تیم جدید
        </h3>
        <p className="text-sm text-[var(--foreground)]/60">
          اگر مربی، مدیر فروش یا آموزشگاه هستید و می‌خواهید پیشرفت چند نفر را زیر نظر داشته باشید، یک تیم بسازید.
        </p>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="نام تیم (مثلاً: تیم فروش شرکت ما)"
          className="glass-panel px-4 py-2 rounded-xl text-sm bg-transparent border border-white/10 focus:border-[var(--accent)] outline-none"
        />
        <Button
          onClick={() => createTeam.mutate(teamName)}
          loading={createTeam.isPending}
          disabled={teamName.trim().length < 2}
        >
          ساخت تیم
        </Button>
        {createTeam.isError && (
          <p className="text-xs text-red-400">
            {(createTeam.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
              "خطا در ساخت تیم."}
          </p>
        )}
      </div>

      <div className="glass-panel p-6 rounded-[2rem] flex flex-col gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--accent)]" />
          پیوستن به یک تیم
        </h3>
        <p className="text-sm text-[var(--foreground)]/60">
          اگر کد دعوت یک تیم را از مدیرتان دریافت کرده‌اید، اینجا وارد کنید.
        </p>
        <input
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="کد دعوت (مثلاً: AB12CD34)"
          className="glass-panel px-4 py-2 rounded-xl text-sm bg-transparent border border-white/10 focus:border-[var(--accent)] outline-none tracking-widest text-center"
        />
        <Button
          onClick={() => {
            const ok = window.confirm(
              "با پیوستن به تیم، نام، تعداد تمرین‌ها و امتیازهای شما برای اعضای تیم قابل مشاهده می‌شود " +
                "(ایمیل شما فقط برای مالک و مدیران دیده می‌شود). ادامه می‌دهید؟"
            );
            if (ok) joinTeam.mutate(inviteCode);
          }}
          loading={joinTeam.isPending}
          disabled={inviteCode.trim().length < 4}
          variant="secondary"
        >
          پیوستن به تیم
        </Button>
        {joinTeam.isError && (
          <p className="text-xs text-red-400">
            {(joinTeam.error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
              "خطا در پیوستن به تیم."}
          </p>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { data: team, isLoading: teamLoading } = useMyTeam();
  const { data: members, isLoading: membersLoading } = useTeamMembers(!!team);
  const leaveTeam = useLeaveTeam();
  const deleteTeam = useDeleteTeam();
  const transferOwnership = useTransferOwnership();
  const setMemberRole = useSetMemberRole();
  const removeMember = useRemoveMember();
  const regenerateInvite = useRegenerateInvite();
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const copyInviteCode = async () => {
    if (!team) return;
    try {
      await navigator.clipboard.writeText(team.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable; no-op */
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await teamService.downloadCsv();
    } finally {
      setExporting(false);
    }
  };

  const isOwner = team?.role === "owner";
  const isManager = team?.role === "manager";
  const actionError =
    leaveTeam.error ?? deleteTeam.error ?? transferOwnership.error ?? setMemberRole.error ?? removeMember.error ?? regenerateInvite.error;

  const confirmAnd = (message: string, action: () => void) => {
    if (window.confirm(message)) action();
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">تیم من</h1>
            <p className="text-[var(--foreground)]/60">
              پیشرفت اعضای تیم خود را در یک نگاه ببینید — مناسب مربیان، مدیران فروش و آموزشگاه‌ها.
            </p>
          </div>

          {teamLoading && <Skeleton className="h-40 rounded-[2rem]" />}

          {!teamLoading && !team && <CreateOrJoinTeam />}

          {!teamLoading && team && (
            <>
              <div className="glass-panel p-6 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="w-5 h-5 text-[var(--accent)]" />
                    {team.name}
                  </h2>
                  <p className="text-sm text-[var(--foreground)]/50 mt-1">
                    {toPersianNumber(team.member_count)} عضو · نقش شما: {roleLabel(team.role)}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={copyInviteCode}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-sm hover:bg-white/5 transition-all"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    کد دعوت: <span className="font-mono tracking-widest">{team.invite_code}</span>
                  </button>

                  {(isOwner || isManager) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={regenerateInvite.isPending}
                      onClick={() =>
                        confirmAnd("کد دعوت فعلی از کار می‌افتد و یک کد جدید ساخته می‌شود. ادامه می‌دهید؟", () =>
                          regenerateInvite.mutate()
                        )
                      }
                    >
                      <RefreshCw className="w-4 h-4" />
                      کد جدید
                    </Button>
                  )}

                  {(team.role === "owner" || team.role === "manager") && (
                    <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
                      <Download className="w-4 h-4" />
                      دانلود گزارش CSV
                    </Button>
                  )}

                  {!isOwner && (
                    <Button size="sm" variant="ghost" onClick={() => leaveTeam.mutate()} loading={leaveTeam.isPending}>
                      <LogOut className="w-4 h-4" />
                      ترک تیم
                    </Button>
                  )}

                  {isOwner && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={deleteTeam.isPending}
                      onClick={() =>
                        confirmAnd("تیم و عضویت همه‌ی اعضا برای همیشه حذف می‌شود. این کار قابل بازگشت نیست. ادامه می‌دهید؟", () =>
                          deleteTeam.mutate()
                        )
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">حذف تیم</span>
                    </Button>
                  )}
                </div>
              </div>

              {actionError != null && (
                <p className="text-sm text-red-400">{errorText(actionError, "انجام عملیات ممکن نشد.")}</p>
              )}

              <div className="glass-panel p-6 rounded-[2rem] overflow-x-auto">
                <h3 className="text-lg font-semibold mb-4">اعضای تیم</h3>

                {membersLoading && <Skeleton className="h-40 rounded-xl" />}

                {!membersLoading && members && members.length > 0 && (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-right text-[var(--foreground)]/50 border-b border-white/10">
                        <th className="py-2 font-medium">عضو</th>
                        <th className="py-2 font-medium">نقش</th>
                        <th className="py-2 font-medium">تعداد تمرین</th>
                        <th className="py-2 font-medium">میانگین امتیاز</th>
                        <th className="py-2 font-medium">بهترین امتیاز</th>
                        {(isOwner || isManager) && <th className="py-2 font-medium">عملیات</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.user_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3">
                            <div className="font-medium">{m.name ?? m.email ?? "عضو بدون نام"}</div>
                            {m.email && <div className="text-xs text-[var(--foreground)]/40">{m.email}</div>}
                          </td>
                          <td className="py-3">
                            <span className="flex items-center gap-1.5">
                              <RoleIcon role={m.role} />
                              {roleLabel(m.role)}
                            </span>
                          </td>
                          <td className="py-3">{toPersianNumber(m.practice_count)}</td>
                          <td className="py-3">
                            {m.average_score != null ? toPersianNumber(m.average_score) : "—"}
                          </td>
                          <td className="py-3">
                            {m.best_score != null ? toPersianNumber(m.best_score) : "—"}
                          </td>
                          {(isOwner || isManager) && (
                            <td className="py-3">
                              {m.role !== "owner" && (
                                <div className="flex items-center gap-1 flex-wrap">
                                  {isOwner && m.role === "member" && (
                                    <button
                                      className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:bg-white/5"
                                      onClick={() => setMemberRole.mutate({ userId: m.user_id, role: "manager" })}
                                    >
                                      ارتقا به مدیر
                                    </button>
                                  )}
                                  {isOwner && m.role === "manager" && (
                                    <button
                                      className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:bg-white/5"
                                      onClick={() => setMemberRole.mutate({ userId: m.user_id, role: "member" })}
                                    >
                                      تنزل به عضو
                                    </button>
                                  )}
                                  {isOwner && (
                                    <button
                                      className="px-2 py-1 rounded-lg text-xs border border-white/10 hover:bg-white/5"
                                      onClick={() =>
                                        confirmAnd("مالکیت تیم به این عضو منتقل می‌شود و شما مدیر می‌شوید. ادامه می‌دهید؟", () =>
                                          transferOwnership.mutate(m.user_id)
                                        )
                                      }
                                    >
                                      انتقال مالکیت
                                    </button>
                                  )}
                                  {(isOwner || (isManager && m.role === "member")) && (
                                    <button
                                      className="px-2 py-1 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10"
                                      onClick={() =>
                                        confirmAnd("این عضو از تیم حذف شود؟", () => removeMember.mutate(m.user_id))
                                      }
                                    >
                                      حذف
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
