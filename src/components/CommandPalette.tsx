import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import {
  LayoutDashboard,
  BarChart3,
  ListTodo,
  MessageSquare,
  FolderOpen,
  ShieldCheck,
  Settings,
  Activity,
  Puzzle,
} from "lucide-react";

const PAGES = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Tasks", path: "/tasks", icon: ListTodo },
  { label: "Chat", path: "/chat", icon: MessageSquare },
  { label: "Files", path: "/files", icon: FolderOpen },
  { label: "Approvals", path: "/approvals", icon: ShieldCheck },
  { label: "Skills", path: "/skills", icon: Puzzle },
  { label: "System Status", path: "/system-status", icon: Activity },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const go = (path: string) => {
    navigate(path);
    onOpenChange(false);
    setSearch("");
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages..." value={search} onValueChange={setSearch} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)} className="gap-2">
              <p.icon className="h-4 w-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
