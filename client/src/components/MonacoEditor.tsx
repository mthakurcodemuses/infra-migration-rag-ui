import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useQuery } from "@tanstack/react-query";

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const { data: fileContent, error } = useQuery<string>({
    queryKey: ["/api/files/content", { path: filePath }],
    enabled: !!filePath,
  });

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    try {
      editor.current = monaco.editor.create(editorRef.current, {
        value: "",
        theme: "vs-dark",
        automaticLayout: true,
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
      });

      return () => {
        editor.current?.dispose();
      };
    } catch (error) {
      console.error("Failed to initialize Monaco editor:", error);
    }
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
        const model = editor.current.getModel();
        if (model) {
          model.setValue(fileContent);

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

          monaco.editor.setModelLanguage(model, languageMap[extension || ""] || "plaintext");
        }
      }
    } catch (error) {
      console.error("Error updating editor content:", error);
    }
  }, [fileContent, error, filePath]);

  return (
    <div ref={editorRef} className="h-full w-full" />
  );
}