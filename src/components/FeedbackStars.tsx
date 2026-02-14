import { useState, useCallback } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface FeedbackStarsProps {
  taskId: string;
}

export function FeedbackStars({ taskId }: FeedbackStarsProps) {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [showThanks, setShowThanks] = useState(false);
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClick = useCallback(
    (star: number) => {
      if (selectedStar === null) {
        setSelectedStar(star);
        setShowThanks(true);
        setTimeout(() => setShowThanks(false), 2000);
        api.post(`/chat/${taskId}/feedback`, { rating: star }).catch(() => {});
      } else {
        setShowFeedbackInput((v) => !v);
      }
    },
    [selectedStar, taskId]
  );

  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackText.trim() || !selectedStar) return;
    setSubmitting(true);
    try {
      await api.post(`/chat/${taskId}/feedback`, {
        rating: selectedStar,
        comment: feedbackText.trim(),
      });
      setShowFeedbackInput(false);
      setFeedbackText("");
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [feedbackText, selectedStar, taskId]);

  const getFilled = (star: number) => {
    if (selectedStar !== null) return star <= selectedStar;
    if (hoveredStar !== null) return star <= hoveredStar;
    return false;
  };

  return (
    <div className="flex flex-col gap-1 mt-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="p-0.5 transition-colors"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            onClick={() => handleClick(star)}
          >
            <Star
              size={16}
              className={
                getFilled(star)
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
            disabled={submitting || !feedbackText.trim()}
            onClick={handleSubmitFeedback}
          >
            {submitting ? "..." : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
}
