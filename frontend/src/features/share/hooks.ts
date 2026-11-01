"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { shareService } from "./share.service";
import type { AddCommentPayload, CreateSharePayload, UpdateSharePayload } from "./types";

export function useCreateShare() {
  return useMutation({
    mutationFn: ({ speechId, payload }: { speechId: string; payload?: CreateSharePayload }) =>
      shareService.create(speechId, payload),
  });
}

export function useShareStatus(speechId: string | null) {
  return useQuery({
    queryKey: ["share", "status", speechId],
    queryFn: () => shareService.status(speechId!),
    enabled: !!speechId,
  });
}

export function useUpdateShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ speechId, payload }: { speechId: string; payload: UpdateSharePayload }) =>
      shareService.update(speechId, payload),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["share", "status", vars.speechId] });
    },
  });
}

export function useRevokeShare() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (speechId: string) => shareService.revoke(speechId),
    onSuccess: (_data, speechId) => {
      qc.invalidateQueries({ queryKey: ["share", "status", speechId] });
    },
  });
}

export function usePublicSpeech(token: string | null) {
  return useQuery({
    queryKey: ["share", "public", token],
    queryFn: () => shareService.getPublicView(token!),
    enabled: !!token,
    retry: false,
  });
}

export function useAddComment(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => shareService.addComment(token!, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["share", "public", token] });
    },
  });
}
