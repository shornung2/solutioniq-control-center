import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useTheme } from "@/hooks/use-theme";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { useBudgetUsage } from "@/hooks/use-dashboard";
import { AlertTriangle, X } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { status, healthData, isDegraded } = useConnectionStatus();
  const { data: budget } = useBudgetUsage();
  const [budgetDismissed, setBudgetDismissed] = useState(false);

  const budgetWarning = !budgetDismissed && budget && (budget.daily_pct > 90 || budget.monthly_pct > 90);
  const warningLabel = budget && budget.daily_pct > 90
    ? `daily budget (${budget.daily_pct.toFixed(1)}%)`
    : budget ? `monthly budget (${budget.monthly_pct.toFixed(1)}%)` : "";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header theme={theme} toggleTheme={toggleTheme} status={status} healthData={healthData} />

          {isDegraded && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-400 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Some services are experiencing issues. Responses may be slower than usual.
            </div>
          )}

          {budgetWarning && (
            <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-xs">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>Budget Warning: You have used {warningLabel}.</span>
              <a href="/analytics" className="underline ml-1">View details</a>
              <button onClick={() => setBudgetDismissed(true)} className="ml-auto p-0.5 hover:bg-destructive/10 rounded">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
      <WelcomeDialog />
    </SidebarProvider>
  );
}

export function Layout({ children }: LayoutProps) {
  return <LayoutInner>{children}</LayoutInner>;
}
