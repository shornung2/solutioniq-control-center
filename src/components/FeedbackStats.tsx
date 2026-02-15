import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeedbackStats } from "@/hooks/use-feedback";

function getBarColor(star: number) {
  if (star <= 2) return "bg-red-500";
  if (star === 3) return "bg-yellow-500";
  return "bg-green-500";
}

export function FeedbackStats() {
  const { data: stats, isLoading } = useFeedbackStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Feedback Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-heading">Feedback Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">No feedback data available</p>
        </CardContent>
      </Card>
    );
  }

  const avgRating = stats.average_rating ?? 0;
  const total = stats.total_feedback ?? 0;
  const distribution = stats.rating_distribution ?? {};
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-heading">Feedback Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Average */}
        <div className="flex items-center gap-3">
          <span className="text-3xl font-heading font-bold">{avgRating.toFixed(1)}</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={
                  s <= Math.round(avgRating)
                    ? "text-primary fill-primary"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({total} reviews)</span>
        </div>

        {/* Distribution */}
        <div className="space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 text-right text-muted-foreground">{star}</span>
                <Star size={10} className="text-muted-foreground" />
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBarColor(star)}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-muted-foreground">{pct.toFixed(0)}%</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
