import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitFeedback } from "@/hooks/use-feedback";

interface FeedbackStarsProps {
  taskId: string;
}

function getStarColor(rating: number) {
  if (rating <= 2) return "text-red-500 fill-red-500";
  if (rating === 3) return "text-yellow-500 fill-yellow-500";
  return "text-green-500 fill-green-500";
}

export function FeedbackStars({ taskId }: FeedbackStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [showThanks, setShowThanks] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const submitFeedback = useSubmitFeedback();

  const handleClick = useCallback(
    (star: number) => {
      if (selectedStar === null) {
        setSelectedStar(star);
        setShowThanks(true);
        setTimeout(() => setShowThanks(false), 2000);
        submitFeedback.mutate({ task_id: taskId, rating: star });
      } else {
        setShowFeedbackInput((v) => !v);
      }
    },
    [selectedStar, taskId, submitFeedback]
  );

  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackText.trim() || !selectedStar) return;
    submitFeedback.mutate(
      { task_id: taskId, rating: selectedStar, comment: feedbackText.trim() },
      {
        onSuccess: () => {
          setShowFeedbackInput(false);
          setFeedbackText("");
        },
      }
    );
  }, [feedbackText, selectedStar, taskId, submitFeedback]);

  const activeRating = selectedStar ?? hoveredStar;

  const getFilled = (star: number) => {
    if (selectedStar !== null) return star <= selectedStar;
    if (hoveredStar !== null) return star <= hoveredStar;
    return false;
  };

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div
        className="flex items-center gap-0.5"
        role="radiogroup"
        aria-label="Rating"
        tabIndex={0}
        onKeyDown={(e) => {
          const current = selectedStar ?? 0;
          if (e.key === "ArrowRight") handleClick(Math.min(5, current + 1));
          if (e.key === "ArrowLeft") handleClick(Math.max(1, current - 1));
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0.5 transition-colors"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => handleClick(star)}
            aria-label={`${star} star`}
          >
            <Star
              size={16}
              className={
                getFilled(star) && activeRating
                  ? getStarColor(activeRating)
                  : getFilled(star)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground/40"
              }
            />
          </button>
        ))}
        {showThanks && (
          <span className="text-xs text-muted-foreground ml-1 animate-in fade-in">
            Thanks!
          </span>
        )}
      </div>
      {showFeedbackInput && (
        <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
          <Input
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Any additional feedback?"
            className="h-7 text-xs flex-1 max-w-[240px]"
            onKeyDown={(e) => e.key === "Enter" && handleSubmitFeedback()}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs px-2"
            disabled={submitFeedback.isPending || !feedbackText.trim()}
            onClick={handleSubmitFeedback}
          >
            {submitFeedback.isPending ? "..." : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}
