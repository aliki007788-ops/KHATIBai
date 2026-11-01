import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface MeetingSession {
  id: string;
  provider: "zoom" | "meet" | "other" | string;
  title: string;
  meeting_url: string;
  notes: string | null;
  focus: string | null;
  speech_id: string | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export const meetingService = {
  list: async () => {
    const res = await apiClient.get<MeetingSession[]>(endpoints.meetings.list);
    return res.data;
  },
  create: async (payload: {
    title: string;
    meeting_url: string;
    notes?: string;
    focus?: string;
  }) => {
    const res = await apiClient.post<MeetingSession>(endpoints.meetings.create, payload);
    return res.data;
  },
  end: async (id: string, payload?: { notes?: string; speech_id?: string }) => {
    const res = await apiClient.post<MeetingSession>(endpoints.meetings.end(id), payload ?? {});
    return res.data;
  },
};
