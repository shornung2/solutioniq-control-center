import { useEffect, useRef, useState, useCallback } from "react";
import { WS_URL } from "@/lib/api";

import type { FileAttachment } from "@/lib/types";

export interface WsTaskEvent {
  type: "task.completed" | "task.failed";
  task_id: string;
  result?: {
    content?: string;
    model?: string;
    cost_usd?: number;
    files?: FileAttachment[];
  };
}

export interface UseWebSocketReturn {
  lastEvent: WsTaskEvent | null;
  isConnected: boolean;
  registerPendingTask: (taskId: string) => void;
  removePendingTask: (taskId: string) => void;
  pendingTaskIds: Set<string>;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WsTaskEvent | null>(null);
  const pendingRef = useRef(new Set<string>());
  const [pendingVersion, setPendingVersion] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current) return;
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        backoffRef.current = 1000;
        ws.send(JSON.stringify({ token: "stream" }));
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.event === "update" && parsed.data) {
            const taskEvent = parsed.data as WsTaskEvent;
            setLastEvent(taskEvent);
          }
        } catch {
          // ignore non-JSON
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (!unmountedRef.current) {
          reconnectTimer.current = setTimeout(() => {
            backoffRef.current = Math.min(backoffRef.current * 2, 30000);
            connect();
          }, backoffRef.current);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    } catch {
      if (!unmountedRef.current) {
        reconnectTimer.current = setTimeout(() => {
          backoffRef.current = Math.min(backoffRef.current * 2, 30000);
          connect();
        }, backoffRef.current);
      }
    }
  }, []);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const registerPendingTask = useCallback((taskId: string) => {
    pendingRef.current.add(taskId);
    setPendingVersion((v) => v + 1);
  }, []);

  const removePendingTask = useCallback((taskId: string) => {
    pendingRef.current.delete(taskId);
    setPendingVersion((v) => v + 1);
  }, []);

  return {
    lastEvent,
    isConnected,
    registerPendingTask,
    removePendingTask,
    pendingTaskIds: pendingRef.current,
  };
}
