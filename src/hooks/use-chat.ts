import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type {
  ChatSendResponse,
  Conversation,
  ConversationMessage,
  Task,
  FileAttachment,
} from "@/lib/types";
import type { UseWebSocketReturn, WsTaskEvent } from "@/hooks/use-websocket";

export interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  lane?: string;
  model?: string;
  cost_usd?: number;
  timestamp: string;
  status?: "sending" | "typing" | "degraded" | "error";
  files?: FileAttachment[];
  task_id?: string;
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

export function useChat(websocket?: UseWebSocketReturn) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>([]);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const taskPlaceholderMap = useRef<Map<string, string>>(new Map());

  const conversationQuery = useConversationMessages(activeConversationId);

  const serverMessages: LocalMessage[] = (conversationQuery.data || []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    lane: m.lane,
    model: m.model,
    cost_usd: m.cost_usd,
    timestamp: m.timestamp,
  }));

  // Only keep local messages that are still in-flight (not yet confirmed by server)
  const inFlightStatuses = new Set(["sending", "typing", "error", "degraded"]);
  const uniqueLocal = localMessages.filter(
    (m) => inFlightStatuses.has(m.status ?? "") || (m.task_id && !m.status)
  );
  const messages = [...serverMessages, ...uniqueLocal];

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  // Handle WebSocket events for pending tasks
  useEffect(() => {
    if (!websocket?.lastEvent) return;
    const evt: WsTaskEvent = websocket.lastEvent;
    const placeholderId = taskPlaceholderMap.current.get(evt.task_id);
    if (!placeholderId) return;

    if (evt.type === "task.completed") {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                ...m,
                content: evt.result?.content || "Done.",
                model: evt.result?.model,
                cost_usd: evt.result?.cost_usd,
                lane: evt.result?.model?.split("/").pop(),
                status: undefined,
                files: (evt.result?.files as FileAttachment[]) || undefined,
                task_id: evt.task_id,
              }
            : m
        )
      );
    } else if (evt.type === "task.failed") {
      setLocalMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { ...m, content: "Something went wrong.", status: "error" }
            : m
        )
      );
    }

    taskPlaceholderMap.current.delete(evt.task_id);
    websocket.removePendingTask(evt.task_id);
    queryClient.invalidateQueries({ queryKey: ["conversations"] });
    if (activeConversationId) {
      queryClient.invalidateQueries({
        queryKey: ["conversation-messages", activeConversationId],
      });
    }
  }, [websocket?.lastEvent, websocket, queryClient, activeConversationId]);

  const pollForResult = useCallback(
    (taskId: string, placeholderId: string, conversationId: string) => {
      let attempts = 0;
      const maxAttempts = 60;

      pollingRef.current = setInterval(async () => {
        attempts++;
        try {
          const task = await api.get<Task>(`/tasks/${taskId}`);
          if (task.status === "completed" || task.status === "failed") {
            stopPolling();
            let taskFiles: FileAttachment[] | undefined;
            if (task.status === "completed" && task.result) {
              try {
                const parsed = JSON.parse(task.result);
                if (parsed?.files) taskFiles = parsed.files;
              } catch {
                // result is plain text, no files
              }
            }
            setLocalMessages((prev) =>
              prev.map((m) =>
                m.id === placeholderId
                  ? {
                      ...m,
                      content:
                        task.status === "completed"
                          ? task.result || "Done."
                          : task.error || "Something went wrong.",
                      status: task.status === "failed" ? "error" : undefined,
                      files: taskFiles,
                      task_id: taskId,
                    }
                  : m
              )
            );
            queryClient.invalidateQueries({ queryKey: ["conversation-messages", conversationId] });
            queryClient.invalidateQueries({ queryKey: ["conversations"] });
          }
        } catch {
          // keep polling
        }
        if (attempts >= maxAttempts) {
          stopPolling();
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? { ...m, content: "Request timed out. Please try again.", status: "error" }
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
      const userMsgId = `local-user-${Date.now()}`;
      const assistantPlaceholderId = `local-assistant-${Date.now()}`;
      const now = new Date().toISOString();

      setLocalMessages((prev) => [
        ...prev,
        { id: userMsgId, role: "user", content: text, timestamp: now, status: "sending" },
        { id: assistantPlaceholderId, role: "assistant", content: "", timestamp: now, status: "typing" },
      ]);

      try {
        const res = await api.post<ChatSendResponse>("/chat", {
          message: text,
          conversation_id: activeConversationId,
        });

        if (!activeConversationId) {
          setActiveConversationId(res.conversation_id);
        }

        setLocalMessages((prev) =>
          prev.map((m) => (m.id === userMsgId ? { ...m, status: undefined } : m))
        );

        if (res.status === "completed") {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, content: res.content || "Done.", lane: res.lane, model: res.model, cost_usd: res.cost_usd, status: undefined, files: res.files, task_id: res.task_id }
                : m
            )
          );
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({ queryKey: ["conversation-messages", res.conversation_id] });
        } else if (res.status === "degraded") {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, content: res.content || "Response received.", lane: res.lane, model: res.model, cost_usd: res.cost_usd, status: "degraded", task_id: res.task_id }
                : m
            )
          );
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        } else if (res.status === "queued") {
          // Use WebSocket if connected, otherwise poll
          if (websocket?.isConnected) {
            taskPlaceholderMap.current.set(res.task_id, assistantPlaceholderId);
            websocket.registerPendingTask(res.task_id);
          } else {
            pollForResult(res.task_id, assistantPlaceholderId, res.conversation_id);
          }
        } else {
          setLocalMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholderId
                ? { ...m, content: "Request failed. Please try again.", status: "error" }
                : m
            )
          );
        }

        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("429")) {
          toast.error("Rate limited. Please wait a moment.");
        } else {
          toast.error("Failed to send message.");
        }
        setLocalMessages((prev) =>
          prev
            .filter((m) => m.id !== assistantPlaceholderId)
            .map((m) => (m.id === userMsgId ? { ...m, status: "error" } : m))
        );
        throw err;
      }
    },
  });

  const selectConversation = useCallback(
    (id: string) => {
      stopPolling();
      setLocalMessages([]);
      taskPlaceholderMap.current.clear();
      setActiveConversationId(id);
    },
    [stopPolling]
  );

  const startNewConversation = useCallback(() => {
    stopPolling();
    setLocalMessages([]);
    taskPlaceholderMap.current.clear();
    setActiveConversationId(null);
  }, [stopPolling]);

  const deleteConversation = useCallback(
    async (id: string) => {
      await api.delete(`/chat/conversations/${id}`);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (activeConversationId === id) {
        startNewConversation();
      }
    },
    [queryClient, activeConversationId, startNewConversation]
  );

  return {
    messages,
    isLoading: conversationQuery.isLoading && !!activeConversationId,
    activeConversationId,
    selectConversation,
    startNewConversation,
    sendMessage: sendMutation.mutate,
    isSending: sendMutation.isPending,
    deleteConversation,
  };
}
