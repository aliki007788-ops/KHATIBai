import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type {
  AddCommentPayload,
  CommentItem,
  CreateSharePayload,
  PublicSpeechView,
  ShareResponse,
  UpdateSharePayload,
} from "./types";

export const shareService = {
  create: async (speechId: string, payload?: CreateSharePayload) => {
    const res = await apiClient.post<ShareResponse>(endpoints.share.create(speechId), payload ?? {});
    return res.data;
  },

  status: async (speechId: string) => {
    const res = await apiClient.get<ShareResponse | null>(endpoints.share.status(speechId));
    return res.data;
  },

  update: async (speechId: string, payload: UpdateSharePayload) => {
    const res = await apiClient.patch<ShareResponse>(endpoints.share.update(speechId), payload);
    return res.data;
  },

  revoke: async (speechId: string) => {
    const res = await apiClient.delete<ShareResponse>(endpoints.share.revoke(speechId));
    return res.data;
  },

  getPublicView: async (token: string) => {
    const res = await apiClient.get<PublicSpeechView>(endpoints.share.publicView(token));
    return res.data;
  },

  addComment: async (token: string, payload: AddCommentPayload) => {
    const res = await apiClient.post<CommentItem>(endpoints.share.comments(token), payload);
    return res.data;
  },
};
