import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type ConnectionStatus = "full" | "partial" | "disconnected";

export function useConnectionStatus(wsConnected?: boolean) {
  const { data: apiConnected = false } = useQuery({
    queryKey: ["connection-status"],
    queryFn: api.healthCheck,
    refetchInterval: 10000,
    retry: false,
  });

  const ws = wsConnected ?? false;

  const status: ConnectionStatus =
    apiConnected && ws ? "full" : apiConnected || ws ? "partial" : "disconnected";

  return { apiConnected, wsConnected: ws, status };
}
