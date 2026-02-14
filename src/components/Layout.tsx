import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useTheme } from "@/hooks/use-theme";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import { AlertTriangle } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: LayoutProps) {
  const { theme, toggleTheme } = useTheme();
  const { status, healthData, isDegraded } = useConnectionStatus();

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
  return (
    <WebSocketProvider>
      <LayoutInner>{children}</LayoutInner>
    </WebSocketProvider>
  );
}
