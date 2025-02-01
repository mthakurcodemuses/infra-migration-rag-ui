import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useQuery } from "@tanstack/react-query";

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  // Configure Monaco environment before initialization
  useEffect(() => {
    // Set up Monaco environment if not already configured
    if (!window.MonacoEnvironment) {
      window.MonacoEnvironment = {
        getWorkerUrl: function (_moduleId: string, label: string) {
          const workerPath = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs/${label}/worker.js`;
          return workerPath;
        }
      };
    }
  }, []);

  const { data: fileContent, error } = useQuery<string>({
    queryKey: ["/api/files/content", { path: filePath }],
    enabled: !!filePath,
  });

  useEffect(() => {
    if (!editorRef.current) return;

    try {
      // Initialize Monaco editor with error handling
      editor.current = monaco.editor.create(editorRef.current, {
        value: fileContent || "",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: {
          enabled: true,
        },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
      });

      // Set language based on file extension
      const extension = filePath.split(".").pop()?.toLowerCase();
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

      const language = languageMap[extension || ""] || "plaintext";
      const model = editor.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
    }

    return () => {
      editor.current?.dispose();
    };
  }, []);

  // Update editor content when file content changes
  useEffect(() => {
    if (!editor.current) return;

    try {
      if (error) {
        editor.current.setValue(`Error loading file: ${error}`);
        return;
      }

      if (fileContent !== undefined) {
        editor.current.setValue(fileContent);
      }
    } catch (error) {
      console.error("Error updating editor content:", error);
    }
  }, [fileContent, error]);

  return (
    <div ref={editorRef} className="h-full w-full" />
  );
}