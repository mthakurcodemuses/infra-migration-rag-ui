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

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const [currentValue, setCurrentValue] = useState<string>("");

  const { data: fileContent, error } = useQuery<string>({
    queryKey: ["/api/files/content", { path: filePath }],
    enabled: !!filePath,
  });

  // Detect language based on file extension
  const getLanguage = () => {
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

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    // Enable basic language features
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    // Configure JavaScript and TypeScript compilation options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
    });

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.Latest,
      allowNonTsExtensions: true,
    });

    editor.focus();
  };

  // Handle content changes
  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) {
      setCurrentValue(value);
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="border-b border-border px-4 py-2">
        <span className="text-sm text-muted-foreground">{filePath}</span>
      </div>

      <div className="flex-1">
        <DiffEditor
          height="100%"
          theme="vs-dark"
          language={getLanguage()}
          original={error ? `Error loading file: ${error}` : fileContent}
          modified={currentValue || fileContent}
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
          loading={
            <div className="flex items-center justify-center h-full">
              <p className="text-lg">Loading editor...</p>
            </div>
          }
          beforeMount={(monaco) => {
            monaco.editor.defineTheme("custom-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [],
              colors: {},
            });
          }}
          onMount={handleEditorDidMount}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}