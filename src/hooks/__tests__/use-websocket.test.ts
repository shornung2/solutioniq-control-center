import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// Mock api module before importing hook
vi.mock("@/lib/api", () => ({
  WS_URL: "wss://test/ws",
  AUTH_TOKEN: "test-token",
}));

let mockInstances: any[] = [];

class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onmessage: ((e: any) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn(() => {
    this.onclose?.();
  });
  constructor(public url: string) {
    mockInstances.push(this);
  }
}

describe("useWebSocket", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockInstances = [];
    vi.stubGlobal("WebSocket", MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  async function importHook() {
    // Dynamic import to pick up mocks
    const mod = await import("../use-websocket");
    return mod.useWebSocket;
  }

  it("sets isConnected on open and sends auth", async () => {
    const useWebSocket = await importHook();
    const { result } = renderHook(() => useWebSocket());
    const ws = mockInstances[0];
    act(() => ws.onopen());
    expect(result.current.isConnected).toBe(true);
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: "auth", token: "test-token" }));
  });

  it("parses incoming JSON events", async () => {
    const useWebSocket = await importHook();
    const { result } = renderHook(() => useWebSocket());
    const ws = mockInstances[0];
    act(() => ws.onopen());
    act(() =>
      ws.onmessage({
        data: JSON.stringify({ event: "update", data: { type: "task.completed", task_id: "t1" } }),
      })
    );
    expect(result.current.lastEvent).toEqual({ type: "task.completed", task_id: "t1" });
  });

  it("registerPendingTask and removePendingTask modify the set", async () => {
    const useWebSocket = await importHook();
    const { result } = renderHook(() => useWebSocket());
    act(() => result.current.registerPendingTask("t1"));
    expect(result.current.pendingTaskIds.has("t1")).toBe(true);
    act(() => result.current.removePendingTask("t1"));
    expect(result.current.pendingTaskIds.has("t1")).toBe(false);
  });

  it("reconnects with backoff on close", async () => {
    const useWebSocket = await importHook();
    renderHook(() => useWebSocket());
    const ws = mockInstances[0];
    act(() => ws.onopen());
    act(() => ws.onclose());

    expect(mockInstances).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(mockInstances.length).toBeGreaterThanOrEqual(2);
  });
});
