import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const { data: reviews = [] } = useQuery<ReviewMessage[]>({
    queryKey: ["/api/reviews"],
  });

  const handleAction = async (reviewId: string, action: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      setCompletedReviews(prev => new Set([...prev, reviewId]));
      setExpandedReviews(prev => {
        const next = new Set(prev);
        next.delete(reviewId);
        return next;
      });
    } catch (error) {
      console.error('Failed to handle review action:', error);
    }
  };

  const toggleExpand = (reviewId: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full border-x border-border">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold">Agent</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {reviews.map((review) => {
            const isCompleted = completedReviews.has(review.id);
            const isExpanded = expandedReviews.has(review.id);

            return (
              <Card 
                key={review.id} 
                className={cn(
                  "p-4 transition-colors",
                  isCompleted && "bg-secondary/20"
                )}
              >
                <div 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => toggleExpand(review.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}

                  <span className="font-mono bg-secondary px-2 py-1 rounded text-sm">
                    {review.filePath}
                  </span>

                  {isCompleted && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{review.title}</h3>
                      <pre className="whitespace-pre-wrap text-sm bg-secondary/50 p-2 rounded">
                        {review.description}
                      </pre>
                    </div>

                    {!isCompleted && (
                      <div className="flex gap-2 justify-end pt-2">
                        {review.choices.map((choice) => (
                          <Button
                            key={choice.action}
                            variant={choice.action === 'apply' ? 'default' : 'outline'}
                            onClick={() => handleAction(review.id, choice.action)}
                          >
                            {choice.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

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