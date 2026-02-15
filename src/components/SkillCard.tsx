import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { SkillLibraryItem } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  research: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  documents: "bg-green-500/10 text-green-500 border-green-500/20",
  creative: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  communication: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  knowledge: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  browser: "bg-orange-500/10 text-orange-500 border-orange-500/20",
};

interface SkillCardProps {
  skill: SkillLibraryItem;
  isInstalled: boolean;
  isMutating: boolean;
  onToggle: () => void;
}

export function SkillCard({ skill, isInstalled, isMutating, onToggle }: SkillCardProps) {
  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <h3 className="text-sm font-medium leading-tight">
              {skill.name.replace(/_/g, " ")}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${CATEGORY_COLORS[skill.category] || ""}`}>
                {skill.category}
              </Badge>
              <span className="text-[10px] text-muted-foreground">v{skill.version}</span>
            </div>
          </div>
          <Button
            size="sm"
            variant={isInstalled ? "secondary" : "default"}
            disabled={isMutating}
            onClick={onToggle}
            className="shrink-0 text-xs h-7"
          >
            {isMutating ? <Loader2 className="h-3 w-3 animate-spin" /> : isInstalled ? "Installed" : "Install"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{skill.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">{skill.preferred_lane}</Badge>
          <span className="text-[10px] text-muted-foreground">${skill.estimated_cost.toFixed(2)}/use</span>
          {skill.trigger_keywords?.slice(0, 3).map((kw) => (
            <Badge key={kw} variant="outline" className="text-[10px] font-normal">
              {kw}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
