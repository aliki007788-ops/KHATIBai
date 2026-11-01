"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "./chat.service";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";
import { useRouter } from "next/navigation";

export function useConversations() {
  return useQuery({
    queryKey: ["chat", "list"],
    queryFn: chatService.list,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.get(id!),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const router = useRouter();
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (title?: string) => chatService.create(title),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["chat", "list"] });
      router.push(`/coach/${data.id}`);
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (text: string) => chatService.sendMessage(conversationId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", conversationId] });
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  const router = useRouter();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (id: string) => chatService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat"] });
      addToast("info", "گفتگو حذف شد");
      router.push("/coach");
    },
    onError: (e) => addToast("error", getErrorMessage(e)),
  });
}
