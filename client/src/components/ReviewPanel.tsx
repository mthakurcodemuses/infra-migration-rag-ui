import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Check, AlertCircle, FileText } from "lucide-react";
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
  filesToReview: string[];
  choices: ReviewChoice[];
}

interface ReviewPanelProps {
  onReviewFiles: (files: string[]) => void;
}

export function ReviewPanel({ onReviewFiles }: ReviewPanelProps) {
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const { data: reviews = [] } = useQuery<ReviewMessage[]>({
    queryKey: ["/api/reviews"],
  });

  // Auto-expand first unanswered review and open its files
  useEffect(() => {
    if (reviews.length > 0) {
      const firstUnansweredReview = reviews.find(r => !completedReviews.has(r.id));
      if (firstUnansweredReview) {
        setExpandedReviews(new Set([firstUnansweredReview.id]));
        onReviewFiles(firstUnansweredReview.filesToReview);
      }
    }
  }, [reviews, completedReviews, onReviewFiles]);

  const handleReviewComplete = async (reviewId: string) => {
    try {
      await fetch(`/api/reviews/${reviewId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'completed' })
      });

      setCompletedReviews(new Set([...Array.from(completedReviews), reviewId]));

      // Close current review
      const newExpanded = new Set(Array.from(expandedReviews));
      newExpanded.delete(reviewId);

      // Auto-expand next unanswered review and open its files
      const currentIndex = reviews.findIndex(r => r.id === reviewId);
      const nextUnanswered = reviews.slice(currentIndex + 1).find(r => !completedReviews.has(r.id));
      if (nextUnanswered) {
        newExpanded.add(nextUnanswered.id);
        onReviewFiles(nextUnanswered.filesToReview);
      }

      setExpandedReviews(newExpanded);
    } catch (error) {
      console.error('Failed to handle review completion:', error);
    }
  };

  const toggleExpand = (reviewId: string) => {
    const newExpanded = new Set(Array.from(expandedReviews));
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        onReviewFiles(review.filesToReview);
      }
    }
    setExpandedReviews(newExpanded);
  };

  return (
    <div className="flex flex-col h-full border-x border-border">
      <div className="border-b border-border p-2 bg-secondary/10">
        <div className="flex items-center gap-2 px-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Review Changes</h2>
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
                  "transition-all duration-200 rounded-lg overflow-hidden",
                  isCompleted 
                    ? "bg-secondary/5" 
                    : "bg-background hover:bg-accent/50"
                )}
              >
                {/* Header */}
                <div 
                  className={cn(
                    "flex items-center gap-2 p-3 cursor-pointer",
                    "border-l-[3px] transition-colors",
                    isCompleted 
                      ? "border-green-500/50" 
                      : "border-orange-500/50 hover:border-orange-500"
                  )}
                  onClick={() => toggleExpand(review.id)}
                >
                  {/* Expand/Collapse Icon */}
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <FileText className={cn(
                      "h-4 w-4 shrink-0",
                      isCompleted ? "text-green-500" : "text-orange-500"
                    )} />
                  </div>

                  {/* Title and Status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs px-2 py-0.5 rounded-sm bg-secondary/30 truncate">
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
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-border bg-card">
                    {/* Title Section */}
                    <div className="p-4 border-b border-border/50 bg-muted/30">
                      <h3 className="text-sm font-semibold text-foreground">
                        {review.title}
                      </h3>
                    </div>

                    {/* Description Section */}
                    <div className="p-4">
                      <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-border/50 overflow-x-auto">
                        {review.description}
                      </pre>
                    </div>

                    {/* Actions Section */}
                    {!isCompleted && (
                      <div className="p-4 bg-card border-t border-border/50">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleReviewComplete(review.id)}
                            className="gap-1.5 min-w-[200px] bg-green-500 hover:bg-green-600 text-white shadow-sm"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">
                              I've reviewed and made appropriate changes
                            </span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {reviews.length > 0 && reviews.every(r => completedReviews.has(r.id)) && (
            <Card className="p-3 text-center border-green-500/30 bg-green-500/5">
              <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
                <Check className="h-4 w-4" />
                <span>All changes have been reviewed</span>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}