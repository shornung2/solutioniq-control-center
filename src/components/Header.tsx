import { Moon, Sun, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { useWebSocketContext } from "@/contexts/WebSocketContext";

interface HeaderProps {
  theme: "dark" | "light";
  toggleTheme: () => void;
}

export function Header({ theme, toggleTheme }: HeaderProps) {
  const { isConnected: wsConnected } = useWebSocketContext();
  const { status } = useConnectionStatus(wsConnected);

  const dotColor =
    status === "full"
      ? "bg-green-500 status-pulse"
      : status === "partial"
        ? "bg-yellow-500"
        : "bg-destructive";

  const label =
    status === "full"
      ? "Connected"
      : status === "partial"
        ? "Partial"
        : "Disconnected";

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="hidden sm:flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          <span className="text-xs text-muted-foreground font-body">
            {label}
          </span>
        </div>
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
