import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import type { AddCommentPayload, CommentItem, PublicSpeechView, ShareResponse } from "./types";

export const shareService = {
  /** ایجاد (یا بازیابی) لینک عمومیِ یک تحلیل — نیازمند ورود، فقط صاحبِ تمرین می‌تواند بسازد. */
  create: async (speechId: string) => {
    const res = await apiClient.post<ShareResponse>(endpoints.share.create(speechId));
    return res.data;
  },

  /** مشاهده‌ی عمومیِ تحلیل با توکن — بدون نیاز به ورود. */
  getPublicView: async (token: string) => {
    const res = await apiClient.get<PublicSpeechView>(endpoints.share.publicView(token));
    return res.data;
  },

  /** افزودن بازخورد/نظر همتا — بدون نیاز به ورود. */
  addComment: async (token: string, payload: AddCommentPayload) => {
    const res = await apiClient.post<CommentItem>(endpoints.share.comments(token), payload);
    return res.data;
  },
};
