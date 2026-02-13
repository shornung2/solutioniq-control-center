import { Activity, CheckCircle2, Clock, TrendingUp, Play, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const metrics = [
  { label: "Active Tasks", value: "12", icon: Activity, trend: "+3" },
  { label: "Completed Today", value: "47", icon: CheckCircle2, trend: "+8" },
  { label: "Success Rate", value: "94.2%", icon: TrendingUp, trend: "+1.2%" },
  { label: "Avg Response", value: "1.3s", icon: Clock, trend: "-0.2s" },
];

const chartData = [
  { time: "00:00", completed: 4 },
  { time: "04:00", completed: 2 },
  { time: "08:00", completed: 8 },
  { time: "12:00", completed: 15 },
  { time: "16:00", completed: 12 },
  { time: "20:00", completed: 6 },
];

const activityLog = [
  { id: 1, action: "Completed data analysis for client #4521", time: "2 min ago", status: "success" },
  { id: 2, action: "Started report generation task", time: "5 min ago", status: "running" },
  { id: 3, action: "Synced CRM data with external API", time: "12 min ago", status: "success" },
  { id: 4, action: "Failed to connect to payment gateway", time: "18 min ago", status: "failed" },
  { id: 5, action: "Approval requested: Database migration", time: "25 min ago", status: "pending" },
  { id: 6, action: "Processed 342 records from import queue", time: "31 min ago", status: "success" },
];

const statusColors: Record<string, string> = {
  success: "bg-green-500/20 text-green-400",
  running: "bg-primary/20 text-primary",
  failed: "bg-destructive/20 text-destructive",
  pending: "bg-secondary/20 text-secondary",
};

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Card key={m.label} className="glow-orange">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <m.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="text-2xl font-heading font-bold">{m.value}</p>
                </div>
                <span className="ml-auto text-xs text-green-400">{m.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData}>
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
              <Button className="w-full justify-start gap-2" variant="outline">
                <RefreshCw className="h-4 w-4" /> Sync Data
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <FileText className="h-4 w-4" /> Generate Report
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
            <div className="space-y-3">
              {activityLog.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${statusColors[item.status]}`}
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
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
