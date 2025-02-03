import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Check, AlertCircle, FileText, X } from "lucide-react";
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

  // Auto-expand first unanswered review
  useEffect(() => {
    if (reviews.length > 0) {
      const firstUnansweredReview = reviews.find(r => !completedReviews.has(r.id));
      if (firstUnansweredReview) {
        setExpandedReviews(new Set([firstUnansweredReview.id]));
      }
    }
  }, [reviews, completedReviews]);

  const handleAction = async (reviewId: string, action: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      setCompletedReviews(new Set([...Array.from(completedReviews), reviewId]));

      // Close current review
      const newExpanded = new Set(Array.from(expandedReviews));
      newExpanded.delete(reviewId);

      // Auto-expand next unanswered review
      const currentIndex = reviews.findIndex(r => r.id === reviewId);
      const nextUnanswered = reviews.slice(currentIndex + 1).find(r => !completedReviews.has(r.id));
      if (nextUnanswered) {
        newExpanded.add(nextUnanswered.id);
      }

      setExpandedReviews(newExpanded);
    } catch (error) {
      console.error('Failed to handle review action:', error);
    }
  };

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(Array.from(expandedReviews));
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  return (
    <div className="flex flex-col h-full border-x border-border">
      <div className="border-b border-border p-3 bg-secondary/10">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Agent</h2>
        </div>
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
                  "p-4 transition-colors border-l-2",
                  isCompleted 
                    ? "border-l-green-500 bg-secondary/10" 
                    : "border-l-orange-500 shadow-sm"
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

                  <FileText className={cn(
                    "h-4 w-4",
                    isCompleted ? "text-green-500" : "text-orange-500"
                  )} />

                  <span className="font-mono text-xs px-2 py-1 rounded bg-secondary/50">
                    {review.filePath}
                  </span>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-xs text-green-500 ml-auto">
                      <Check className="h-3 w-3" />
                      Reviewed
                    </span>
                  )}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">{review.title}</h3>
                      <pre className="whitespace-pre-wrap text-sm bg-secondary/30 p-3 rounded-md border border-border">
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
                            className={cn(
                              "gap-2",
                              choice.action === 'apply' 
                                ? "bg-green-500 hover:bg-green-600" 
                                : "border-red-200 hover:bg-red-50"
                            )}
                          >
                            {choice.action === 'apply' ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
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
            <Card className="p-4 text-center border-green-500 border bg-green-50/10">
              <div className="flex items-center justify-center gap-2 text-green-500">
                <Check className="h-4 w-4" />
                <span>All manual changes have been reviewed</span>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}