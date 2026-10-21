import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  DailyRecommendation,
  Level,
  Scenario,
  StartScenarioResponse,
} from "@/types/learning";

export const learningService = {
  levels: async () => {
    const res = await apiClient.get<Level[]>(endpoints.learning.levels);
    return res.data;
  },

  scenarios: async (levelId: string) => {
    const res = await apiClient.get<Scenario[]>(
      endpoints.learning.scenarios(levelId)
    );
    return res.data;
  },

  start: async (scenarioId: string) => {
    const res = await apiClient.post<StartScenarioResponse>(
      endpoints.learning.start(scenarioId)
    );
    return res.data;
  },

  complete: async (scenarioId: string) => {
    await apiClient.post(endpoints.learning.complete(scenarioId));
  },

  daily: async () => {
    const res = await apiClient.get<DailyRecommendation>(endpoints.learning.daily);
    return res.data;
  },
};
