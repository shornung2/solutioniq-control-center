import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("solutioniq_api_url") || "http://localhost:8000");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("solutioniq_api_key") || "");
  const [notifications, setNotifications] = useState(true);

  const save = () => {
    localStorage.setItem("solutioniq_api_url", apiUrl);
    localStorage.setItem("solutioniq_api_key", apiKey);
    toast({ title: "Settings saved", description: "Your configuration has been updated." });
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
              <Label htmlFor="api-url">FastAPI Backend URL</Label>
              <Input id="api-url" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} placeholder="http://localhost:8000" />
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
