import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MigrationActionReview, MigrationMessage } from "./MigrationActionReview";
import { Skeleton } from "@/components/ui/skeleton";

// Define the API response type
interface BlueprintMessagesResponse {
  automatedChanges: {
    pendingMessage: string;
    completedMessage: string;
  };
  manualChanges: {
    pendingMessage: string;
    completedMessage: string;
  };
}

export function BlueprintLayerPage() {
  // Query to fetch the blueprint messages
  const { data, isLoading, error } = useQuery<BlueprintMessagesResponse>({
    queryKey: ["/api/blueprint-messages"],
    // If the API isn't implemented yet, this will fall back to default messages
    refetchOnWindowFocus: false,
  });

  // Default messages to use if API is not available yet
  const defaultMessages: BlueprintMessagesResponse = {
    automatedChanges: {
      pendingMessage: "There are some automated changes that need to be reviewed. Please review these changes by clicking the link below.",
      completedMessage: "All automated changes have been reviewed and processed."
    },
    manualChanges: {
      pendingMessage: "There are some changes that need to be applied manually. Please click the link below to review and apply those changes.",
      completedMessage: "All manual changes have been reviewed and processed."
    }
  };

  // Use the API data or fallback to defaults
  const messages = data || defaultMessages;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Error fetching blueprint messages:", error);
    // Use default messages if there's an error
    return (
      <MigrationActionReview 
        automatedChangesMessages={defaultMessages.automatedChanges}
        manualChangesMessages={defaultMessages.manualChanges}
      />
    );
  }

  return (
    <MigrationActionReview 
      automatedChangesMessages={messages.automatedChanges}
      manualChangesMessages={messages.manualChanges}
    />
  );
}