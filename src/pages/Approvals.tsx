import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown, AlertCircle } from "lucide-react";
import { usePendingApprovals, useCompletedApprovals, useApprovalAction } from "@/hooks/use-approvals";

export default function Approvals() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const { data: pending = [], isLoading: pendingLoading, isError: pendingError, refetch: refetchPending } = usePendingApprovals();
  const { data: completed = [], isLoading: completedLoading } = useCompletedApprovals();
  const approvalAction = useApprovalAction();

  const handleAction = (id: string, action: "approve" | "reject") => {
    approvalAction.mutate({ id, action, notes: notes[id] });
  };

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold">Approvals</h2>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              {pending.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">{pending.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))
            ) : pendingError ? (
              <Card>
                <CardContent className="p-4 flex items-center gap-3 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm">Failed to load approvals</span>
                  <Button size="sm" variant="outline" onClick={() => refetchPending()}>Retry</Button>
                </CardContent>
              </Card>
            ) : pending.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No pending approvals</p>
            ) : (
              pending.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-sm">{item.action}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <span className="text-xs text-muted-foreground">{item.requestedAt}</span>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                    </div>
                    <Textarea
                      placeholder="Add notes (optional)..."
                      className="text-sm h-16"
                      value={notes[item.id] || ""}
                      onChange={(e) => setNotes((n) => ({ ...n, [item.id]: e.target.value }))}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-1" onClick={() => handleAction(item.id, "approve")} disabled={approvalAction.isPending}>
                        <CheckCircle2 className="h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleAction(item.id, "reject")} disabled={approvalAction.isPending}>
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))
            ) : completed.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No completed approvals</p>
            ) : (
              completed.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-heading font-bold text-sm">{item.action}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        <span className="text-xs text-muted-foreground">{item.requestedAt}</span>
                      </div>
                      <Badge variant={item.status === "approved" ? "default" : "destructive"}>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        <ThumbsUp className="h-3 w-3" /> Good
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-1 text-xs">
                        <ThumbsDown className="h-3 w-3" /> Issue
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
