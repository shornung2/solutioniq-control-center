
# Fix: App Crash and API Authentication Failures

## Two Issues Found

### Issue 1: Chat page crashes -- WebSocket context used outside provider (CRITICAL)

The `Chat` component calls `useWebSocketContext()` at the top of the component function (line 139), but `WebSocketProvider` only exists inside `<Layout>`, which renders later in Chat's return statement (line 197). React hooks run before the JSX renders, so the context is `null` and throws.

**The same pattern applies to all pages** -- every page component renders `<Layout>` inside its return, but the provider is inside Layout. Any page that uses `useWebSocketContext` directly will crash.

**Fix:** Move `WebSocketProvider` from `Layout` up into `App.tsx`, wrapping all routes. This ensures the provider is available before any page component's hooks run.

**Files changed:**
- `src/App.tsx` -- Wrap `BrowserRouter` (or its children) with `WebSocketProvider`
- `src/components/Layout.tsx` -- Remove `WebSocketProvider` wrapper (keep `LayoutInner` as the default export pattern)

### Issue 2: API returning 401 "Invalid or expired token"

Network logs show the backend function proxy returning `401 {"detail":"Invalid or expired token"}`. The edge function config has `verify_jwt = false`, so this is not a JWT issue on the edge function side. The 401 comes from the upstream VPS (`solutioniq.cloud`) rejecting the `SOLUTIONIQ_ACCESS_TOKEN`.

**Fix:** Verify the `SOLUTIONIQ_ACCESS_TOKEN` secret is set and valid. If expired, it needs to be updated.

**Files changed:** None (secret configuration only)

## Technical Details

**App.tsx change:**
```text
import { WebSocketProvider } from "@/contexts/WebSocketContext";

const App = () => (
  <QueryClientProvider ...>
    <TooltipProvider>
      ...
      <BrowserRouter>
        <WebSocketProvider>
          <Routes>...</Routes>
        </WebSocketProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
```

**Layout.tsx change:**
Remove the `WebSocketProvider` wrapper and the import. The `Layout` function simply renders `LayoutInner` directly (no more two-component pattern needed for WebSocket).

**Secret check:**
Will verify `SOLUTIONIQ_ACCESS_TOKEN` is present in configured secrets. If missing or expired, will prompt for re-entry.

## Sequence

1. Move `WebSocketProvider` to `App.tsx` (fixes the crash)
2. Simplify `Layout.tsx` (remove redundant provider)
3. Check and fix the API token secret
