import { Editor, loader } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";

// Configure the Monaco Editor loader to use CDN
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
  }
});

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

  // Handle editor mounting
  const handleEditorDidMount = (editor: any, monaco: any) => {
    // You can customize editor instance here
    editor.focus();
  };

  // Handle editor loading error
  const handleEditorLoadError = (error: any) => {
    console.error('Failed to load editor:', error);
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
      onMount={handleEditorDidMount}
      onError={handleEditorLoadError}
    />
  );
}