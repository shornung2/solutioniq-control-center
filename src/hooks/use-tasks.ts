import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, TaskListResponse, TaskTrace } from "@/lib/types";

export function useTasks(status?: string) {
  const endpoint = status && status !== "all" ? `/tasks?limit=20&status=${status}` : "/tasks?limit=20";
  return useQuery<Task[]>({
    queryKey: ["tasks", status],
    queryFn: async () => {
      const res = await api.get<TaskListResponse>(endpoint);
      return res.tasks || [];
    },
    refetchInterval: 10000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: { title: string; priority: number }) =>
      api.post<Task>("/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTaskTrace(taskId: string | null) {
  return useQuery<TaskTrace>({
    queryKey: ["task-trace", taskId],
    queryFn: () => api.get<TaskTrace>(`/tasks/${taskId}/trace`),
    enabled: !!taskId,
  });
}
