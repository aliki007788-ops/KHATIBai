/** Aligned with backend app/schemas/speech.py */

export type SpeechMode = "text" | "audio";
export type SpeechStatus = "pending" | "processing" | "completed" | "failed";

export interface Speech {
  id: string;
  mode: SpeechMode | string;
  status: SpeechStatus | string;
  topic_label: string | null;
  input_text: string | null;
  transcript: string | null;
  duration_sec: number | null;
  overall_score: number | null;
  dimension_scores: Record<string, number> | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvements: string[] | null;
  structure_notes: string | null;
  next_practice: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface SpeechListItem {
  id: string;
  mode: string;
  status: string;
  topic_label: string | null;
  overall_score: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface TextSpeechPayload {
  topic_label: string;
  text: string;
}
