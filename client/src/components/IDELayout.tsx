import { useState } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { FileExplorer } from "./FileExplorer";
import { MonacoEditor } from "./MonacoEditor";
import { ChatPanel } from "./ChatPanel";

export function IDELayout() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  return (
    <ResizablePanelGroup direction="horizontal" className="h-screen">
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <FileExplorer onFileSelect={setSelectedFile} />
      </ResizablePanel>
      
      <ResizableHandle />
      
      <ResizablePanel defaultSize={80}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={70}>
            {selectedFile ? (
              <MonacoEditor filePath={selectedFile} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file to edit
              </div>
            )}
          </ResizablePanel>
          
          <ResizableHandle />
          
          <ResizablePanel defaultSize={30}>
            <ChatPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
