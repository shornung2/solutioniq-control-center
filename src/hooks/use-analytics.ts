import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyticsSummary, AnalyticsCosts, AnalyticsRouting } from "@/lib/types";

export function useAnalyticsSummary() {
  return useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: () => api.get<AnalyticsSummary>("/analytics/summary"),
    refetchInterval: 30000,
  });
}

export function useAnalyticsCosts(days: number) {
  return useQuery<AnalyticsCosts>({
    queryKey: ["analytics-costs", days],
    queryFn: () => api.get<AnalyticsCosts>(`/analytics/costs?days=${days}`),
  });
}

export function useAnalyticsRouting(days: number) {
  return useQuery<AnalyticsRouting>({
    queryKey: ["analytics-routing", days],
    queryFn: () => api.get<AnalyticsRouting>(`/analytics/routing?days=${days}`),
  });
}
