import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import { useQuery } from "@tanstack/react-query";

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<monaco.editor.IStandaloneCodeEditor>();

  const { data: fileContent } = useQuery<string>({
    queryKey: [`/api/files/content`, filePath],
    enabled: !!filePath,
  });

  useEffect(() => {
    if (!editorRef.current) return;

    // Initialize Monaco editor
    editor.current = monaco.editor.create(editorRef.current, {
      value: "",
      language: "typescript",
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
    if (editor.current && fileContent !== undefined) {
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
      };
      
      const language = languageMap[extension || ""] || "plaintext";
      monaco.editor.setModelLanguage(model!, language);
    }
  }, [fileContent, filePath]);

  return (
    <div ref={editorRef} className="h-full w-full" />
  );
}
