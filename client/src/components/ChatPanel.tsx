import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

interface ReviewChoice {
  label: string;
  action: string;
}

interface ReviewMessage {
  id: string;
  type: "change" | "manual";
  filePath: string;
  title: string;
  description: string;
  choices: ReviewChoice[];
}

export function ChatPanel() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());

  const { data: reviews = [] } = useQuery<ReviewMessage[]>({
    queryKey: ["/api/reviews"],
  });

  const currentReview = reviews[currentReviewIndex];
  const hasMoreReviews = currentReviewIndex < reviews.length - 1;

  const handleAction = async (reviewId: string, action: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      setCompletedReviews(prev => new Set([...prev, reviewId]));

      if (hasMoreReviews) {
        setCurrentReviewIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to handle review action:', error);
    }
  };

  return (
    <div className="flex flex-col h-full border-x border-border">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold">Agent</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {currentReview && !completedReviews.has(currentReview.id) && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono bg-secondary px-2 py-1 rounded">
                  {currentReview.filePath}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">{currentReview.title}</h3>
                <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-2 rounded">
                  {currentReview.description}
                </pre>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                {currentReview.choices.map((choice) => (
                  <Button
                    key={choice.action}
                    variant={choice.action === 'apply' ? 'default' : 'outline'}
                    onClick={() => handleAction(currentReview.id, choice.action)}
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {reviews.length > 0 && reviews.every(r => completedReviews.has(r.id)) && (
            <Card className="p-4 text-center text-muted-foreground">
              All manual changes have been reviewed
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}