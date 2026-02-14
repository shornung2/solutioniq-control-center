import { useState } from "react";
import { Search, Mail, FileText, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Search, label: "Research companies and competitors" },
  { icon: Mail, label: "Draft emails and proposals" },
  { icon: FileText, label: "Create documents and presentations" },
  { icon: Zap, label: "Get proactive insights" },
];

export function WelcomeDialog() {
  const [open, setOpen] = useState(
    () => !localStorage.getItem("solutioniq_onboarded")
  );

  const handleGetStarted = () => {
    localStorage.setItem("solutioniq_onboarded", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-xl font-display">
            Welcome to SolutionIQ Autopilot
          </DialogTitle>
          <DialogDescription>
            Your AI-powered presales assistant
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-4">
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/50 p-4 text-center"
            >
              <Icon className="h-6 w-6 text-primary" />
              <span className="text-xs text-muted-foreground leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        <Button onClick={handleGetStarted} className="w-full">
          Get Started
        </Button>
      </DialogContent>
    </Dialog>
  );
}
