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
  name: string;
  status: TaskStatus;
  created: string;
  duration: string;
  output?: string;
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
