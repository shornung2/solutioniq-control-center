import { api } from "@/lib/api";
import type { TaskFeedback, FeedbackStats } from "@/lib/types";

export const feedbackService = {
  submit: (data: {
    task_id: string;
    rating: number;
    accuracy_rating?: number;
    speed_rating?: number;
    helpfulness_rating?: number;
    comment?: string;
  }) => api.post<TaskFeedback>("/feedback", data),

  getForTask: (taskId: string) =>
    api.get<TaskFeedback>(`/feedback/task/${taskId}`),

  getStats: () => api.get<FeedbackStats>("/feedback/stats"),
};
