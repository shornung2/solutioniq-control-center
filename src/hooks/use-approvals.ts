import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Approval } from "@/lib/types";

export function usePendingApprovals() {
  return useQuery<Approval[]>({
    queryKey: ["approvals", "pending"],
    queryFn: () => api.get<Approval[]>("/approvals/pending"),
    refetchInterval: 10000,
  });
}

export function useCompletedApprovals() {
  return useQuery<Approval[]>({
    queryKey: ["approvals", "completed"],
    queryFn: () => api.get<Approval[]>("/approvals/completed"),
  });
}

export function useApprovalAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action, notes }: { id: string; action: "approve" | "reject"; notes?: string }) =>
      api.post(`/approvals/${id}/${action}`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
    },
  });
}
