import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { VideoMetrics } from "./analyzeFrames";

export interface VideoAnalysisRecord {
  id: string;
  title: string | null;
  speech_id: string | null;
  duration_seconds: number;
  frames_sampled: number;
  face_presence_pct: number;
  eye_contact_pct: number;
  looking_away_pct: number;
  stability_score: number;
  overall_score: number;
  engine: string;
  metrics_json: Record<string, unknown> | null;
  tips: string[] | null;
  created_at: string;
}

export const videoService = {
  save: async (metrics: VideoMetrics, title?: string) => {
    const res = await apiClient.post<VideoAnalysisRecord>(endpoints.video.analyses, {
      title: title || "تحلیل ویدیو",
      duration_seconds: metrics.durationSeconds,
      frames_sampled: metrics.framesSampled,
      face_presence_pct: metrics.facePresencePct,
      eye_contact_pct: metrics.eyeContactPct,
      looking_away_pct: metrics.lookingAwayPct,
      stability_score: metrics.stabilityScore,
      overall_score: metrics.overallScore,
      engine: metrics.engine,
      tips: metrics.tips,
      metrics_json: {
        sample_count: metrics.timeline.length,
        engine: metrics.engine,
      },
    });
    return res.data;
  },
  list: async () => {
    const res = await apiClient.get<VideoAnalysisRecord[]>(endpoints.video.analyses);
    return res.data;
  },
};
