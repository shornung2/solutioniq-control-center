import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Activity } from "lucide-react";
import { useAnalyticsRouting } from "@/hooks/use-analytics";

const LANE_CONFIG: Record<string, { bg: string; border: string }> = {
  green:  { bg: "bg-green-500/10",  border: "border-green-500/20" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  red:    { bg: "bg-red-500/10",    border: "border-red-500/20" },
};

function rateColor(rate: number) {
  if (rate > 0.95) return "bg-green-500/10 text-green-600";
  if (rate > 0.85) return "bg-yellow-500/10 text-yellow-600";
  return "bg-red-500/10 text-red-600";
}

export function RoutingPerformance({ days = 30 }: { days?: number }) {
  const { data: routing, isLoading } = useAnalyticsRouting(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" /> Routing Performance
          </CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  const stats = routing?.routing_stats ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" /> Routing Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No routing data available</p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {stats.map((lane) => {
              const cfg = LANE_CONFIG[lane.lane] ?? LANE_CONFIG.green;
              const feedback = routing?.feedback_by_lane?.[lane.lane];
              return (
                <div key={lane.lane} className={`rounded-lg p-3 ${cfg.bg} border ${cfg.border}`}>
                  <p className="text-xs font-heading font-bold capitalize mb-2">{lane.lane} Lane</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tasks</span>
                      <span className="font-bold">{lane.task_count}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Success</span>
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${rateColor(lane.success_rate)}`}>
                        {(lane.success_rate * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Tokens</span>
                      <span className="font-mono">{lane.avg_tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rating</span>
                      {feedback ? (
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          <span>{feedback.avg_rating.toFixed(1)}</span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
