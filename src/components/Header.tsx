import { Moon, Sun, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { ConnectionStatus } from "@/hooks/use-connection-status";
import type { HealthDeepResponse } from "@/lib/types";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
  status: ConnectionStatus;
  healthData: HealthDeepResponse | null;
}

function circuitBadge(state: string) {
  if (state === "closed") return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Normal</Badge>;
  if (state === "open") return <Badge variant="destructive" className="text-[10px]">Tripped</Badge>;
  return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">Recovering</Badge>;
}

export function Header({ theme, toggleTheme, status, healthData }: HeaderProps) {
  const dotColor =
    status === "full"
      ? "bg-green-500 status-pulse"
      : status === "partial"
        ? "bg-yellow-500"
        : "bg-destructive";

  const label =
    status === "full" ? "Connected" : status === "partial" ? "Partial" : "Disconnected";

  const overallLabel =
    status === "full"
      ? "All Systems Operational"
      : status === "partial"
        ? "Degraded Performance"
        : "Service Disruption";

  const overallColor =
    status === "full"
      ? "text-green-400"
      : status === "partial"
        ? "text-yellow-400"
        : "text-destructive";

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Popover>
          <PopoverTrigger asChild>
            <button className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <span className={`h-2 w-2 rounded-full ${dotColor}`} />
              <span className="text-xs text-muted-foreground font-body">{label}</span>
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 p-3 space-y-3">
            <p className={`text-sm font-semibold ${overallColor}`}>{overallLabel}</p>

            {healthData?.checks && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span className="capitalize">
                    {healthData.checks.database.status} · {healthData.checks.database.latency_ms}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Redis</span>
                  <span className="capitalize">{healthData.checks.redis.status}</span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-muted-foreground">LLM Providers</span>
                  {Object.entries(healthData.checks.llm_providers.circuits).map(
                    ([name, circuit]) => (
                      <div key={name} className="flex justify-between items-center pl-2">
                        <span className="capitalize">{name}</span>
                        {circuitBadge(circuit.state)}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {!healthData && (
              <p className="text-xs text-muted-foreground">Unable to reach backend services.</p>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="h-4 w-4 text-primary" />
        </div>
      </div>
    </header>
  );
}
