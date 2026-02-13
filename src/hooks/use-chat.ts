import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Task, TaskListResponse } from "@/lib/types";

export interface ChatItem {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
  status?: string;
}

export function useChatMessages() {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatItem[]>({
    queryKey: ["chat", "messages"],
    queryFn: async () => {
      const res = await api.get<TaskListResponse>("/tasks?limit=20");
      const tasks = res.tasks || [];
      const items: ChatItem[] = [];

      const sorted = [...tasks].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      for (const t of sorted) {
        if (t.title) {
          items.push({
            id: `${t.id}-user`,
            role: "user",
            text: t.title,
            time: t.created_at,
          });
        }
        if (t.result) {
          items.push({
            id: `${t.id}-agent`,
            role: "agent",
            text: t.result,
            time: t.created_at,
          });
        } else if (t.status === "pending" || t.status === "running") {
          items.push({
            id: `${t.id}-agent`,
            role: "agent",
            text: t.status === "running" ? "Processing..." : "Waiting for response...",
            time: t.created_at,
            status: t.status,
          });
        }
      }

      return items;
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const task = await api.post<Task>("/tasks", { title: text });
      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
}
