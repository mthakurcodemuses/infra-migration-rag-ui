import { useState } from "react";
import { Editor, DiffEditor, OnMount, OnChange, loader } from "@monaco-editor/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as monaco from "monaco-editor";
import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MonacoEditorProps {
  filePath: string;
}

export function MonacoEditor({ filePath }: MonacoEditorProps) {
  const [currentValue, setCurrentValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fileContent, error } = useQuery<string>({
    queryKey: ["/api/files/content", { path: filePath }],
    enabled: !!filePath,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/files/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content })
      });
      if (!response.ok) {
        throw new Error('Failed to save file');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files/content", { path: filePath }] });
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
      toast({
        title: "File saved",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving file",
        description: error.message,
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSaving(false);
    }
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

  const handleSave = async () => {
    if (!currentValue) return;

    setIsSaving(true);
    await saveMutation.mutateAsync(currentValue);
  };

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-sm text-muted-foreground">
          {filePath}
        </span>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !currentValue}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : showSaveSuccess ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </Button>
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