import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";

export function useTasks(status?: string) {
  const endpoint = status && status !== "all" ? `/tasks?status=${status}` : "/tasks";
  return useQuery<Task[]>({
    queryKey: ["tasks", status],
    queryFn: () => api.get<Task[]>(endpoint),
    refetchInterval: 10000,
  });
}
