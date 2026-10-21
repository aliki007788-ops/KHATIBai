"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { speechService } from "./speech.service";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";
import type { TextSpeechPayload } from "@/types/speech";
import { useRouter } from "next/navigation";

export function useSpeechList() {
  return useQuery({
    queryKey: ["speech", "list"],
    queryFn: speechService.list,
  });
}

export function useSpeech(id: string | null) {
  return useQuery({
    queryKey: ["speech", id],
    queryFn: () => speechService.get(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "pending" || status === "processing") return 2000;
      return false;
    },
  });
}

export function useCreateTextSpeech() {
  const router = useRouter();
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (payload: TextSpeechPayload) => speechService.createText(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["speech"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      addToast("success", "تمرین ثبت شد و در حال تحلیل است");
      router.push(`/practice/${data.id}`);
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useCreateAudioSpeech() {
  const router = useRouter();
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ topic, file }: { topic: string; file: File }) =>
      speechService.createAudio(topic, file),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["speech"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      addToast("success", "فایل صوتی ارسال شد");
      router.push(`/practice/${data.id}`);
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useDeleteSpeech() {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => speechService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["speech"] });
      addToast("info", "تمرین حذف شد");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
