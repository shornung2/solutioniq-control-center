import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { Database, Server, Cpu, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "healthy" || status === "operational"
      ? "bg-green-500/20 text-green-500 border-green-500/30"
      : status === "degraded"
        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
        : "bg-destructive/20 text-destructive border-destructive/30";
  return <Badge className={`${color} text-xs`}>{status}</Badge>;
}

function LatencyDisplay({ ms }: { ms: number | null }) {
  if (ms == null) return <span className="text-muted-foreground text-xs">—</span>;
  const color = ms < 50 ? "text-green-500" : ms < 200 ? "text-yellow-500" : "text-destructive";
  return <span className={`text-xs font-mono ${color}`}>{ms.toFixed(1)}ms</span>;
}

export default function SystemStatus() {
  const { status, healthData } = useConnectionStatus();
  const queryClient = useQueryClient();

  const overallStatus = status === "full" ? "healthy" : status === "partial" ? "degraded" : "unhealthy";

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-heading font-bold">System Status</h2>
            {healthData?.timestamp && (
              <p className="text-xs text-muted-foreground">
                Last updated {formatDistanceToNow(new Date(healthData.timestamp), { addSuffix: true })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={overallStatus} />
            <Button
              size="sm"
              variant="outline"
              className="gap-1"
              onClick={() => queryClient.invalidateQueries({ queryKey: ["health-deep"] })}
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </Button>
          </div>
        </div>

        {!healthData ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" /> Database
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={healthData.database.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <LatencyDisplay ms={healthData.database.latency_ms} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Server className="h-4 w-4 text-primary" /> Redis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={healthData.redis.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <LatencyDisplay ms={healthData.redis.latency_ms} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> LLM Providers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(healthData.llm_providers).map(([name, providerStatus]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{name}</span>
                    <StatusBadge status={String(providerStatus)} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
