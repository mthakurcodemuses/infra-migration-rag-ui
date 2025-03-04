import { Card } from "@/components/ui/card";
import { AlertCircle, Check, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IDELayout } from "@/components/IDELayout";
import { useState } from "react";

export function HomePage() {
  const [mode, setMode] = useState<"automated" | "manual" | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());

  const handleReviewComplete = (reviewType: "automated" | "manual") => {
    setCompletedReviews(prev => new Set([...prev, reviewType]));
    setDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Automated Changes */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {completedReviews.has("automated") ? (
              <Check className="h-6 w-6 text-green-500 mt-1" />
            ) : (
              <Clock className="h-6 w-6 text-orange-500 mt-1 animate-pulse" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Automated Changes</h2>
                {completedReviews.has("automated") && (
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Review Complete
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                {completedReviews.has("automated")
                  ? "All automated changes have been reviewed and processed."
                  : "There are some automated changes that need to be reviewed. Please review these changes by clicking the link below."}
              </p>
              <Dialog
                open={dialogOpen && mode === "automated"}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) setMode(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="px-0 font-semibold hover:no-underline"
                    onClick={() => setMode("automated")}
                  >
                    Review Automated Changes →
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh]">
                  {mode === "automated" && (
                    <IDELayout
                      mode="automated"
                      onClose={() => setDialogOpen(false)}
                      onSaveComplete={() => handleReviewComplete("automated")}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Manual Changes */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {completedReviews.has("manual") ? (
              <Check className="h-6 w-6 text-green-500 mt-1" />
            ) : (
              <Clock className="h-6 w-6 text-orange-500 mt-1 animate-pulse" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Manual Changes</h2>
                {completedReviews.has("manual") && (
                  <span className="text-sm text-green-500 flex items-center gap-1">
                    <Check className="h-4 w-4" />
                    Review Complete
                  </span>
                )}
              </div>
              <p className="text-muted-foreground mb-4">
                {completedReviews.has("manual")
                  ? "All manual changes have been reviewed and processed."
                  : "There are some changes that need to be applied manually. Please click the link below to review and apply those changes."}
              </p>
              <Dialog
                open={dialogOpen && mode === "manual"}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) setMode(null);
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="link"
                    className="px-0 font-semibold hover:no-underline"
                    onClick={() => setMode("manual")}
                  >
                    Apply Changes Manually →
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh]">
                  {mode === "manual" && (
                    <IDELayout
                      mode="manual"
                      onClose={() => setDialogOpen(false)}
                      onSaveComplete={() => handleReviewComplete("manual")}
                    />
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}