import { useState } from "react";
import {
  Editor,
  DiffEditor,
  OnMount,
  OnChange,
  loader,
} from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OpenFile } from "./IDELayout";

interface MonacoEditorProps {
  files: OpenFile[];
  onCloseFile: (path: string) => void;
  onFileChange: (path: string, content: string) => void;
  onTabSelect: (path: string) => void;
}

export function MonacoEditor({
  files,
  onCloseFile,
  onFileChange,
  onTabSelect,
}: MonacoEditorProps) {
  const [editedContents, setEditedContents] = useState<Record<string, string>>({});

  const activeFile = files.find((f) => f.active);

  const { data: fileContent } = useQuery<string>({
    queryKey: ["/api/files/content", activeFile?.path],
    enabled: !!activeFile?.path,
  });

  // Handle content changes
  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined && activeFile) {
      setEditedContents((prev) => ({
        ...prev,
        [activeFile.path]: value,
      }));
      onFileChange(activeFile.path, value);
    }
  };

  // Detect language based on file extension
  const getLanguage = (filePath: string) => {
    if (!filePath) return "plaintext";
    const extension = filePath.split(".").pop()?.toLowerCase() || "";

    const languageMap: Record<string, string> = {
      ts: "typescript",
      tsx: "typescript",
      js: "javascript",
      jsx: "javascript",
      json: "json",
      html: "html",
      css: "css",
      py: "python",
      md: "markdown",
    };

    return languageMap[extension] || "plaintext";
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {files.map((file) => (
          <div
            key={file.path}
            className={cn(
              "group flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer",
              "hover:bg-accent/50 transition-colors",
              file.active &&
                "bg-accent text-accent-foreground font-medium border-b-2 border-b-primary",
            )}
            onClick={() => onTabSelect(file.path)}
          >
            <span className="text-sm truncate max-w-[200px]">
              {file.path.split("/").pop()}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file.path);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-0">
        {activeFile && (
          <DiffEditor
            height="100%"
            theme="vs-light"
            language={getLanguage(activeFile.path)}
            original={fileContent}
            modified={editedContents[activeFile.path] || fileContent}
            options={{
              renderSideBySide: false,
              diffWordWrap: "on",
              readOnly: false,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              minimap: { enabled: true },
              folding: true,
              automaticLayout: true,
            }}
          />
        )}
      </div>
    </div>
  );
}