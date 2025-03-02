import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { MonacoEditor } from "./MonacoEditor";
import { ReviewPanel } from "./ReviewPanel";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface OpenFile {
  path: string;
  active: boolean;
}

interface IDELayoutProps {
  mode: "automated" | "manual";
  onClose?: () => void;
}

export function IDELayout({ mode, onClose }: IDELayoutProps) {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [modifiedFiles, setModifiedFiles] = useState<Record<string, string>>({});
  const [allChangesReviewed, setAllChangesReviewed] = useState(false);

  const handleFileSelect = (filePath: string) => {
    setOpenFiles(prev => {
      // If file is already open, make it active
      if (prev.some(f => f.path === filePath)) {
        return prev.map(f => ({
          ...f,
          active: f.path === filePath
        }));
      }
      // Otherwise, add it to the list and make it active
      return [...prev.map(f => ({ ...f, active: false })), { path: filePath, active: true }];
    });
  };

  const handleReviewFiles = (files: string[]) => {
    setOpenFiles(prev => {
      const newFiles = files.filter(f => !prev.some(p => p.path === f));
      if (newFiles.length === 0) {
        // If all files are already open, just make the last one active
        return prev.map((f, i) => ({ ...f, active: i === prev.length - 1 }));
      }
      return [
        ...prev.map(f => ({ ...f, active: false })),
        ...newFiles.map((f, i) => ({ path: f, active: i === newFiles.length - 1 }))
      ];
    });
  };

  const handleCloseFile = (filePath: string) => {
    setOpenFiles(prev => {
      const filtered = prev.filter(f => f.path !== filePath);
      // If we closed the active file, activate the last file in the list
      if (prev.find(f => f.path === filePath)?.active && filtered.length > 0) {
        filtered[filtered.length - 1].active = true;
      }
      return filtered;
    });
  };

  const handleFileChange = (path: string, content: string) => {
    setModifiedFiles(prev => ({
      ...prev,
      [path]: content
    }));
  };

  const saveFilesMutation = useMutation({
    mutationFn: async () => {
      // Save all modified files
      const savePromises = Object.entries(modifiedFiles).map(([path, content]) =>
        apiRequest('POST', '/api/files/save', { path, content })
      );
      await Promise.all(savePromises);
    },
    onSuccess: () => {
      if (onClose) onClose();
    }
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="overflow-hidden">
          <FileExplorer onFileSelect={handleFileSelect} />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={25} minSize={20} maxSize={30} className="overflow-hidden">
          <ReviewPanel
            mode={mode}
            onReviewFiles={handleReviewFiles}
            onReviewComplete={() => setAllChangesReviewed(true)}
          />
        </ResizablePanel>

        <ResizableHandle />

        <ResizablePanel defaultSize={55} className="overflow-hidden">
          {openFiles.length > 0 ? (
            <MonacoEditor
              files={openFiles}
              onCloseFile={handleCloseFile}
              onFileChange={handleFileChange}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a file to edit
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Button Bar */}
      <div className="flex justify-end gap-2 p-4 border-t">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={saveFilesMutation.isPending}
        >
          Exit without Saving
        </Button>
        <Button
          variant="default"
          onClick={() => saveFilesMutation.mutate()}
          disabled={saveFilesMutation.isPending || !allChangesReviewed}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          Save & Exit
        </Button>
      </div>
    </div>
  );
}