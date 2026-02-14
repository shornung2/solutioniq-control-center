import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HealthDeepResponse } from "@/lib/types";

export type ConnectionStatus = "full" | "partial" | "disconnected";

export function useConnectionStatus(wsConnected?: boolean) {
  const { data: healthData = null } = useQuery({
    queryKey: ["health-deep"],
    queryFn: async (): Promise<HealthDeepResponse | null> => {
      try {
        return await api.get<HealthDeepResponse>("/health/deep");
      } catch {
        return null;
      }
    },
    refetchInterval: 30000,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 25000,
  });

  const apiConnected = healthData !== null;
  const ws = wsConnected ?? false;

  const status: ConnectionStatus =
    healthData?.status === "healthy" && ws
      ? "full"
      : apiConnected || ws
        ? "partial"
        : "disconnected";

  // Only report degraded when we have confirmed data, not on fetch failure
  const isDegraded = healthData?.status === "degraded";

  return { apiConnected, wsConnected: ws, status, healthData, isDegraded };
}
