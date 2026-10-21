/** Aligned with backend: app/schemas/progress.py */

export interface ProgressSummary {
  practice_count: number;
  best_score: number | null;
  average_score: number | null;
  weekly_average_score: number | null;
  monthly_average_score: number | null;
  current_streak_days: number;
  score_trend: Array<Record<string, unknown>>;
}

export interface DimensionTrend {
  dimension: string;
  label_fa: string;
  recent_average: number;
  previous_average: number;
  change_percent: number;
}
