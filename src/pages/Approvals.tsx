import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";

interface Approval {
  id: string;
  action: string;
  description: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
}

const pendingApprovals: Approval[] = [
  { id: "A-001", action: "Database Migration", description: "Migrate users table to add 'preferences' column (JSON).", requestedAt: "10 min ago", status: "pending" },
  { id: "A-002", action: "Send Bulk Email", description: "Send promotional email to 1,240 opted-in subscribers.", requestedAt: "25 min ago", status: "pending" },
  { id: "A-003", action: "Delete Stale Records", description: "Remove 89 records older than 2 years from archive.", requestedAt: "1 hr ago", status: "pending" },
];

const completedApprovals: Approval[] = [
  { id: "A-010", action: "API Rate Limit Update", description: "Increased rate limit from 100 to 500 req/min.", requestedAt: "3 hrs ago", status: "approved" },
  { id: "A-011", action: "Disable Test Account", description: "Deactivated test account user@test.com.", requestedAt: "5 hrs ago", status: "rejected" },
];

export default function Approvals() {
  const [notes, setNotes] = useState<Record<string, string>>({});

  return (
    <Layout>
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold">Approvals</h2>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2 text-xs">{pendingApprovals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingApprovals.map((item) => (
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
                    <Button size="sm" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-4">
            {completedApprovals.map((item) => (
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
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
