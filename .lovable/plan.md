

# Add WebSocket Support for Real-Time Chat

## Overview
Replace polling with WebSocket for instant task resolution. Polling remains as a fallback when the WebSocket is disconnected.

## Changes

### 1. Create `src/hooks/use-websocket.ts`
New hook that manages a persistent WebSocket connection:
- Connects to `WS_URL` (from `src/lib/api.ts`) on mount
- Sends `{ token: "stream" }` on open
- Listens for messages with format: `{ event: "update", data: { type: "task.completed|task.failed", task_id, result: { content, model, cost_usd, files } } }`
- Exposes: `lastEvent`, `isConnected`, `registerPendingTask(id)`, `removePendingTask(id)`, `pendingTaskIds`
- Auto-reconnect with exponential backoff: 1s, 2s, 4s, 8s, capped at 30s
- Resets backoff on successful connection
- Cleans up WebSocket on unmount

### 2. Update `src/hooks/use-chat.ts`
- Accept an optional `websocket` parameter (the return value of `useWebSocket`)
- When a message returns `status: "queued"`:
  - If WebSocket is connected: call `registerPendingTask(task_id)` and skip polling
  - If WebSocket is NOT connected: fall back to existing `pollForResult` behavior
- Add a `useEffect` that watches `websocket.lastEvent`:
  - If event type is `task.completed` and matches a pending placeholder: replace the typing indicator with the result content, lane/model/cost metadata
  - If event type is `task.failed`: show error message in red
  - In both cases: invalidate conversation queries and call `removePendingTask`
- Store a mapping of `task_id` to `placeholderId` so incoming WebSocket events can target the correct local message

### 3. Update `src/pages/Chat.tsx`
- Instantiate `useWebSocket()` at the top of the component
- Pass the websocket object into `useChat(websocket)`
- No other UI changes needed -- the typing indicator and message rendering already work

### 4. Update `src/hooks/use-connection-status.ts`
- Accept an optional `wsConnected` boolean parameter
- Return a status object: `{ apiConnected, wsConnected, status: "full" | "partial" | "disconnected" }`

### 5. Update `src/components/Header.tsx`
- Import and call `useWebSocket` (or receive wsConnected from a shared context/prop)
- To avoid creating a second WebSocket connection, lift `useWebSocket` into the Layout component and pass `isConnected` down
- Actually, simpler approach: create a WebSocket context provider so both Header and Chat share the same connection

### Revised approach for sharing WebSocket:

### 5a. Create `src/contexts/WebSocketContext.tsx`
- A React context provider that wraps the app (inside Layout or at the App level)
- Instantiates `useWebSocket()` once
- Provides the websocket state to all consumers via `useWebSocketContext()`

### 5b. Update `src/components/Layout.tsx`
- Wrap children with `<WebSocketProvider>`

### 5c. Update `src/pages/Chat.tsx`
- Use `useWebSocketContext()` instead of calling `useWebSocket()` directly
- Pass it to `useChat()`

### 5d. Update `src/components/Header.tsx`
- Use `useWebSocketContext()` to get `isConnected`
- Combine with existing API health check:
  - Green dot + "Connected": both API and WebSocket connected
  - Yellow dot + "Partial": only one connected
  - Red dot + "Disconnected": neither connected

## Technical Details

**WebSocket message format expected:**
```text
{ 
  event: "update", 
  data: { 
    type: "task.completed" | "task.failed", 
    task_id: "uuid", 
    result: { content: "...", model: "...", cost_usd: 0.12, files: [...] } 
  } 
}
```

**Exponential backoff implementation:**
- Start at 1000ms delay
- Double on each failed reconnect attempt
- Cap at 30000ms
- Reset to 1000ms on successful connection (`onopen`)

**Task-to-placeholder mapping in use-chat.ts:**
- New ref: `taskPlaceholderMap = useRef<Map<string, string>>()` mapping `task_id` to `assistantPlaceholderId`
- On queued + WS connected: store mapping, register pending task, skip polling
- On WS event: look up placeholder ID, update local message, clean up mapping

**File structure:**
- `src/hooks/use-websocket.ts` -- new
- `src/contexts/WebSocketContext.tsx` -- new
- `src/hooks/use-chat.ts` -- modified
- `src/hooks/use-connection-status.ts` -- modified
- `src/components/Header.tsx` -- modified
- `src/components/Layout.tsx` -- modified
- `src/pages/Chat.tsx` -- modified

