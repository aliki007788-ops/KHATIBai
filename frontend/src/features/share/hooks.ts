"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shareService } from "./share.service";
import type { AddCommentPayload } from "./types";

/** ساخت یا بازیابی لینک عمومی برای یک تحلیل (کاربر وارد‌شده، صاحب تمرین). */
export function useCreateShare() {
  return useMutation({
    mutationFn: (speechId: string) => shareService.create(speechId),
  });
}

/** مشاهده‌ی عمومی تحلیل با توکن — صفحه‌ی بدون ورود. */
export function usePublicSpeech(token: string | null) {
  return useQuery({
    queryKey: ["share", "public", token],
    queryFn: () => shareService.getPublicView(token!),
    enabled: !!token,
    retry: false,
  });
}

/** افزودن بازخورد همتا — صفحه‌ی بدون ورود. */
export function useAddComment(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => shareService.addComment(token!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["share", "public", token] });
    },
    // صفحه‌ی عمومی به UIStore (که نیازمند AuthGuard است) وصل نیست؛
    // خطا در mutation.error در دسترس است و توسط خودِ صفحه نمایش داده می‌شود.
  });
}
