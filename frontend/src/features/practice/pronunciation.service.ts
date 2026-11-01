import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";

export interface PronunciationIssue {
  target: string;
  heard: string | null;
  note: string;
}

export interface PronunciationFeedback {
  overall_score: number;
  accuracy_notes: string;
  accent_notes: string;
  rhythm_notes: string;
  issues: PronunciationIssue[];
  improved_version: string;
  next_drill: string;
}

export const pronunciationService = {
  feedback: async (payload: {
    target_text: string;
    spoken_transcript: string;
    dialect: "fa" | "iq" | "ar";
  }) => {
    const res = await apiClient.post<PronunciationFeedback>(
      endpoints.practice.pronunciationFeedback,
      payload
    );
    return res.data;
  },
};
