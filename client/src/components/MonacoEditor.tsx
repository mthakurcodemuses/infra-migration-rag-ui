import { Editor, OnMount, OnChange, loader } from "@monaco-editor/react";
import { useQuery } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

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
    console.log("Filepath: ", filePath);
    if (!filePath) return "plaintext";

    const parts = filePath.split(".");
    console.log("Filepath parts: ", parts);
    const extension =
      parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";

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

    console.log("Language ", languageMap[extension]);

    return languageMap[extension] || "plaintext";
  };

  // Handle editor mounting with proper types
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

  // Handle content changes if needed
  const handleEditorChange: OnChange = (value, event) => {
    // Handle content changes here if needed
    console.log("Content changed");
  };

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        theme="vs-dark"
        language={getLanguage()}
        value={error ? `Error loading file: ${error}` : fileContent}
        loading={
          <div className="flex items-center justify-center h-full">
            <p className="text-lg">Loading editor...</p>
          </div>
        }
        beforeMount={(monaco) => {
          // Configure editor before mounting
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
  );
}
