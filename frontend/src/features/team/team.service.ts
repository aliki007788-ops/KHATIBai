import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { MemberProgress, Organization } from "./types";

export const teamService = {
  getMine: async () => {
    const res = await apiClient.get<Organization | null>(endpoints.team.me);
    return res.data;
  },
  create: async (name: string) => {
    const res = await apiClient.post<Organization>(endpoints.team.create, { name });
    return res.data;
  },
  join: async (inviteCode: string) => {
    const res = await apiClient.post<Organization>(endpoints.team.join, { invite_code: inviteCode });
    return res.data;
  },
  leave: async () => {
    await apiClient.post(endpoints.team.leave);
  },
  members: async () => {
    const res = await apiClient.get<MemberProgress[]>(endpoints.team.members);
    return res.data;
  },
  // لینک ساده برای دانلود CSV اعتبارسنجی (JWT) ندارد، پس باید با apiClient
  // (که توکن را در هدر می‌فرستد) خودمان فایل را بگیریم و دانلودش کنیم.
  downloadCsv: async () => {
    const res = await apiClient.get(endpoints.team.exportCsv, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = "khatib-team-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
