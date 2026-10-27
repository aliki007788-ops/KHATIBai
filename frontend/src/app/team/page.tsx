"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toPersianNumber } from "@/lib/utils/number";
import { Users, Copy, Check, Download, LogOut, Crown, Shield, UserRound } from "lucide-react";
import { useMyTeam, useTeamMembers, useCreateTeam, useJoinTeam, useLeaveTeam } from "@/features/team/hooks";
import { teamService } from "@/features/team/team.service";

function roleLabel(role: string) {
  if (role === "owner") return "مالک تیم";
  if (role === "manager") return "مدیر";
  return "عضو";
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
          onClick={() => joinTeam.mutate(inviteCode)}
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

                  {(team.role === "owner" || team.role === "manager") && (
                    <Button size="sm" variant="secondary" onClick={handleExport} loading={exporting}>
                      <Download className="w-4 h-4" />
                      دانلود گزارش CSV
                    </Button>
                  )}

                  {team.role !== "owner" && (
                    <Button size="sm" variant="ghost" onClick={() => leaveTeam.mutate()} loading={leaveTeam.isPending}>
                      <LogOut className="w-4 h-4" />
                      ترک تیم
                    </Button>
                  )}
                </div>
              </div>

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
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => (
                        <tr key={m.user_id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-3">
                            <div className="font-medium">{m.name ?? m.email}</div>
                            <div className="text-xs text-[var(--foreground)]/40">{m.email}</div>
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
