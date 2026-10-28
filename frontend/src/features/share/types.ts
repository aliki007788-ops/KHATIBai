/** Aligned with backend app/schemas/share.py */

export interface ShareResponse {
  share_token: string;
  created_at: string;
}

export interface CommentItem {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface PublicSpeechView {
  topic_label: string | null;
  transcript: string | null;
  input_text: string | null;
  overall_score: number | null;
  dimension_scores: Record<string, number> | null;
  dimension_details: Record<string, string> | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  improvements: string[] | null;
  structure_notes: string | null;
  next_practice: string | null;
  audio_metrics: Record<string, number> | null;
  created_at: string;
  comments: CommentItem[];
}

export interface AddCommentPayload {
  author_name: string;
  content: string;
}
