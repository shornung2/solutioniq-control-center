import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Task {
  id: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  created: string;
  duration: string;
  output?: string;
}

const mockTasks: Task[] = [
  { id: "T-001", name: "Analyze customer sentiment data", status: "completed", created: "2024-01-15 09:30", duration: "2m 14s", output: "Processed 1,240 records. Positive: 67%, Neutral: 22%, Negative: 11%." },
  { id: "T-002", name: "Generate monthly sales report", status: "running", created: "2024-01-15 10:00", duration: "1m 03s" },
  { id: "T-003", name: "Sync inventory with warehouse API", status: "pending", created: "2024-01-15 10:15", duration: "-" },
  { id: "T-004", name: "Process payment batch #892", status: "failed", created: "2024-01-15 08:45", duration: "0m 32s", output: "Error: Gateway timeout after 30s." },
  { id: "T-005", name: "Update CRM contact records", status: "completed", created: "2024-01-15 07:20", duration: "4m 51s", output: "Updated 342 contacts." },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  running: "secondary",
  pending: "outline",
  failed: "destructive",
};

export default function Tasks() {
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const filtered = filter === "all" ? mockTasks : mockTasks.filter((t) => t.status === filter);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold">Tasks</h2>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left p-3 font-medium">ID</th>
                    <th className="text-left p-3 font-medium">Task</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Created</th>
                    <th className="text-left p-3 font-medium">Duration</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((task) => (
                    <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{task.id}</td>
                      <td className="p-3">{task.name}</td>
                      <td className="p-3">
                        <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                      </td>
                      <td className="p-3 text-muted-foreground">{task.created}</td>
                      <td className="p-3 text-muted-foreground">{task.duration}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedTask(task)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">{selectedTask?.name}</DialogTitle>
              <DialogDescription>Task {selectedTask?.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={statusVariant[selectedTask?.status || "pending"]}>{selectedTask?.status}</Badge>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span>{selectedTask?.created}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Duration:</span>
                <span>{selectedTask?.duration}</span>
              </div>
              {selectedTask?.output && (
                <div>
                  <span className="text-muted-foreground">Output:</span>
                  <pre className="mt-1 p-3 rounded bg-muted text-xs whitespace-pre-wrap">{selectedTask.output}</pre>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
