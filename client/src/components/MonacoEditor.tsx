import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useQuery } from "@tanstack/react-query";

// Configure Monaco's worker setup
self.MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    const workerPath = `/monaco-editor/min/vs/${label}/worker.js`;
    return workerPath;
  },
};

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const { data: fileContent, error } = useQuery<string>({
    queryKey: [`/api/files/content`, filePath],
    enabled: !!filePath,
  });

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Monaco editor
    editor.current = monaco.editor.create(editorRef.current, {
      value: "",
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

    return () => {
      editor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!editor.current) return;

    if (error) {
      editor.current.setValue(`Error loading file: ${error}`);
      return;
    }

    if (fileContent !== undefined) {
      const model = editor.current.getModel();
      if (model) {
        model.setValue(fileContent);
      }

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
      monaco.editor.setModelLanguage(model!, language);
    }
  }, [fileContent, filePath, error]);

  return (
    <div ref={editorRef} className="h-full w-full" />
  );
}