import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { MonacoEditor } from "./MonacoEditor";
import { ReviewPanel } from "./ReviewPanel";

export interface OpenFile {
  path: string;
  active: boolean;
}

export function IDELayout() {
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);

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

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
        <FileExplorer onFileSelect={handleFileSelect} />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ReviewPanel onReviewFiles={handleReviewFiles} />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={55}>
        {openFiles.length > 0 ? (
          <MonacoEditor 
            files={openFiles}
            onCloseFile={handleCloseFile}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to edit
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}