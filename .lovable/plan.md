

# Enhanced Analytics Dashboard and Real-Time WebSocket Events

## Overview

Upgrade the analytics dashboard with dedicated Budget Monitor and Routing Performance components, add a cost breakdown pie chart with CSV export, and extend the existing WebSocket system to handle budget alerts and additional event types with toast notifications and query invalidation.

## Changes

### 1. New Component: Budget Monitor (`src/components/BudgetMonitor.tsx`)

A dedicated card with two circular progress indicators (daily and monthly usage):
- Circular progress rings rendered with SVG circles (stroke-dasharray technique)
- Color coding: green (<75%), yellow (75-90%), red (>90%)
- Dollar amounts formatted as "used / limit"
- Warning banner when either daily or monthly exceeds 90%
- "Paused" badge using existing Badge component when `is_paused` is true
- "Hard Stop" indicator badge when `hard_stop_enabled` is true
- Data sourced from existing `useBudgetUsage()` hook (endpoint: `/usage/budget`)

### 2. New Component: Routing Performance (`src/components/RoutingPerformance.tsx`)

A card with three lane columns (Green, Yellow, Red):
- Each column shows: task count, success rate (with color-coded badge), average tokens, and feedback rating stars
- Lane colors: green-500, yellow-500, red-500 backgrounds with appropriate opacity
- Success rate visual: badge with green/yellow/red coloring based on threshold
- Feedback stars: inline filled/unfilled star icons
- Data from existing `useAnalyticsRouting()` hook

### 3. Enhanced Cost Breakdown in Analytics Page

Add to the existing Analytics page:
- **Pie chart** showing cost distribution by model using recharts `PieChart` and `Pie` components (already installed)
- **CSV Export button**: generates a CSV from `by_day` cost data and triggers download via blob URL
- Both placed in a new row below the existing "Cost by Model" bar chart

### 4. Dashboard Header Budget Widget

Add a compact budget summary to the Dashboard page:
- Small inline display showing daily and monthly percentages with color dots
- Links to the Analytics page for full details
- Uses existing `useBudgetUsage()` hook already imported in Dashboard

### 5. Extended WebSocket Event Handling (`src/hooks/use-websocket.ts`)

Expand the `WsTaskEvent` type to include new event types:
- `budget.alert` -- triggers a toast warning and invalidates the `["budget"]` query
- `task.awaiting_approval` -- triggers a toast and invalidates the `["approvals"]` query
- `message.created` -- invalidates the `["chat-history"]` query for live chat updates

Add a callback system so consuming components can register event handlers:
- New `onEvent` callback ref in the hook
- `useEffect` in consuming components (Chat, Tasks) to react to relevant events

### 6. Budget Alert Banner (`src/components/Layout.tsx`)

Add a dismissible alert banner at the top of the Layout when budget exceeds 90%:
- Uses the `Alert` component from shadcn/ui
- Shows "Budget Warning: You have used X% of your daily/monthly budget"
- Dismiss button that hides until next threshold crossing
- Data from `useBudgetUsage()` hook

### 7. Toast Notifications for WebSocket Events

In `src/contexts/WebSocketContext.tsx`, add an effect that shows toast notifications:
- `task.completed` -- success toast with task ID
- `task.failed` -- destructive toast with error info
- `budget.alert` -- warning toast with link to analytics
- Uses existing `sonner` toast library

---

## Technical Details

### Circular Progress (Budget Monitor)

SVG-based rings using:
```text
circumference = 2 * PI * radius
strokeDasharray = `${pct * circumference / 100} ${circumference}`
```
Two concentric circles: one for daily (inner), one for monthly (outer).

### CSV Export

```text
1. Map by_day array to "Date,Cost" rows
2. Create Blob with text/csv type
3. Create object URL and trigger download
4. Revoke URL after download
```

### WebSocket Event Type Extension

Current types: `task.completed`, `task.failed`
New types: `budget.alert`, `task.awaiting_approval`, `message.created`

The `onmessage` handler will be updated to parse `parsed.event` more broadly and dispatch to the `setLastEvent` state. Consuming components filter by `lastEvent.type`.

### Query Invalidation on Events

In `WebSocketProvider`, add a `useEffect` watching `lastEvent` that calls `queryClient.invalidateQueries` for the relevant query keys based on event type. This provides real-time data refresh without polling.

### Files Created
- `src/components/BudgetMonitor.tsx` -- Circular progress budget display
- `src/components/RoutingPerformance.tsx` -- Three-lane routing card

### Files Modified
- `src/hooks/use-websocket.ts` -- Extended event types
- `src/contexts/WebSocketContext.tsx` -- Toast notifications and query invalidation
- `src/pages/Analytics.tsx` -- Pie chart, CSV export, new components
- `src/pages/Dashboard.tsx` -- Budget widget in header area
- `src/components/Layout.tsx` -- Budget alert banner
- `src/lib/types.ts` -- Extended WebSocket event types if needed

