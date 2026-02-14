import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type {
  ChatSendResponse,
  Conversation,
  ConversationMessage,
  Task,
} from "@/lib/types";

export interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  lane?: string;
  model?: string;
  cost_usd?: number;
  timestamp: string;
  status?: "sending" | "typing" | "degraded" | "error";
}

export function useConversations() {
  return useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: () => api.get<Conversation[]>("/chat/conversations"),
    refetchInterval: 15000,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery<ConversationMessage[]>({
    queryKey: ["conversation-messages", conversationId],
    queryFn: () =>
      api.get<ConversationMessage[]>(
        `/chat/conversations/${conversationId}/messages`
      ),
    enabled: !!conversationId,
  });
}

export function useChat() {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load conversation messages when switching
  const conversationQuery = useConversationMessages(activeConversationId);

  // Merge server messages with local optimistic ones
  const serverMessages: LocalMessage[] = (
    conversationQuery.data || []
  ).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    lane: m.lane,
    model: m.model,
    cost_usd: m.cost_usd,
    timestamp: m.timestamp,
  }));

  // Only show local messages that aren't duplicates of server messages
  const serverIds = new Set(serverMessages.map((m) => m.id));
  const uniqueLocal = localMessages.filter((m) => !serverIds.has(m.id));
  const messages = [...serverMessages, ...uniqueLocal];

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const pollForResult = useCallback(
    (taskId: string, placeholderId: string, conversationId: string) => {
      let attempts = 0;
      const maxAttempts = 30; // 60 seconds

      pollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const task = await api.get<Task>(`/tasks/${taskId}`);
          if (task.status === "completed" || task.status === "failed") {
            stopPolling();
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId
                  ? {
                      ...m,
                      content:
                        task.status === "completed"
                          ? task.result || "Done."
                          : task.error || "Something went wrong.",
                      status:
                        task.status === "failed" ? "error" : undefined,
                    }
                  : m
              )
            );
            queryClient.invalidateQueries({
              queryKey: ["conversation-messages", conversationId],
            });
            queryClient.invalidateQueries({
              queryKey: ["conversations"],
            });
          }
        } catch {
          // keep polling
        }
        if (attempts >= maxAttempts) {
          stopPolling();
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? {
                    ...m,
                    content: "Request timed out. Please try again.",
                    status: "error",
                  }
                : m
            )
          );
        }
      }, 2000);
    },
    [stopPolling, queryClient]
  );

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      // Add optimistic user message
      const userMsgId = `local-user-${Date.now()}`;
      const assistantPlaceholderId = `local-assistant-${Date.now()}`;
      const now = new Date().toISOString();

      setLocalMessages((prev) => [
        ...prev,
        {
          id: userMsgId,
          role: "user",
          content: text,
          timestamp: now,
          status: "sending",
        },
        {
          id: assistantPlaceholderId,
          role: "assistant",
          content: "",
          timestamp: now,
          status: "typing",
        },
      ]);

      try {
        const res = await api.post<ChatSendResponse>("/chat", {
          message: text,
          conversation_id: activeConversationId,
        });

        // Update conversation id
        if (!activeConversationId) {
          setActiveConversationId(res.conversation_id);
        }

        // Remove sending status from user message
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === userMsgId ? { ...m, status: undefined } : m
          )
        );

        if (res.status === "completed") {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: res.content || "Done.",
                    lane: res.lane,
                    model: res.model,
                    cost_usd: res.cost_usd,
                    status: undefined,
                  }
                : m
            )
          );
          queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });
          queryClient.invalidateQueries({
            queryKey: [
              "conversation-messages",
              res.conversation_id,
            ],
          });
        } else if (res.status === "degraded") {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: res.content || "Response received.",
                    lane: res.lane,
                    model: res.model,
                    cost_usd: res.cost_usd,
                    status: "degraded",
                  }
                : m
            )
          );
          queryClient.invalidateQueries({
            queryKey: ["conversations"],
          });
        } else if (res.status === "queued") {
          pollForResult(
            res.task_id,
            assistantPlaceholderId,
            res.conversation_id
          );
        } else {
          // failed
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: "Request failed. Please try again.",
                    status: "error",
                  }
                : m
            )
          );
        }

        return res;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : String(err);
        if (message.includes("429")) {
          toast.error("Rate limited. Please wait a moment.");
        } else {
          toast.error("Failed to send message.");
        }
        setLocalMessages((prev) =>
          prev
            .filter((m) => m.id !== assistantPlaceholderId)
            .map((m) =>
              m.id === userMsgId
                ? { ...m, status: "error" }
                : m
            )
        );
        throw err;
      }
    },
  });

  const selectConversation = useCallback(
    (id: string) => {
      stopPolling();
      setLocalMessages([]);
      setActiveConversationId(id);
    },
    [stopPolling]
  );

  const startNewConversation = useCallback(() => {
    stopPolling();
    setLocalMessages([]);
    setActiveConversationId(null);
  }, [stopPolling]);

  return {
    messages,
    isLoading: conversationQuery.isLoading && !!activeConversationId,
    activeConversationId,
    selectConversation,
    startNewConversation,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
  };
}
