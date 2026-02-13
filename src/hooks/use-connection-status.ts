import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useConnectionStatus() {
  const { data: isConnected = false } = useQuery({
    queryKey: ["connection-status"],
    queryFn: api.healthCheck,
    refetchInterval: 10000,
    retry: false,
  });

  return isConnected;
}
