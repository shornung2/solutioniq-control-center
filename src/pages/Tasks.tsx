import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, Plus, Loader2 } from "lucide-react";
import { useTasks, useCreateTask, useTaskTrace } from "@/hooks/use-tasks";
import type { Task } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  running: "secondary",
  pending: "outline",
  failed: "destructive",
};

export default function Tasks() {
  const [filter, setFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState([3]);
  const { data: tasks = [], isLoading, isError, refetch } = useTasks(filter);
  const createTask = useCreateTask();
  const { data: trace, isLoading: traceLoading } = useTaskTrace(selectedTask?.id || null);

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createTask.mutate({ title: newTitle, priority: newPriority[0] }, {
      onSuccess: () => {
        setShowCreate(false);
        setNewTitle("");
        setNewPriority([3]);
      },
    });
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold">Tasks</h2>
          <div className="flex gap-2">
            <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> Create Task
            </Button>
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
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : isError ? (
              <div className="p-4 flex items-center gap-3 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">Failed to load tasks</span>
                <Button size="sm" variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No tasks found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left p-3 font-medium">ID</th>
                      <th className="text-left p-3 font-medium">Task</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Priority</th>
                      <th className="text-left p-3 font-medium">Created</th>
                      <th className="text-left p-3 font-medium">Duration</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-mono text-xs text-muted-foreground">{task.id}</td>
                        <td className="p-3">{task.title}</td>
                        <td className="p-3">
                          <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{task.priority ?? "—"}</td>
                        <td className="p-3 text-muted-foreground">{task.created_at}</td>
                        <td className="p-3 text-muted-foreground">{task.tokens_used}</td>
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
            )}
          </CardContent>
        </Card>

        {/* Task Detail with Trace */}
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">{selectedTask?.title}</DialogTitle>
              <DialogDescription>Task {selectedTask?.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={statusVariant[selectedTask?.status || "pending"]}>{selectedTask?.status}</Badge>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Priority:</span>
                <span>{selectedTask?.priority ?? "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Created:</span>
                <span>{selectedTask?.created_at}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-muted-foreground">Tokens:</span>
                <span>{selectedTask?.tokens_used}</span>
              </div>
              {selectedTask?.result && (
                <div>
                  <span className="text-muted-foreground">Result:</span>
                  <pre className="mt-1 p-3 rounded bg-muted text-xs whitespace-pre-wrap">{selectedTask.result}</pre>
                </div>
              )}

              {/* Execution Trace */}
              <div>
                <span className="text-muted-foreground font-medium">Execution Trace:</span>
                {traceLoading ? (
                  <div className="mt-2 flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading trace...
                  </div>
                ) : trace?.steps?.length ? (
                  <div className="mt-2 space-y-2">
                    {trace.steps.map((step, i) => (
                      <div key={i} className="p-2 rounded bg-muted text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">Step {step.step}</span>
                          <span className="text-muted-foreground">{step.timestamp}</span>
                        </div>
                        <p><span className="text-muted-foreground">Action:</span> {step.action}</p>
                        <p><span className="text-muted-foreground">Result:</span> {step.result}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">No trace data available</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Task Modal */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-heading">Create Task</DialogTitle>
              <DialogDescription>Submit a new task to the agent</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority: {newPriority[0]}</Label>
                <Slider
                  value={newPriority}
                  onValueChange={setNewPriority}
                  min={1}
                  max={5}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createTask.isPending || !newTitle.trim()} className="w-full">
                {createTask.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Task
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
