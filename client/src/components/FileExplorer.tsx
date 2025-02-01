import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, ChevronDown, FileIcon, FolderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

export function FileExplorer({ onFileSelect }: { onFileSelect: (path: string) => void }) {
  const { data: fileTree } = useQuery<FileNode[]>({
    queryKey: ["/api/files"],
  });

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: FileNode, path: string = "") => {
    const fullPath = `${path}/${node.name}`;
    const isExpanded = expandedFolders.has(fullPath);

    return (
      <div key={fullPath} className="pl-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full justify-start gap-2 h-8 px-2 font-normal",
            node.type === "file" ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => {
            if (node.type === "directory") {
              toggleFolder(fullPath);
            } else {
              onFileSelect(fullPath);
            }
          }}
        >
          {node.type === "directory" && (
            isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
          {node.type === "directory" ? (
            <FolderIcon className="h-4 w-4" />
          ) : (
            <FileIcon className="h-4 w-4" />
          )}
          <span className="truncate">{node.name}</span>
        </Button>
        {node.type === "directory" && isExpanded && node.children && (
          <div className="pl-4">
            {node.children.map((child) => renderNode(child, fullPath))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {fileTree?.map((node) => renderNode(node))}
      </div>
    </ScrollArea>
  );
}
