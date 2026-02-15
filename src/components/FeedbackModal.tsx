import { useState, useCallback, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useTaskFeedback, useSubmitFeedback } from "@/hooks/use-feedback";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FeedbackModalProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStarColor(rating: number) {
  if (rating <= 2) return "text-red-500 fill-red-500";
  if (rating === 3) return "text-yellow-500 fill-yellow-500";
  return "text-green-500 fill-green-500";
}

export function FeedbackModal({ taskId, open, onOpenChange }: FeedbackModalProps) {
  const { data: existing } = useTaskFeedback(open ? taskId : null);
  const submitFeedback = useSubmitFeedback();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [accuracy, setAccuracy] = useState([3]);
  const [speed, setSpeed] = useState([3]);
  const [helpfulness, setHelpfulness] = useState([3]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (existing) {
      setRating(existing.rating);
      setAccuracy([existing.accuracy_rating ?? 3]);
      setSpeed([existing.speed_rating ?? 3]);
      setHelpfulness([existing.helpfulness_rating ?? 3]);
      setComment(existing.comment ?? "");
    } else {
      setRating(0);
      setAccuracy([3]);
      setSpeed([3]);
      setHelpfulness([3]);
      setComment("");
    }
  }, [existing, open]);

  const handleSubmit = useCallback(() => {
    if (!taskId || rating === 0) return;
    submitFeedback.mutate(
      {
        task_id: taskId,
        rating,
        accuracy_rating: accuracy[0],
        speed_rating: speed[0],
        helpfulness_rating: helpfulness[0],
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Feedback submitted!");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to submit feedback"),
      }
    );
  }, [taskId, rating, accuracy, speed, helpfulness, comment, submitFeedback, onOpenChange]);

  const activeRating = hovered || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Rate this Task</DialogTitle>
          <DialogDescription>How well did the agent perform?</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Primary Stars */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex gap-1"
              role="radiogroup"
              aria-label="Rating"
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setRating(Math.min(5, rating + 1));
                if (e.key === "ArrowLeft") setRating(Math.max(1, rating - 1));
              }}
              tabIndex={0}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1 transition-colors"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  <Star
                    size={28}
                    className={
                      star <= activeRating
                        ? getStarColor(activeRating)
                        : "text-muted-foreground/30"
                    }
                  />
                </motion.button>
              ))}
            </div>
            {activeRating > 0 && (
              <span className="text-xs text-muted-foreground">
                {activeRating === 1 && "Poor"}
                {activeRating === 2 && "Below Average"}
                {activeRating === 3 && "Average"}
                {activeRating === 4 && "Good"}
                {activeRating === 5 && "Excellent"}
              </span>
            )}
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-medium">Detailed Ratings (optional)</p>
            {[
              { label: "Accuracy", value: accuracy, set: setAccuracy },
              { label: "Speed", value: speed, set: setSpeed },
              { label: "Helpfulness", value: helpfulness, set: setHelpfulness },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm w-24 text-muted-foreground">{label}</span>
                <Slider value={value} onValueChange={set} min={1} max={5} step={1} className="flex-1" />
                <span className="text-sm w-6 text-right font-mono">{value[0]}</span>
              </div>
            ))}
          </div>

          {/* Comment */}
          <Textarea
            placeholder="Any additional feedback? (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[60px] text-sm"
          />

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              Skip
            </Button>
            <Button
              size="sm"
              disabled={rating === 0 || submitFeedback.isPending}
              onClick={handleSubmit}
            >
              {submitFeedback.isPending ? "Submitting..." : existing ? "Update" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
