import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatMessage, Task, TaskListResponse } from "@/lib/types";

export function useChatMessages() {
  const queryClient = useQueryClient();
  const [chatTaskIds, setChatTaskIds] = useState<string[]>([]);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat", "messages"],
    queryFn: async () => {
      const res = await api.get<TaskListResponse>("/tasks?limit=20");
      const tasks = res.tasks || [];
      return tasks
        .filter((t) => chatTaskIds.includes(t.id))
        .flatMap((t) => {
          const msgs: ChatMessage[] = [];
          if (t.title) {
            msgs.push({
              id: `${t.id}-user`,
              role: "user",
              text: t.title,
              time: t.created_at,
            });
          }
          if (t.result) {
            msgs.push({
              id: `${t.id}-agent`,
              role: "agent",
              text: t.result,
              time: t.created_at,
            });
          }
          return msgs;
        });
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const task = await api.post<Task>("/tasks", { title: text });
      return task;
    },
    onSuccess: (task) => {
      if (task?.id) {
        setChatTaskIds((prev) => [...prev, task.id]);
      }
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
    },
  });

  return { messages, isLoading, sendMessage: sendMutation.mutate, isSending: sendMutation.isPending };
}
