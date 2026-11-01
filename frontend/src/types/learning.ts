/** Aligned with backend: app/schemas/learning.py */

export interface Level {
  id: string;
  code: string;
  name_fa: string;
  order_index: number;
  description_fa: string | null;
  unlocked: boolean;
  completed_count: number;
  total_count: number;
}

export interface Scenario {
  id: string;
  category: string;
  order_index: number;
  title_fa: string;
  description_fa: string;
  key_vocabulary: unknown[];
  status: string;
  unlocked: boolean;
}

export interface DailyRecommendation {
  kind: string;
  title_fa: string;
  description_fa: string;
  action_scenario_id: string | null;
  action_topic_label: string | null;
}

export interface StartScenarioResponse {
  conversation_id: string;
}
