import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api, API_URL, WS_URL } from "@/lib/api";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Capability, SkillLibrary, SkillLibraryItem, InstalledSkill, HealthDeep } from "@/lib/types";

const CATEGORIES = ["all", "research", "documents", "creative", "communication", "knowledge", "browser"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  documents: "bg-green-500/10 text-green-500 border-green-500/20",
  creative: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  communication: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  knowledge: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  browser: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

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
  const [notifications, setNotifications] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data: capabilities = [], isLoading: capLoading } = useQuery<Capability[]>({
    queryKey: ["capabilities"],
    queryFn: () => api.get<Capability[]>("/capabilities"),
  });

  const { data: skillsLibrary, isLoading: skillsLoading } = useQuery<SkillLibrary>({
    queryKey: ["skills-library"],
    queryFn: () => api.get<SkillLibrary>("/skills/library"),
  });

  const { data: installedSkills = [], isLoading: installedLoading } = useQuery<InstalledSkill[]>({
    queryKey: ["skills-installed"],
    queryFn: () => api.get<InstalledSkill[]>("/skills/installed"),
  });

  const { data: healthDeep, isLoading: healthLoading } = useQuery<HealthDeep>({
    queryKey: ["health-deep"],
    queryFn: () => api.get<HealthDeep>("/health/deep"),
  });

  const installedMap = useMemo(() => {
    const map = new Map<string, string>();
    installedSkills.forEach((s) => map.set(s.name, s.id));
    return map;
  }, [installedSkills]);

  const installMutation = useMutation({
    mutationFn: (name: string) => api.post(`/skills/${name}/install`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills-installed"] });
      toast({ title: "Skill installed", description: "The skill has been activated." });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills-installed"] });
      toast({ title: "Skill uninstalled", description: "The skill has been deactivated." });
    },
  });

  const isMutating = installMutation.isPending || uninstallMutation.isPending;

  const skillsList = useMemo(() => {
    if (!skillsLibrary) return [];
    const all = Object.values(skillsLibrary);
    if (activeCategory === "all") return all;
    return all.filter((s) => s.category === activeCategory);
  }, [skillsLibrary, activeCategory]);

  const handleToggle = (skill: SkillLibraryItem, isInstalled: boolean) => {
    if (isInstalled) {
      const id = installedMap.get(skill.name);
      if (id) uninstallMutation.mutate(id);
    } else {
      installMutation.mutate(skill.name);
    }
  };

  const save = () => {
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
  };

  const isSkillsLoading = skillsLoading || installedLoading;

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

        {/* Skills Marketplace */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-heading">Skills Marketplace</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCategory === cat ? "secondary" : "ghost"}
                  className="capitalize text-xs h-7"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {isSkillsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : skillsList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No skills available</p>
            ) : (
              <div className="space-y-3">
                {skillsList.map((skill) => {
                  const isInstalled = installedMap.has(skill.name);
                  return (
                    <div key={skill.name} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{skill.name.replace(/_/g, " ")}</span>
                          <Badge variant="outline" className={CATEGORY_COLORS[skill.category] || ""}>
                            {skill.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {skill.preferred_lane}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{skill.description}</p>
                        <p className="text-xs text-muted-foreground">${skill.estimated_cost.toFixed(2)}/use</p>
                      </div>
                      <Switch
                        checked={isInstalled}
                        disabled={isMutating}
                        onCheckedChange={() => handleToggle(skill, isInstalled)}
                      />
                    </div>
                  );
                })}
              </div>
            )}
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
