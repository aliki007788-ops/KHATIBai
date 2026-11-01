import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface ExportData {
  user: Record<string, unknown>;
  speeches: Record<string, unknown>[];
  conversations: Record<string, unknown>[];
  subscriptions: Record<string, unknown>[];
  payments: Record<string, unknown>[];
  privacy: Record<string, unknown>;
}

export const privacyService = {
  exportData: async () => {
    const res = await apiClient.get<ExportData>(endpoints.privacy.export);
    return res.data;
  },
  deleteAccount: async () => {
    await apiClient.post(endpoints.privacy.deleteAccount, {
      confirmation: "DELETE_ACCOUNT",
    });
  },
};
