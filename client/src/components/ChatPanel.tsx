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
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {!isConnected && (
          <Card className="mb-2 p-3 bg-destructive text-destructive-foreground">
            Connecting to chat server...
          </Card>
        )}
        {messages.map((message) => (
          <Card 
            key={message.id}
            className={`mb-2 p-3 ${
              message.type === "system"
                ? "bg-muted text-muted-foreground"
                : message.type === "assistant" 
                  ? "bg-secondary" 
                  : "bg-primary text-primary-foreground"
            }`}
          >
            {message.content}
          </Card>
        ))}
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1"
            disabled={!isConnected}
          />
          <Button onClick={handleSend} disabled={!isConnected}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}