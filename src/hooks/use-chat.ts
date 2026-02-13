import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatMessage, Task } from "@/lib/types";

export function useChatMessages() {
  const queryClient = useQueryClient();
  const [chatTaskIds, setChatTaskIds] = useState<string[]>([]);

  // Poll chat-type tasks for responses
  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat", "messages"],
    queryFn: async () => {
      // Get recent tasks that are chat type
      const tasks = await api.get<Task[]>("/tasks?limit=20");
      // Transform tasks into chat messages format
      return tasks
        .filter((t: any) => t.type === "chat" || chatTaskIds.includes(t.id))
        .flatMap((t: any) => {
          const msgs: ChatMessage[] = [];
          if (t.input || t.name) {
            msgs.push({
              id: `${t.id}-user`,
              role: "user",
              text: t.input || t.name,
              time: t.created,
            });
          }
          if (t.output) {
            msgs.push({
              id: `${t.id}-agent`,
              role: "agent",
              text: t.output,
              time: t.created,
            });
          }
          return msgs;
        });
    },
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      const task = await api.post<Task>("/tasks", { title: text, type: "chat" });
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
