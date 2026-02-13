import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { API_URL, WS_URL } from "@/lib/api";
import { useConnectionStatus } from "@/hooks/use-connection-status";

export default function SettingsPage() {
  const { toast } = useToast();
  const isConnected = useConnectionStatus();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("solutioniq_api_key") || "");
  const [notifications, setNotifications] = useState(true);

  const save = () => {
    localStorage.setItem("solutioniq_api_key", apiKey);
    toast({ title: "Settings saved", description: "Your API key has been updated." });
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
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input id="api-key" type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter your API key" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Task Notifications</p>
                <p className="text-xs text-muted-foreground">Get notified on task completions and failures</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={save}>Save Settings</Button>
      </div>
    </Layout>
  );
}
