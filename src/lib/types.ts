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

export interface FileAttachment {
  file_id: string;
  filename: string;
  download_url: string;
  mime_type: string;
  size_bytes: number;
}

export interface ChatSendResponse {
  content: string | null;
  task_id: string;
  conversation_id: string;
  status: "completed" | "queued" | "failed" | "degraded";
  lane: string;
  model: string;
  cost_usd: number;
  tokens_used: number;
  message_number: number;
  files?: FileAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  message_count: number;
  total_cost_usd: number;
  is_active: boolean;
  created_at: string;
  last_message_at: string;
}

export interface ConversationMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  lane: string;
  model: string;
  cost_usd: number;
  timestamp: string;
}

export interface AnalyticsSummary {
  today: { tasks: number; tokens: number; cost_usd: number; conversations: number };
  month_to_date: { cost_usd: number };
}

export interface AnalyticsCosts {
  total_cost_usd: number;
  monthly_projected_usd: number;
  budget_used_pct: number;
  by_model: Array<{ model: string; cost: number; calls: number }>;
  by_day: Array<{ date: string; cost: number; calls: number }>;
  by_lane: Array<{ lane: string; cost: number; tasks: number }>;
}

export interface AnalyticsRouting {
  routing_stats: Array<{ lane: string; task_count: number; success_rate: number; avg_tokens: number }>;
  feedback_by_lane: Record<string, { avg_rating: number; count: number }>;
}

export interface SkillLibraryItem {
  name: string;
  version: string;
  category: string;
  description: string;
  preferred_lane: string;
  trigger_keywords: string[];
  estimated_cost: number;
}

export type SkillLibrary = Record<string, SkillLibraryItem>;

export interface InstalledSkill {
  id: string;
  name: string;
  installed_at: string;
  config: Record<string, unknown>;
}

export interface HealthDeep {
  tools: Record<string, { available: boolean }>;
}

export interface HealthDeepResponse {
  status: "healthy" | "degraded";
  checks: {
    database: { status: string; latency_ms: number };
    redis: { status: string };
    llm_providers: {
      status: string;
      circuits: Record<string, { state: string; available: boolean }>;
    };
  };
}
