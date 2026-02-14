import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HealthDeepResponse } from "@/lib/types";

export type ConnectionStatus = "full" | "partial" | "disconnected";

export function useConnectionStatus(wsConnected?: boolean) {
  const { data: healthData = null } = useQuery({
    queryKey: ["health-deep"],
    queryFn: async () => {
      try {
        return await api.get<HealthDeepResponse>("/health/deep");
      } catch {
        return null;
      }
    },
    refetchInterval: 30000,
    retry: false,
  });

  const apiConnected = healthData !== null;
  const ws = wsConnected ?? false;

  const status: ConnectionStatus =
    healthData?.status === "healthy" && ws
      ? "full"
      : apiConnected || ws
        ? "partial"
        : "disconnected";

  return { apiConnected, wsConnected: ws, status, healthData };
}
