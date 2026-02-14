

# Fix Chat Message Timeout

## Problem
Chat messages are sent successfully (POST /chat returns 200 with status "queued"), but the backend task stays permanently at "pending" status and never gets processed. The assistant response never arrives, and the app shows "Request timed out" after 60 seconds.

## Root Cause
The WebSocket in `use-websocket.ts` sends a hardcoded `{ token: "stream" }` for authentication, while `api.ts`'s `createWebSocket` correctly sends the real bearer token (`VITE_AUTH_TOKEN`). The server likely needs the real token to authenticate the WebSocket stream and associate it with the user/deployment, which may also trigger task processing.

## Changes

### 1. Fix WebSocket authentication in `use-websocket.ts`
- Import `AUTH_TOKEN` from `api.ts` (need to export it first) or read from `import.meta.env.VITE_AUTH_TOKEN`
- Change line 44 from: `ws.send(JSON.stringify({ token: "stream" }))` 
- To: `ws.send(JSON.stringify({ type: "auth", token: AUTH_TOKEN }))` -- matching the pattern in `api.ts`'s `createWebSocket`

### 2. Export AUTH_TOKEN from `api.ts`
- The file already exports `API_URL` and `WS_URL` on line 94
- Add `AUTH_TOKEN` to that export so `use-websocket.ts` can import it

### 3. Increase polling timeout as safety net
- In `use-chat.ts`, increase `maxAttempts` from 30 to 60 (2 minutes instead of 1 minute) to give the backend more time when polling is needed as a fallback

## Technical Details
- File: `src/hooks/use-websocket.ts` -- fix the `ws.onopen` handler to send real auth token
- File: `src/lib/api.ts` -- export `AUTH_TOKEN`  
- File: `src/hooks/use-chat.ts` -- increase polling timeout

