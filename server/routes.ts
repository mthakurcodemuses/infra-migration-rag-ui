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

function buildFileTree(dir: string): FileNode[] {
  const files = readdirSync(dir);
  return files.map(file => {
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
      const fileTree = buildFileTree("./");
      res.json(fileTree);
    } catch (error) {
      res.status(500).json({ error: "Failed to read file system" });
    }
  });

  app.get("/api/files/content", (req, res) => {
    const { path } = req.query;
    if (!path || typeof path !== "string") {
      return res.status(400).json({ error: "Path parameter is required" });
    }

    try {
      const fullPath = resolve(path);
      const content = readFileSync(fullPath, "utf-8");
      res.send(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to read file" });
    }
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