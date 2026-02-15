import { Activity, CheckCircle2, Clock, TrendingUp, Play, Pause, RefreshCw, AlertCircle, Zap, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useDashboardData, useAgentStatus, useBudgetUsage, useAgentControl } from "@/hooks/use-dashboard";

const agentStatusColors: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  busy: "bg-primary",
};

export default function Dashboard() {
  const { data: metrics, isLoading, isError, refetch } = useDashboardData();
  const { data: agentStatus, isLoading: statusLoading } = useAgentStatus();
  const { data: budget, isLoading: budgetLoading } = useBudgetUsage();
  const { pause, resume } = useAgentControl();

  const budgetPercent = budget ? budget.monthly_pct : 0;

  const metricCards = metrics
    ? [
        { label: "Tasks Completed (24h)", value: metrics.tasks_completed_24h, icon: CheckCircle2 },
        { label: "Tasks Failed (24h)", value: metrics.tasks_failed_24h, icon: XCircle },
        { label: "Uptime", value: `${metrics.uptime_pct}%`, icon: TrendingUp },
        { label: "Avg Response", value: `${metrics.avg_response_ms}ms`, icon: Clock },
      ]
    : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Agent Status & Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="glow-orange">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              {statusLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${agentStatusColors[agentStatus?.status || ""] || "bg-muted"}`} />
                  <span className="text-lg font-bold capitalize">{agentStatus?.status || "Unknown"}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => pause.mutate()}
                  disabled={pause.isPending || agentStatus?.status === "paused"}
                >
                  <Pause className="h-3 w-3" /> Pause
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => resume.mutate()}
                  disabled={resume.isPending || agentStatus?.status === "active"}
                >
                  <Play className="h-3 w-3" /> Resume
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" /> Budget Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : budget ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`h-2.5 w-2.5 rounded-full ${budget.daily_pct > 90 ? "bg-red-500" : budget.daily_pct > 75 ? "bg-yellow-500" : "bg-green-500"}`} />
                    <span className="text-muted-foreground">Daily</span>
                    <span className="font-bold ml-auto">{budget.daily_pct.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`h-2.5 w-2.5 rounded-full ${budget.monthly_pct > 90 ? "bg-red-500" : budget.monthly_pct > 75 ? "bg-yellow-500" : "bg-green-500"}`} />
                    <span className="text-muted-foreground">Monthly</span>
                    <span className="font-bold ml-auto">{budget.monthly_pct.toFixed(1)}%</span>
                  </div>
                  <a href="/analytics" className="text-xs text-primary hover:underline">View details →</a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No budget data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : isError ? (
            <Card className="col-span-full">
              <CardContent className="p-4 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load metrics</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </CardContent>
            </Card>
          ) : (
            metricCards.map((m) => (
              <Card key={m.label} className="glow-orange">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <m.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-2xl font-heading font-bold">{m.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button className="gap-2" variant="outline">
              <Play className="h-4 w-4" /> Run Analysis
            </Button>
            <Button className="gap-2" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" /> Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
