import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

export function useChatMessages() {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["chat", "messages"],
    queryFn: () => api.get<ChatMessage[]>("/chat/messages"),
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => api.post<ChatMessage>("/chat", { text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat", "messages"] });
    },
  });

  return { messages, isLoading, sendMessage: sendMutation.mutate, isSending: sendMutation.isPending };
}
