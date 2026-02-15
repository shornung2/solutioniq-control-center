import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { feedbackService } from "@/services/feedbackService";
import type { TaskFeedback, FeedbackStats } from "@/lib/types";

export function useTaskFeedback(taskId: string | null) {
  return useQuery<TaskFeedback | null>({
    queryKey: ["feedback", taskId],
    queryFn: async () => {
      try {
        return await feedbackService.getForTask(taskId!);
      } catch {
        return null;
      }
    },
    enabled: !!taskId,
    staleTime: 25000,
    retry: false,
  });
}

export function useFeedbackStats() {
  return useQuery<FeedbackStats>({
    queryKey: ["feedback-stats"],
    queryFn: () => feedbackService.getStats(),
    staleTime: 25000,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: feedbackService.submit,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["feedback", variables.task_id] });
      queryClient.invalidateQueries({ queryKey: ["feedback-stats"] });
    },
  });
}
