

# Enhanced Health Status + Onboarding Welcome

## Overview
Two additions: (1) replace the simple connection dot in the Header with a deep health check popover showing per-service status, and (2) show a one-time welcome dialog on first visit.

## 1. Enhanced Health Status

### Update `src/hooks/use-connection-status.ts`
- Replace the simple `api.healthCheck` boolean with a call to `api.get("/health/deep")` returning the full deep health response
- Keep 30-second refetch interval
- Derive overall status from the response's `status` field: "healthy" = "full", "degraded" = "partial", fetch failure = "disconnected"
- Export the full health data (checks object) alongside the status

### Update `src/lib/types.ts`
- Add a `HealthDeepResponse` interface:
  - `status`: "healthy" | "degraded"
  - `checks.database`: `{ status: string, latency_ms: number }`
  - `checks.redis`: `{ status: string }`
  - `checks.llm_providers`: `{ status: string, circuits: Record<string, { state: string, available: boolean }> }`

### Update `src/components/Header.tsx`
- Import `Popover`, `PopoverTrigger`, `PopoverContent`
- Make the status dot + label a clickable PopoverTrigger
- Popover content shows:
  - Overall status line: "All Systems Operational" (green) / "Degraded Performance" (yellow) / "Service Disruption" (red)
  - Database row: status + latency (e.g., "Healthy . 3ms")
  - Redis row: status
  - LLM Providers section: each circuit (anthropic, google) with state badge -- "closed" = green "Normal", "open" = red "Tripped", "half_open" = yellow "Recovering"
- Green dot pulses slowly when healthy (already has `status-pulse` class)

### Update `src/components/Layout.tsx`
- Add a conditional yellow degraded banner between Header and main content
- Banner text: "Some services are experiencing issues. Responses may be slower than usual."
- Only shown when health status is "degraded"
- Pass health status down from Layout or read from the same React Query cache

Since Layout wraps the Header and both need the health data, the approach will be:
- The `useConnectionStatus` hook returns the full health data
- Layout calls the hook and passes relevant props to Header
- Layout renders the degraded banner conditionally

## 2. Onboarding Welcome Dialog

### Create `src/components/WelcomeDialog.tsx`
- Check `localStorage.getItem("solutioniq_onboarded")` on mount
- If not set, show a Dialog (open by default)
- Content:
  - Title: "Welcome to SolutionIQ Autopilot"
  - Subtitle: "Your AI-powered presales assistant"
  - 2x2 grid of feature cards with icons:
    - Search: "Research companies and competitors"
    - Mail: "Draft emails and proposals"
    - FileText: "Create documents and presentations"
    - Zap: "Get proactive insights"
  - "Get Started" button: sets `localStorage.setItem("solutioniq_onboarded", "true")` and closes dialog
- Clean, minimal -- no skip button needed

### Update `src/components/Layout.tsx`
- Import and render `WelcomeDialog` inside the Layout so it appears on any page on first visit

## Technical Details

**Hook changes (`use-connection-status.ts`):**
- `queryFn` changes from `api.healthCheck` to fetching `/health/deep`
- Returns `{ status, healthData }` where `healthData` contains the full checks object
- On fetch error, status falls back to "disconnected" with null healthData

**Layout prop threading:**
- Layout calls `useConnectionStatus(wsConnected)` (moved from Header)
- Passes `{ status, healthData, theme, toggleTheme }` to Header
- Renders degraded banner between Header and `<main>`

**Circuit state badge colors:**
```text
closed -> green badge "Normal"
open -> red badge "Tripped"  
half_open -> yellow badge "Recovering"
```

**Files changed:**
- `src/lib/types.ts` -- add HealthDeepResponse interface
- `src/hooks/use-connection-status.ts` -- fetch /health/deep, return full data
- `src/components/Header.tsx` -- popover with health details
- `src/components/Layout.tsx` -- degraded banner + WelcomeDialog
- `src/components/WelcomeDialog.tsx` -- new onboarding dialog

