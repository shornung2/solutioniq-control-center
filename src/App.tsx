import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WebSocketProvider } from "@/contexts/WebSocketContext";
import React, { Suspense } from "react";
import { LoadingFallback } from "@/components/LoadingFallback";

const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Analytics = React.lazy(() => import("./pages/Analytics"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Chat = React.lazy(() => import("./pages/Chat"));
const Files = React.lazy(() => import("./pages/Files"));
const Approvals = React.lazy(() => import("./pages/Approvals"));
const SettingsPage = React.lazy(() => import("./pages/Settings"));
const SystemStatus = React.lazy(() => import("./pages/SystemStatus"));
const Skills = React.lazy(() => import("./pages/Skills"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <WebSocketProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/files" element={<Files />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/system-status" element={<SystemStatus />} />
              <Route path="/skills" element={<Skills />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </WebSocketProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
