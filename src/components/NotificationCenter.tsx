import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function NotificationCenter() {
  const ws = useWebSocketContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    const evt = ws.lastEvent;
    if (!evt) return;
    const key = `${evt.type}-${evt.task_id ?? ""}-${Date.now()}`;
    if (key === lastEventRef.current) return;
    lastEventRef.current = key;

    let message = "";
    switch (evt.type) {
      case "task.completed":
        message = `Task ${evt.task_id?.slice(0, 8)} completed`;
        break;
      case "task.failed":
        message = `Task ${evt.task_id?.slice(0, 8)} failed`;
        break;
      case "budget.alert":
        message = evt.message ?? "Budget threshold reached";
        break;
      case "task.awaiting_approval":
        message = "New approval request";
        break;
      case "message.created":
        message = "New message received";
        break;
      default:
        return;
    }

    setNotifications((prev) => [
      { id: crypto.randomUUID(), type: evt.type, message, timestamp: new Date().toISOString(), read: false },
      ...prev.slice(0, 49),
    ]);
  }, [ws.lastEvent]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button size="sm" variant="ghost" className="text-xs h-6" onClick={markAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No notifications</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-3 py-2 border-b border-border last:border-0 text-xs ${
                  n.read ? "opacity-60" : ""
                }`}
              >
                <p className="font-medium">{n.message}</p>
                <span className="text-muted-foreground">
                  {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
