import { Editor } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const { data: fileContent, error } = useQuery<string>({
    queryKey: ["/api/files/content", { path: filePath }],
    enabled: !!filePath,
  });

  // Detect language based on file extension
  const getLanguage = () => {
    if (!filePath) return "plaintext";

    const parts = filePath.split(".");
    const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

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
    <Editor
      height="100%"
      theme="vs-dark"
      language={getLanguage()}
      value={error ? `Error loading file: ${error}` : fileContent}
      options={{
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        fontSize: 14,
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
        automaticLayout: true,
      }}
      loading={<div className="p-4">Loading editor...</div>}
    />
  );
}