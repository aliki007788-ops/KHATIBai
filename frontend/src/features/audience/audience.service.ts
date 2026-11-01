import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface AudienceSessionRecord {
  id: string;
  duration_seconds: number;
  avg_energy: number;
  peak_energy: number;
  engagement_score: number;
  silence_seconds: number;
  audience_size: number;
  mode: string;
  notes: string | null;
  created_at: string;
}

export const audienceService = {
  save: async (payload: {
    duration_seconds: number;
    avg_energy: number;
    peak_energy: number;
    engagement_score: number;
    silence_seconds: number;
    audience_size: number;
    mode: string;
    notes?: string;
  }) => {
    const res = await apiClient.post<AudienceSessionRecord>(endpoints.audience.sessions, payload);
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get<AudienceSessionRecord[]>(endpoints.audience.sessions);
    return res.data;
  },
};
