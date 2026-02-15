import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, DollarSign, Pause, ShieldAlert } from "lucide-react";
import { useBudgetUsage } from "@/hooks/use-dashboard";

function getColor(pct: number) {
  if (pct > 90) return "hsl(0, 72%, 51%)";
  if (pct > 75) return "hsl(45, 93%, 47%)";
  return "hsl(142, 71%, 45%)";
}

function CircularProgress({ pct, label, used, limit, radius }: {
  pct: number; label: string; used: number; limit: number; radius: number;
}) {
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const dashArray = `${(Math.min(pct, 100) / 100) * circumference} ${circumference}`;
  const color = getColor(pct);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={radius * 2} height={radius * 2} className="-rotate-90">
        <circle
          cx={radius} cy={radius} r={normalizedRadius}
          fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke}
        />
        <circle
          cx={radius} cy={radius} r={normalizedRadius}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={dashArray} strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="text-center -mt-[calc(50%+0.5rem)] mb-4">
        <p className="text-lg font-heading font-bold" style={{ color }}>{pct.toFixed(1)}%</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        ${used.toFixed(2)} / ${limit.toFixed(2)}
      </p>
    </div>
  );
}

export function BudgetMonitor() {
  const { data: budget, isLoading } = useBudgetUsage();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" /> Budget Monitor
          </CardTitle>
        </CardHeader>
        <CardContent><Skeleton className="h-40 w-full" /></CardContent>
      </Card>
    );
  }

  if (!budget) return null;

  const warning = budget.daily_pct > 90 || budget.monthly_pct > 90;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" /> Budget Monitor
          {budget.is_paused && <Badge variant="secondary" className="ml-auto"><Pause className="h-3 w-3 mr-1" />Paused</Badge>}
          {budget.hard_stop_enabled && <Badge variant="destructive" className="ml-auto"><ShieldAlert className="h-3 w-3 mr-1" />Hard Stop</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around">
          <CircularProgress pct={budget.daily_pct} label="Daily" used={budget.daily_used} limit={budget.daily_limit} radius={55} />
          <CircularProgress pct={budget.monthly_pct} label="Monthly" used={budget.monthly_used} limit={budget.monthly_limit} radius={55} />
        </div>
        {warning && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Budget approaching limit — consider pausing or increasing your allocation.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
