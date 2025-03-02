import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiJson,
  SiMarkdown,
  SiPython
} from "react-icons/si";
import { FiFolder, FiFile } from "react-icons/fi";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export function FileExplorer({ onFileSelect }: { onFileSelect: (path: string) => void }) {
  const { data: fileTree, isError } = useQuery<FileNode[]>({
    queryKey: ["/api/files"],
  });

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string>("");

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (filename: string, isDirectory: boolean) => {
    if (isDirectory) {
      return expandedFolders.has(filename) ? 
        <FiFolder className="h-4 w-4 text-yellow-400 rotate-0" /> :
        <FiFolder className="h-4 w-4 text-yellow-400 -rotate-90" />;
    }

    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
        return <SiJavascript className="h-4 w-4 text-yellow-500" />;
      case 'ts':
      case 'tsx':
        return <SiTypescript className="h-4 w-4 text-blue-500" />;
      case 'html':
        return <SiHtml5 className="h-4 w-4 text-orange-500" />;
      case 'css':
        return <SiCss3 className="h-4 w-4 text-blue-400" />;
      case 'json':
        return <SiJson className="h-4 w-4 text-green-500" />;
      case 'md':
        return <SiMarkdown className="h-4 w-4 text-slate-500" />;
      case 'py':
        return <SiPython className="h-4 w-4 text-blue-600" />;
      default:
        return <FiFile className="h-4 w-4 text-slate-400" />;
    }
  };

  const renderNode = (node: FileNode, parentPath: string = "") => {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(currentPath);
    const isSelected = selectedFile === `./${currentPath}`;

    return (
      <div key={currentPath} className="pl-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-2 h-8 px-2 font-normal hover:bg-accent/50",
            isSelected && "bg-accent text-accent-foreground",
            node.type === "file" ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => {
            if (node.type === "directory") {
              toggleFolder(currentPath);
            } else {
              const path = `./${currentPath}`;
              setSelectedFile(path);
              onFileSelect(path);
            }
          }}
        >
          {node.type === "directory" && (
            isExpanded ? 
              <ChevronDown className="h-4 w-4 shrink-0" /> : 
              <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          {getFileIcon(node.name, node.type === "directory")}
          <span className="truncate">{node.name}</span>
        </Button>
        {node.type === "directory" && isExpanded && node.children && (
          <div className="pl-3 border-l border-border ml-2">
            {node.children.map((child) => renderNode(child, currentPath))}
          </div>
        )}
      </div>
    );
  };

  if (isError) {
    return <div className="p-4 text-destructive">Failed to load file tree</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <div className="p-2 border-b border-border">
        <h2 className="text-sm font-semibold px-2">Files</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {fileTree?.map((node) => renderNode(node))}
        </div>
      </ScrollArea>
    </div>
  );
}