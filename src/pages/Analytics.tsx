import { useState } from "react";
import { DollarSign, TrendingUp, Calendar, Gauge, AlertCircle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useAnalyticsSummary, useAnalyticsCosts, useAnalyticsRouting } from "@/hooks/use-analytics";

const MODEL_COLORS: Record<string, string> = {
  haiku: "hsl(142, 71%, 45%)",
  sonnet: "hsl(217, 91%, 60%)",
  opus: "hsl(271, 91%, 65%)",
};

const periodOptions = [7, 30, 90] as const;

export default function Analytics() {
  const [days, setDays] = useState<number>(30);
  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary();
  const { data: costs, isLoading: costsLoading, isError: costsError, refetch: refetchCosts } = useAnalyticsCosts(days);
  const { data: routing, isLoading: routingLoading } = useAnalyticsRouting(days);

  const budgetPct = costs?.budget_used_pct ?? 0;
  const budgetColor =
    budgetPct > 80 ? "[&>div]:bg-red-500" : budgetPct > 50 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500";

  const costChartConfig = {
    cost: { label: "Cost (USD)", color: "hsl(var(--primary))" },
  };

  const byModelArray = Array.isArray(costs?.by_model)
    ? costs.by_model
    : Object.entries(costs?.by_model ?? {}).map(([model, data]: [string, any]) => ({
        model,
        cost: data?.cost ?? data ?? 0,
        tokens: data?.tokens ?? 0,
      }));

  const modelChartConfig = Object.fromEntries(
    byModelArray.map((m) => [
      m.model,
      { label: m.model, color: MODEL_COLORS[m.model.toLowerCase()] ?? "hsl(var(--primary))" },
    ])
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Row 1 — Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryLoading || costsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glow-orange">
                <CardContent className="p-4">
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-16" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="glow-orange">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Today's Cost</p>
                    <p className="text-2xl font-heading font-bold">
                      ${summary?.today?.cost_usd?.toFixed(2) ?? "0.00"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {summary?.today?.tasks ?? 0} tasks
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glow-orange">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Month to Date</p>
                    <p className="text-2xl font-heading font-bold">
                      ${summary?.month_to_date?.cost_usd?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glow-orange">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Projection</p>
                    <p className="text-2xl font-heading font-bold">
                      ${costs?.monthly_projected_usd?.toFixed(2) ?? "0.00"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="glow-orange">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Budget Used</p>
                  </div>
                  <p className="text-2xl font-heading font-bold mb-2">
                    {budgetPct.toFixed(1)}%
                  </p>
                  <Progress value={budgetPct} className={`h-2 ${budgetColor}`} />
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Row 2 — Cost Over Time */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-heading">Cost Over Time</CardTitle>
            <div className="flex gap-1">
              {periodOptions.map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={days === p ? "default" : "outline"}
                  className="text-xs px-3 h-7"
                  onClick={() => setDays(p)}
                >
                  {p}d
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {costsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : costsError ? (
              <div className="h-64 flex items-center justify-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load costs</span>
                <Button size="sm" variant="outline" onClick={() => refetchCosts()}>
                  Retry
                </Button>
              </div>
            ) : (
              <ChartContainer config={costChartConfig} className="h-64 w-full">
                <AreaChart data={costs?.by_day ?? []}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    tickFormatter={(v) => `$${v}`}
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--primary))"
                    fill="url(#costGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Row 3 — Model Costs & Routing Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Cost by Model */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Cost by Model</CardTitle>
            </CardHeader>
            <CardContent>
              {costsLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <ChartContainer config={modelChartConfig} className="h-48 w-full">
                  <BarChart
                    data={byModelArray}
                    layout="vertical"
                    margin={{ left: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `$${v}`}
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="model"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      width={55}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => [`$${Number(value).toFixed(2)}`, "Cost"]}
                        />
                      }
                    />
                    <Bar
                      dataKey="cost"
                      radius={[0, 4, 4, 0]}
                      fill="hsl(var(--primary))"
                      // Per-bar color via cell rendering
                    >
                      {byModelArray.map((entry, idx) => (
                        <rect
                          key={idx}
                          fill={MODEL_COLORS[entry.model.toLowerCase()] ?? "hsl(var(--primary))"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Routing Performance */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Routing Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {routingLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lane</TableHead>
                      <TableHead className="text-right">Tasks</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Avg Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(routing?.routing_stats ?? []).map((row) => {
                      const feedback = routing?.feedback_by_lane?.[row.lane];
                      const rateColor =
                        row.success_rate > 0.95
                          ? "bg-green-500/10 text-green-600"
                          : row.success_rate > 0.85
                            ? "bg-yellow-500/10 text-yellow-600"
                            : "bg-red-500/10 text-red-600";
                      return (
                        <TableRow key={row.lane}>
                          <TableCell className="font-mono text-xs">{row.lane}</TableCell>
                          <TableCell className="text-right">{row.task_count}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary" className={rateColor}>
                              {(row.success_rate * 100).toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {feedback ? (
                              <span className="inline-flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-primary text-primary" />
                                {feedback.avg_rating.toFixed(1)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(routing?.routing_stats ?? []).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-8">
                          No routing data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
