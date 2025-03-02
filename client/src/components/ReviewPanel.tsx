import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, Check, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

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
  mode: "automated" | "manual";
  onReviewFiles: (files: string[]) => void;
  onReviewComplete: () => void;
}

export function ReviewPanel({ mode, onReviewFiles, onReviewComplete }: ReviewPanelProps) {
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  const { data: reviews = [] } = useQuery<ReviewMessage[]>({
    queryKey: ["/api/reviews", { mode }],
  });

  const reviewActionMutation = useMutation({
    mutationFn: async ({ reviewId, action }: { reviewId: string; action: string }) => {
      const response = await apiRequest('POST', `/api/reviews/${reviewId}/action`, { action });
      return response.json();
    },
    onSuccess: (_, { reviewId }) => {
      setCompletedReviews(new Set([...Array.from(completedReviews), reviewId]));

      // Close current review
      const newExpanded = new Set(Array.from(expandedReviews));
      newExpanded.delete(reviewId);

      // Auto-expand next unanswered review and open its files
      const currentIndex = reviews.findIndex(r => r.id === reviewId);
      const nextUnanswered = reviews.slice(currentIndex + 1).find(r => !completedReviews.has(r.id));
      if (nextUnanswered) {
        newExpanded.add(nextUnanswered.id);
        if (nextUnanswered.filesToReview?.length > 0) {
          onReviewFiles(nextUnanswered.filesToReview);
        }
      }

      setExpandedReviews(newExpanded);
    }
  });

  // Auto-expand first unanswered review and open its files
  useEffect(() => {
    if (reviews.length > 0) {
      const firstUnansweredReview = reviews.find(r => !completedReviews.has(r.id));
      if (firstUnansweredReview) {
        setExpandedReviews(new Set([firstUnansweredReview.id]));
        if (firstUnansweredReview.filesToReview?.length > 0) {
          onReviewFiles(firstUnansweredReview.filesToReview);
        }
      }
    }
  }, [reviews, completedReviews, onReviewFiles]);

  // Watch for all reviews being completed
  useEffect(() => {
    if (reviews.length > 0 && reviews.every(r => completedReviews.has(r.id))) {
      onReviewComplete();
    }
  }, [reviews, completedReviews, onReviewComplete]);

  const handleAction = async (reviewId: string, action: string) => {
    await reviewActionMutation.mutateAsync({ reviewId, action });
  };

  const toggleExpand = (reviewId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent double-toggling
    event.stopPropagation();

    const newExpanded = new Set(Array.from(expandedReviews));
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
      const review = reviews.find(r => r.id === reviewId);
      if (review?.filesToReview?.length > 0) {
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
          <span className="text-xs text-muted-foreground">
            ({mode === "automated" ? "Automated" : "Manual"})
          </span>
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
                  onClick={(e) => toggleExpand(review.id, e)}
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
                    <div className="flex items-baseline gap-2 justify-between">
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
                    <ScrollArea className="h-[200px]">
                      <div className="p-4">
                        <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap bg-muted/50 p-4 rounded-md border border-border/50">
                          {review.description}
                        </pre>
                      </div>
                    </ScrollArea>

                    {/* Files to Review Section */}
                    {review.filesToReview?.length > 0 && (
                      <div className="p-4 border-t border-border/50">
                        <h4 className="text-sm font-medium mb-2">Files to Review:</h4>
                        <div className="space-y-1">
                          {review.filesToReview.map((file) => (
                            <div key={file} className="text-xs font-mono text-muted-foreground">
                              {file}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions Section */}
                    {!isCompleted && (
                      <div className="p-4 bg-card border-t border-border/50">
                        {mode === "automated" ? (
                          <>
                            <p className="text-sm text-muted-foreground mb-3">
                              Please make a selection for this change
                            </p>
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(review.id, 'remove')}
                                className="min-w-[120px] hover:bg-red-600 hover:text-white border-red-500 text-red-500"
                                disabled={reviewActionMutation.isPending}
                              >
                                Remove changes
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAction(review.id, 'keep')}
                                className="min-w-[120px] bg-green-500 hover:bg-green-600 text-white"
                                disabled={reviewActionMutation.isPending}
                              >
                                Keep changes
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleAction(review.id, 'completed')}
                              className="gap-1.5 min-w-[200px] bg-green-500 hover:bg-green-600 text-white shadow-sm"
                              disabled={reviewActionMutation.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                              <span className="text-xs font-medium">
                                I've reviewed and made appropriate changes
                              </span>
                            </Button>
                          </div>
                        )}
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