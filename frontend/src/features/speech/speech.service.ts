import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { Speech, SpeechListItem, TextSpeechPayload } from "@/types/speech";

export const speechService = {
  createText: async (payload: TextSpeechPayload) => {
    const res = await apiClient.post<Speech>(endpoints.speech.text, payload);
    return res.data;
  },

  createAudio: async (topicLabel: string, file: File) => {
    const form = new FormData();
    form.append("topic_label", topicLabel);
    form.append("file", file);
    const res = await apiClient.post<Speech>(endpoints.speech.audio, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  list: async () => {
    const res = await apiClient.get<SpeechListItem[]>(endpoints.speech.list);
    return res.data;
  },

  get: async (id: string) => {
    const res = await apiClient.get<Speech>(endpoints.speech.detail(id));
    return res.data;
  },

  remove: async (id: string) => {
    await apiClient.delete(endpoints.speech.detail(id));
  },
};
