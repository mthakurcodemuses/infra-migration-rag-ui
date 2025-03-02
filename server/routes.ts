import type { Express } from "express";
import { createServer, type Server } from "http";
import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { join, resolve } from "path";

interface FileNode {
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface ReviewMessage {
  id: string;
  type: "change" | "manual";
  filePath: string;
  title: string;
  description: string;
  filesToReview: string[];
  choices: {
    label: string;
    action: string;
  }[];
}

// Update mock data to use actual files from the codebase
const mockReviews: ReviewMessage[] = [
  {
    id: "1",
    type: "change",
    filePath: "client/src/components/MonacoEditor.tsx",
    title: "Editor configuration update",
    description: `Monaco Editor Component Changes:

Configuration Updates:
- Added TypeScript compilation support
- Enhanced theme configuration
- Improved error handling
- Updated editor options for better performance

Technical Details:
1. TypeScript Configuration
   - Added semantic validation
   - Enabled syntax validation
   - Set compilation target to latest
   - Configured allowNonTsExtensions

2. Theme Settings
   - Implemented custom dark theme
   - Added support for syntax highlighting
   - Updated token colors
   - Enhanced readability settings

3. Performance Optimizations
   - Enabled automatic layout
   - Configured minimap settings
   - Optimized rendering
   - Added proper cleanup on unmount

4. Error Handling
   - Enhanced error display
   - Added validation messages
   - Improved error recovery
   - Updated error boundaries

Code Impact:
{
  "compiler": {
    "syntaxValidation": true,
    "semanticValidation": true,
    "diagnostics": true,
    "completions": true
  },
  "editor": {
    "theme": "custom-dark",
    "minimap": true,
    "lineNumbers": true,
    "wordWrap": true
  }
}

Please review these changes carefully as they affect the core editor functionality.`,
    filesToReview: ["client/src/components/MonacoEditor.tsx", "client/src/lib/queryClient.ts"],
    choices: [
      { label: "Keep changes", action: "keep" },
      { label: "Remove changes", action: "remove" }
    ]
  },
  {
    id: "2",
    type: "change",
    filePath: "client/src/components/ReviewPanel.tsx",
    title: "Review panel functionality update",
    description: "Review panel component changes:\n- Enhanced review workflow\n- Added better status tracking\n- Improved UI feedback",
    filesToReview: ["client/src/components/ReviewPanel.tsx", "client/src/components/IDELayout.tsx"],
    choices: [
      { label: "Keep changes", action: "keep" },
      { label: "Remove changes", action: "remove" }
    ]
  }
];

function buildFileTree(dir: string): FileNode[] {
  const files = readdirSync(dir);
  return files
    .filter(file => !file.startsWith('.git'))
    .map(file => {
      const path = join(dir, file);
      const stats = statSync(path);
      if (stats.isDirectory()) {
        return {
          name: file,
          type: "directory",
          children: buildFileTree(path)
        };
      }
      return {
        name: file,
        type: "file"
      };
    });
}

export function registerRoutes(app: Express): Server {
  // File system routes
  app.get("/api/files", (_req, res) => {
    try {
      const fileTree = buildFileTree(".");
      res.json(fileTree);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: `Failed to read file system: ${err.message}` });
    }
  });

  app.get("/api/files/content", (req, res) => {
    const { path } = req.query;

    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Path parameter is required" });
    }

    try {
      const fullPath = resolve(path).replace(/^(\.\.[\/\\])+/, '');
      const content = readFileSync(fullPath, "utf-8");
      res.type('text/plain').send(content);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: `Failed to read file: ${err.message}` });
    }
  });

  // Review messages routes
  app.get("/api/reviews", (_req, res) => {
    res.json(mockReviews);
  });

  app.post("/api/reviews/:id/action", (req, res) => {
    const { id } = req.params;
    const { action } = req.body;

    const review = mockReviews.find(r => r.id === id);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    // Here you would handle the action for the specific review
    console.log(`Handling review completion for review ${id}`);

    res.json({ success: true });
  });

  // Add new save endpoint
  app.post("/api/files/save", (req, res) => {
    const { path, content } = req.body;

    if (!path || typeof path !== "string" || !content || typeof content !== "string") {
      return res.status(400).json({ error: "Path and content parameters are required" });
    }

    try {
      const fullPath = resolve(path).replace(/^(\.\.[\/\\])+/, '');
      writeFileSync(fullPath, content, "utf-8");
      res.json({ success: true });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: `Failed to save file: ${err.message}` });
    }
  });

  const server = createServer(app);
  return server;
}