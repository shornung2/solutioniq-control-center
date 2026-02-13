export interface Metric {
  label: string;
  value: string;
  trend: string;
  icon?: string;
}

export interface ChartPoint {
  time: string;
  completed: number;
}

export interface ActivityItem {
  id: string;
  action: string;
  time: string;
  status: string;
}

export interface DashboardData {
  metrics: Metric[];
  chartData: ChartPoint[];
  activities: ActivityItem[];
}

export type TaskStatus = "pending" | "running" | "completed" | "failed";

export interface Task {
  id: string;
  title: string;
  task_type: string;
  status: TaskStatus;
  created_at: string;
  tokens_used: number;
  priority?: number;
  result?: string | null;
  description?: string;
  error?: string | null;
  source_channel?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  page: number;
  page_size: number;
}

export interface TaskTrace {
  steps: TraceStep[];
}

export interface TraceStep {
  step: number;
  action: string;
  result: string;
  timestamp: string;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Approval {
  id: string;
  action: string;
  description: string;
  requestedAt: string;
  status: ApprovalStatus;
}

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  time: string;
}

export interface AgentStatus {
  status: "active" | "paused" | "busy";
  active_task_count?: number;
  pending_approval_count?: number;
  deployment_name?: string;
  uptime_seconds?: number;
  last_heartbeat?: string;
  deployment_id?: string;
}

export interface BudgetUsage {
  daily_used: number;
  daily_limit: number;
  daily_pct: number;
  monthly_used: number;
  monthly_limit: number;
  monthly_pct: number;
  hard_stop_enabled: boolean;
  is_paused: boolean;
}

export interface UsageMetrics {
  tasks_completed_24h: number;
  tasks_failed_24h: number;
  approval_queue_depth: number;
  avg_response_ms: number;
  error_rate: number;
  uptime_pct: number;
}

export interface Capability {
  name: string;
  enabled: boolean;
  description?: string;
}
