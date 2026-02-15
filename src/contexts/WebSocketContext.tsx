import { createContext, useContext, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useWebSocket, type UseWebSocketReturn } from "@/hooks/use-websocket";
import { toast } from "sonner";

const WebSocketContext = createContext<UseWebSocketReturn | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const ws = useWebSocket();
  const queryClient = useQueryClient();
  const lastProcessed = useRef<string | null>(null);

  useEffect(() => {
    const evt = ws.lastEvent;
    if (!evt) return;
    const key = `${evt.type}-${evt.task_id ?? ""}-${Date.now()}`;
    if (key === lastProcessed.current) return;
    lastProcessed.current = key;

    switch (evt.type) {
      case "task.completed":
        toast.success(`Task ${evt.task_id} completed`);
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        break;
      case "task.failed":
        toast.error(`Task ${evt.task_id} failed`, { description: evt.result?.content });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        break;
      case "budget.alert":
        toast.warning(evt.message ?? "Budget threshold reached", { description: "View analytics for details" });
        queryClient.invalidateQueries({ queryKey: ["budget"] });
        break;
      case "task.awaiting_approval":
        toast.info("New approval request");
        queryClient.invalidateQueries({ queryKey: ["approvals"] });
        break;
      case "message.created":
        queryClient.invalidateQueries({ queryKey: ["chat-history"] });
        break;
    }
  }, [ws.lastEvent, queryClient]);

  return (
    <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>
  );
}

export function useWebSocketContext(): UseWebSocketReturn {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocketContext must be used within WebSocketProvider");
  return ctx;
}
