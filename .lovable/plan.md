
# Fix Status Dot Flickering

## Root Cause
The `useConnectionStatus` hook computes `status` from two unstable signals:
1. `/health/deep` API response (stable once endpoints are live)
2. WebSocket `isConnected` state (unstable -- connects, fails, reconnects with 1s+ backoff, causing rapid toggling)

Every time the WebSocket toggles `isConnected`, the status recalculates: `healthy + ws=true` = "full" (green), then `healthy + ws=false` = "partial" (yellow), repeating every 1-2 seconds.

## Fix

### 1. `src/hooks/use-connection-status.ts`
Decouple the status dot from WebSocket state. The health indicator should reflect the backend API health only:
- `healthData.status === "healthy"` --> "full" (green)
- `healthData.status === "degraded"` --> "partial" (yellow)  
- `healthData === null` (fetch failed) --> "disconnected" (red)

Remove the `wsConnected` parameter entirely from the status calculation. The WebSocket is a streaming channel, not a health signal.

### 2. `src/components/Layout.tsx`
Stop passing `wsConnected` to `useConnectionStatus` (simplify the call).

### 3. `src/hooks/use-analytics.ts`
The analytics hooks still have `refetchInterval: 30000` on the summary hook, which will keep polling a working endpoint. No change needed since `retry: false` and `staleTime: 25000` are already set.

## Technical Details

**Updated status logic:**
```text
healthData?.status === "healthy"  --> "full"
healthData?.status === "degraded" --> "partial"
healthData === null               --> "disconnected"
```

**Files changed:**
- `src/hooks/use-connection-status.ts` -- simplify status to depend only on health API
- `src/components/Layout.tsx` -- remove wsConnected from useConnectionStatus call
