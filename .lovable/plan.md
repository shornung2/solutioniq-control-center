

# Create Analytics Page with Cost Tracking and Performance Metrics

## Overview
Add a new Analytics page with cost tracking charts, model breakdowns, and routing performance metrics. Uses the existing API proxy pattern and Recharts (via shadcn chart components).

## Changes

### 1. Add analytics types to `src/lib/types.ts`
New interfaces for the three analytics endpoints:
- `AnalyticsSummary` -- today's stats and month-to-date
- `AnalyticsCosts` -- total cost, projection, budget %, breakdowns by model/day/lane
- `AnalyticsRouting` -- routing stats per lane with success rates and feedback ratings

### 2. Create `src/hooks/use-analytics.ts`
Three React Query hooks following the existing pattern in `use-dashboard.ts`:
- `useAnalyticsSummary()` -- calls `/analytics/summary`, refetches every 30s
- `useAnalyticsCosts(days)` -- calls `/analytics/costs?days={days}`, accepts a `days` parameter (7, 30, 90)
- `useAnalyticsRouting(days)` -- calls `/analytics/routing?days={days}`, same days parameter

### 3. Create `src/pages/Analytics.tsx`
Full page using the `Layout` component, structured in three rows:

**Row 1 -- Stat Cards (4 cards, glow-orange class)**
- "Today's Cost": `$X.XX` with `N tasks` subtitle (from summary endpoint)
- "Month to Date": `$X.XX` (from summary)
- "Monthly Projection": `$X.XX` (from costs endpoint)
- "Budget Used": percentage with colored Progress bar (green/yellow/red thresholds)

**Row 2 -- Cost Over Time (full-width Card)**
- Period selector: 7d / 30d / 90d toggle buttons controlling the `days` state
- Recharts AreaChart with gradient fill using the shadcn `ChartContainer` component
- X-axis: dates, Y-axis: USD, tooltip with cost and call count

**Row 3 -- Two side-by-side Cards**
- Left: "Cost by Model" -- horizontal BarChart, color-coded (Haiku=green, Sonnet=blue, Opus=purple)
- Right: "Routing Performance" -- Table with columns: Lane, Tasks, Success Rate (colored badge), Avg Rating (star icon + number)

Loading states use Skeleton components (matching Dashboard pattern). Error states show AlertCircle with retry button.

### 4. Update `src/components/AppSidebar.tsx`
- Import `BarChart3` from lucide-react
- Add `{ title: "Analytics", url: "/analytics", icon: BarChart3 }` to `navItems` array, positioned between Dashboard and Tasks (index 1)

### 5. Update `src/App.tsx`
- Import the new Analytics page
- Add route: `<Route path="/analytics" element={<Analytics />} />`

## Technical Details

**Type definitions for `src/lib/types.ts`:**
```text
AnalyticsSummary {
  today: { tasks: number, tokens: number, cost_usd: number, conversations: number }
  month_to_date: { cost_usd: number }
}

AnalyticsCosts {
  total_cost_usd: number
  monthly_projected_usd: number
  budget_used_pct: number
  by_model: Array<{ model: string, cost: number, calls: number }>
  by_day: Array<{ date: string, cost: number, calls: number }>
  by_lane: Array<{ lane: string, cost: number, tasks: number }>
}

AnalyticsRouting {
  routing_stats: Array<{ lane: string, task_count: number, success_rate: number, avg_tokens: number }>
  feedback_by_lane: Record<string, { avg_rating: number, count: number }>
}
```

**Chart configuration:** Uses the existing `ChartContainer`, `ChartTooltip`, `ChartTooltipContent` from `src/components/ui/chart.tsx` with Recharts `AreaChart`, `Area`, `BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`.

**Budget Progress bar color logic:**
- `budget_used_pct < 50` -- green (`[&>div]:bg-green-500`)
- `50-80` -- yellow (`[&>div]:bg-yellow-500`)
- `>80` -- red (`[&>div]:bg-red-500`)

**Model color mapping for bar chart:**
```text
haiku -> hsl(142, 71%, 45%) (green)
sonnet -> hsl(217, 91%, 60%) (blue)
opus -> hsl(271, 91%, 65%) (purple)
default -> hsl(var(--primary))
```

**Files changed:**
- `src/lib/types.ts` -- add 3 interfaces
- `src/hooks/use-analytics.ts` -- new, 3 hooks
- `src/pages/Analytics.tsx` -- new, full page
- `src/components/AppSidebar.tsx` -- add nav item
- `src/App.tsx` -- add route

