import { Activity, CheckCircle2, Clock, TrendingUp, Play, Pause, RefreshCw, AlertCircle, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDashboardData, useAgentStatus, useBudgetUsage, useAgentControl } from "@/hooks/use-dashboard";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const iconMap: Record<string, typeof Activity> = {
  "Active Tasks": Activity,
  "Completed Today": CheckCircle2,
  "Tasks Completed": CheckCircle2,
  "Success Rate": TrendingUp,
  "Avg Response": Clock,
  "Avg Duration": Clock,
};

const statusColors: Record<string, string> = {
  success: "bg-green-500/20 text-green-400",
  running: "bg-primary/20 text-primary",
  failed: "bg-destructive/20 text-destructive",
  pending: "bg-secondary/20 text-secondary",
};

const agentStatusColors: Record<string, string> = {
  active: "bg-green-500",
  paused: "bg-yellow-500",
  busy: "bg-primary",
};

export default function Dashboard() {
  const { data, isLoading, isError, refetch } = useDashboardData();
  const { data: agentStatus, isLoading: statusLoading } = useAgentStatus();
  const { data: budget, isLoading: budgetLoading } = useBudgetUsage();
  const { pause, resume } = useAgentControl();

  const budgetPercent = budget ? Math.round((budget.used / budget.limit) * 100) : 0;

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
                <Zap className="h-4 w-4 text-primary" /> Token Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetLoading ? (
                <Skeleton className="h-8 w-full" />
              ) : budget ? (
                <div className="space-y-2">
                  <Progress value={budgetPercent} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{budget.used.toLocaleString()} used</span>
                    <span>{budget.limit.toLocaleString()} limit</span>
                  </div>
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
            data?.metrics.map((m) => {
              const Icon = iconMap[m.label] || Activity;
              return (
                <Card key={m.label} className="glow-orange">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                      <p className="text-2xl font-heading font-bold">{m.value}</p>
                    </div>
                    <span className="ml-auto text-xs text-green-400">{m.trend}</span>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="w-full h-[220px]" />
              ) : data?.chartData?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(39 89% 60%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(39 89% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="hsl(207 10% 52%)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(207 10% 52%)" />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(215 28% 13%)",
                        border: "1px solid hsl(215 20% 20%)",
                        borderRadius: "8px",
                        fontSize: 12,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stroke="hsl(39 89% 60%)"
                      fill="url(#colorCompleted)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-10">No chart data available</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Play className="h-4 w-4" /> Run Analysis
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading">Activity Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : data?.activities?.length ? (
              <div className="space-y-3">
                {data.activities.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusColors[item.status] || "bg-muted text-muted-foreground"}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm">{item.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
