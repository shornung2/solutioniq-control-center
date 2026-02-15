import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SkillCard } from "@/components/SkillCard";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { api } from "@/lib/api";
import { Search } from "lucide-react";
import type { SkillLibrary, SkillLibraryItem, InstalledSkill } from "@/lib/types";

const CATEGORIES = ["all", "research", "documents", "creative", "communication", "knowledge", "browser"] as const;

export default function Skills() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const debouncedSearch = useDebounce(search);

  const { data: skillsLibrary, isLoading: skillsLoading } = useQuery<SkillLibrary>({
    queryKey: ["skills-library"],
    queryFn: () => api.get<SkillLibrary>("/skills/library"),
  });

  const { data: installedSkills = [], isLoading: installedLoading } = useQuery<InstalledSkill[]>({
    queryKey: ["skills-installed"],
    queryFn: () => api.get<InstalledSkill[]>("/skills/installed"),
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
      toast({ title: "Skill installed" });
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/skills/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills-installed"] });
      toast({ title: "Skill uninstalled" });
    },
  });

  const isMutating = installMutation.isPending || uninstallMutation.isPending;

  const skillsList = useMemo(() => {
    if (!skillsLibrary) return [];
    let all = Object.values(skillsLibrary);
    if (activeCategory !== "all") all = all.filter((s) => s.category === activeCategory);
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      all = all.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.trigger_keywords?.some((k) => k.toLowerCase().includes(q))
      );
    }
    return all;
  }, [skillsLibrary, activeCategory, debouncedSearch]);

  const handleToggle = (skill: SkillLibraryItem) => {
    const isInstalled = installedMap.has(skill.name);
    if (isInstalled) {
      const id = installedMap.get(skill.name);
      if (id) uninstallMutation.mutate(id);
    } else {
      installMutation.mutate(skill.name);
    }
  };

  const isLoading = skillsLoading || installedLoading;

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-bold">Skills Marketplace</h2>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

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

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : skillsList.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">No skills found</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skillsList.map((skill) => (
              <SkillCard
                key={skill.name}
                skill={skill}
                isInstalled={installedMap.has(skill.name)}
                isMutating={isMutating}
                onToggle={() => handleToggle(skill)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
