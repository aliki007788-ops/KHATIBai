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
  /** توضیح کوتاه هر بعد (key -> متن فارسی)، از گزینه A */
  dimension_details: Record<string, string> | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvements: string[] | null;
  structure_notes: string | null;
  next_practice: string | null;
  /** معیارهای صوتی librosa (گزینه B) — فقط برای mode="audio" پر می‌شود */
  audio_metrics: Record<string, number> | null;
  created_at: string;
  completed_at: string | null;

  // فیلدهای اضافی که در practice/page.tsx استفاده می‌شن
  dimensions?: Record<string, number> | null;
  coach_tip?: string | null;
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