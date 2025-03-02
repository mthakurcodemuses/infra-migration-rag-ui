import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Automated Changes */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/review/automated" className="block">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Automated Changes</h2>
                <p className="text-muted-foreground">
                  There are some automated changes that need to be reviewed.
                  Please review these changes by clicking this link.
                </p>
              </div>
            </div>
          </Link>
        </Card>

        {/* Manual Changes */}
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/review/manual" className="block">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-orange-500 mt-1" />
              <div>
                <h2 className="text-lg font-semibold mb-2">Manual Changes</h2>
                <p className="text-muted-foreground">
                  Please click this link to apply changes manually.
                </p>
              </div>
            </div>
          </Link>
        </Card>
      </div>
    </div>
  );
}
