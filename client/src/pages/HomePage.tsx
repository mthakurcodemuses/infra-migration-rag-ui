import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IDELayout } from "@/components/IDELayout";
import { useState } from "react";

export function HomePage() {
  const [mode, setMode] = useState<"automated" | "manual" | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Automated Changes */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Automated Changes</h2>
              <p className="text-muted-foreground mb-4">
                There are some automated changes that need to be reviewed.
                Please review these changes by clicking the link below.
              </p>
              <Dialog>
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
                  {mode === "automated" && <IDELayout mode="automated" />}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* Manual Changes */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
            <div>
              <h2 className="text-lg font-semibold mb-2">Manual Changes</h2>
              <p className="text-muted-foreground mb-4">
                Please click the link below to apply changes manually.
              </p>
              <Dialog>
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
                  {mode === "manual" && <IDELayout mode="manual" />}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}