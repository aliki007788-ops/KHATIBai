"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { teamService } from "./team.service";

export function useMyTeam() {
  return useQuery({
    queryKey: ["team", "me"],
    queryFn: teamService.getMine,
  });
}

export function useTeamMembers(enabled: boolean) {
  return useQuery({
    queryKey: ["team", "members"],
    queryFn: teamService.members,
    enabled,
  });
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => teamService.create(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });
}

export function useJoinTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => teamService.join(inviteCode),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });
}

export function useLeaveTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => teamService.leave(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team"] }),
  });
}
