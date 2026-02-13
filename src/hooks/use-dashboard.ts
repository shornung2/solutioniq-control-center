import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AgentStatus, BudgetUsage, UsageMetrics } from "@/lib/types";

export function useDashboardData() {
  return useQuery<UsageMetrics>({
    queryKey: ["dashboard"],
    queryFn: () => api.get<UsageMetrics>("/usage/metrics"),
    refetchInterval: 15000,
  });
}

export function useAgentStatus() {
  return useQuery<AgentStatus>({
    queryKey: ["agent-status"],
    queryFn: () => api.get<AgentStatus>("/agent/status"),
    refetchInterval: 10000,
  });
}

export function useBudgetUsage() {
  return useQuery<BudgetUsage>({
    queryKey: ["budget"],
    queryFn: () => api.get<BudgetUsage>("/usage/budget"),
    refetchInterval: 30000,
  });
}

export function useAgentControl() {
  const pause = useMutation({
    mutationFn: () => api.post("/agent/pause", {}),
  });
  const resume = useMutation({
    mutationFn: () => api.post("/agent/resume", {}),
  });
  return { pause, resume };
}
