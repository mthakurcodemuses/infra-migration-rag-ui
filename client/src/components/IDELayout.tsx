import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { MonacoEditor } from "./MonacoEditor";
import { ChatPanel } from "./ChatPanel";

export function IDELayout() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
        <FileExplorer onFileSelect={setSelectedFile} />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <ChatPanel />
      </ResizablePanel>

      <ResizableHandle />

      <ResizablePanel defaultSize={55}>
        {selectedFile ? (
          <MonacoEditor filePath={selectedFile} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a file to edit
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}