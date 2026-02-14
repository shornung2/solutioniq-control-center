import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HealthDeepResponse } from "@/lib/types";

export type ConnectionStatus = "full" | "partial" | "disconnected";

export function useConnectionStatus() {
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

  const status: ConnectionStatus =
    healthData?.status === "healthy"
      ? "full"
      : healthData?.status === "degraded"
        ? "partial"
        : "disconnected";

  const isDegraded = healthData?.status === "degraded";

  return { status, healthData, isDegraded };
}
