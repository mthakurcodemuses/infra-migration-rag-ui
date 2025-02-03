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
      <div className="border-b border-border p-2 bg-secondary/10">
        <div className="flex items-center gap-2 px-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Agent</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {reviews.map((review) => {
            const isCompleted = completedReviews.has(review.id);
            const isExpanded = expandedReviews.has(review.id);

            return (
              <Card 
                key={review.id} 
                className={cn(
                  "transition-colors rounded-lg overflow-hidden border shadow-sm",
                  isCompleted 
                    ? "bg-secondary/5" 
                    : "bg-background hover:shadow-md"
                )}
              >
                <div 
                  className={cn(
                    "flex items-center gap-2 p-3 cursor-pointer border-l-2 transition-colors",
                    isCompleted 
                      ? "border-l-green-500/50" 
                      : "border-l-orange-500/50 hover:border-l-orange-500"
                  )}
                  onClick={() => toggleExpand(review.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}

                  <FileText className={cn(
                    "h-4 w-4 shrink-0",
                    isCompleted ? "text-green-500" : "text-orange-500"
                  )} />

                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary/30 truncate">
                      {review.filePath}
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-xs text-green-500 shrink-0">
                        <Check className="h-3 w-3" />
                        Reviewed
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="p-3 space-y-3">
                      <h3 className="text-sm font-medium text-foreground">
                        {review.title}
                      </h3>
                      <pre className="text-xs font-mono whitespace-pre-wrap bg-secondary/20 p-3 rounded-md">
                        {review.description}
                      </pre>

                      {!isCompleted && (
                        <div className="flex gap-2 justify-end pt-2">
                          {review.choices.map((choice) => (
                            <Button
                              key={choice.action}
                              size="sm"
                              variant={choice.action === 'apply' ? 'default' : 'outline'}
                              onClick={() => handleAction(review.id, choice.action)}
                              className={cn(
                                "gap-1.5",
                                choice.action === 'apply' 
                                  ? "bg-green-500 hover:bg-green-600 text-white" 
                                  : "border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                              )}
                            >
                              {choice.action === 'apply' ? (
                                <Check className="h-3.5 w-3.5" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              <span className="text-xs">{choice.label}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}

          {reviews.length > 0 && reviews.every(r => completedReviews.has(r.id)) && (
            <Card className="p-3 text-center border-green-500/30 bg-green-500/5">
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
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