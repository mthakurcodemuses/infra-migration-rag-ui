import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { readFileSync, readdirSync, statSync } from "fs";
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
  choices: {
    label: string;
    action: string;
  }[];
}

// Mock review messages for demonstration
const mockReviews: ReviewMessage[] = [
  {
    id: "1",
    type: "change",
    filePath: "vpe-endpoint",
    title: "VPE endpoint module has following changes",
    description: "IP address = 10.10.10.10\ndebugging logs = enabled",
    choices: [
      { label: "Ignore", action: "ignore" },
      { label: "Apply", action: "apply" }
    ]
  },
  {
    id: "2",
    type: "manual",
    filePath: "rds-oracle",
    title: "RDS Oracle module has below changes",
    description: "module \"rds-oracle\"\nOracle backup = enabled",
    choices: [
      { label: "Ignore", action: "ignore" },
      { label: "Apply", action: "apply" }
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

    // Here you would handle the action (ignore/apply) for the specific review
    console.log(`Handling action ${action} for review ${id}`);

    res.json({ success: true });
  });

  const server = createServer(app);
  
  // WebSocket server setup with proper upgrade handling
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade manually to avoid conflicts with Vite
  server.on('upgrade', (request, socket, head) => {
    const protocol = request.headers['sec-websocket-protocol'];

    // Skip Vite HMR connections
    if (protocol === 'vite-hmr') {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on("connection", (ws: WebSocket) => {
    // Send initial connection message
    ws.send(JSON.stringify({
      type: "system",
      content: "Connected to IDE chat"
    }));

    ws.on("message", (data: string) => {
      try {
        const message = JSON.parse(data);
        // Echo back the message for now
        ws.send(JSON.stringify({
          type: "response",
          content: `Received: ${message.content}`
        }));
      } catch (error) {
        console.error("Failed to process WebSocket message:", error);
      }
    });
  });
  
  return server;
}