import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api, API_URL, WS_URL } from "@/lib/api";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { usePreferences } from "@/hooks/use-preferences";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Capability, HealthDeep } from "@/lib/types";

const TOOLS_CONFIG = [
  { key: "web_search", label: "Web Search", alwaysAvailable: false },
  { key: "document_production", label: "Document Production", alwaysAvailable: true },
  { key: "image_generation", label: "Image Generation", alwaysAvailable: false },
  { key: "browser", label: "Browser Automation", alwaysAvailable: false },
];

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isConnected = useConnectionStatus();
  const { prefs, update } = usePreferences();

  const { data: capabilities = [], isLoading: capLoading } = useQuery<Capability[]>({
    queryKey: ["capabilities"],
    queryFn: () => api.get<Capability[]>("/capabilities"),
  });

  const { data: healthDeep, isLoading: healthLoading } = useQuery<HealthDeep>({
    queryKey: ["health-deep"],
    queryFn: () => api.get<HealthDeep>("/health/deep"),
  });

  const save = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-xl font-heading font-bold">Settings</h2>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">API Connection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Backend URL</Label>
              <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded">{API_URL}</p>
            </div>
            <div className="space-y-2">
              <Label>WebSocket URL</Label>
              <p className="text-sm text-muted-foreground font-mono bg-muted px-3 py-2 rounded">{WS_URL}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-destructive"}`} />
              <span className="text-sm text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
            </div>
            <p className="text-xs text-muted-foreground">Authentication is managed securely via encrypted secrets.</p>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Task Notifications</p>
                <p className="text-xs text-muted-foreground">Get notified on task completions and failures</p>
              </div>
              <Switch checked={prefs.notificationsEnabled} onCheckedChange={(v) => update({ notificationsEnabled: v })} />
            </div>
            <div className="space-y-2">
              <Label>Budget Alert Threshold: {prefs.budgetAlertThreshold}%</Label>
              <Slider
                value={[prefs.budgetAlertThreshold]}
                onValueChange={([v]) => update({ budgetAlertThreshold: v })}
                min={50}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Default Task Priority</Label>
              <Select value={String(prefs.defaultTaskPriority)} onValueChange={(v) => update({ defaultTaskPriority: Number(v) })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((p) => (
                    <SelectItem key={p} value={String(p)}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Auto-archive Completed Tasks</p>
                <p className="text-xs text-muted-foreground">Automatically archive tasks when completed</p>
              </div>
              <Switch checked={prefs.autoArchiveCompleted} onCheckedChange={(v) => update({ autoArchiveCompleted: v })} />
            </div>
          </CardContent>
        </Card>

        {/* Tools Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">Tools Status</CardTitle>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {TOOLS_CONFIG.map((tool) => {
                  const available = tool.alwaysAvailable || healthDeep?.tools?.[tool.key]?.available === true;
                  return (
                    <div key={tool.key} className="flex items-center gap-3 py-1">
                      {available ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                      )}
                      <span className="text-sm">{tool.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {available ? "Available" : "Not configured"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Capabilities Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">Capabilities</CardTitle>
          </CardHeader>
          <CardContent>
            {capLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : capabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No capabilities data available</p>
            ) : (
              <div className="space-y-3">
                {capabilities.map((cap) => (
                  <div key={cap.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium capitalize">{cap.name}</p>
                      {cap.description && <p className="text-xs text-muted-foreground">{cap.description}</p>}
                    </div>
                    <Badge variant={cap.enabled ? "default" : "outline"}>
                      {cap.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={save}>Save Settings</Button>
      </div>
    </Layout>
  );
}
