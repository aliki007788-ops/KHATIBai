/** Aligned with backend: app/schemas/progress.py */

export interface ProgressBadge {
  id: string;
  label: string;
  icon: string;
  earned: boolean;
}

export interface ProgressSummary {
  practice_count: number;
  best_score: number | null;
  average_score: number | null;
  weekly_average_score: number | null;
  monthly_average_score: number | null;
  current_streak_days: number;
  score_trend: Array<{ date?: string; score?: number } & Record<string, unknown>>;
  xp: number;
  level: number;
  xp_to_next_level: number;
  weekly_practice_count: number;
  weekly_challenge_target: number;
  platform_average_score: number | null;
  daily_practice_count: number;
  daily_challenge_target: number;
  days_since_last_practice: number | null;
  reminder_message: string | null;
  badges: ProgressBadge[] | null;
}

export interface DimensionTrend {
  dimension: string;
  label_fa: string;
  recent_average: number;
  previous_average: number;
  change_percent: number;
}
