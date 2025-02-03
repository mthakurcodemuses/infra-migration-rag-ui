import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useWebSocket } from "@/lib/websocket";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sendMessage, lastMessage, isConnected } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      try {
        const message = JSON.parse(lastMessage);
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          type: message.type === "system" ? "system" : "assistant",
          content: message.content,
          timestamp: Date.now()
        }]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      type: "user",
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
    sendMessage(JSON.stringify({ type: "message", content: input }));
    setInput("");
  };

  return (
    <div className="flex flex-col h-full border-x border-border">
      <div className="border-b border-border p-3">
        <h2 className="text-sm font-semibold">Agent</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {!isConnected && (
            <Card className="bg-destructive/10 text-destructive p-3 text-sm">
              Connecting to chat server...
            </Card>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  message.type === "user"
                    ? "bg-primary text-primary-foreground"
                    : message.type === "system"
                    ? "bg-muted text-muted-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Message Agent..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button 
            onClick={handleSend} 
            disabled={!isConnected}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}