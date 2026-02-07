import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Minimize2, Maximize2, 
  User, Bot, Paperclip, Image, Smile, MoreVertical,
  Phone, Mail, Clock, CheckCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent" | "bot";
  timestamp: string;
  status?: "sending" | "sent" | "delivered" | "read";
  agentName?: string;
  agentAvatar?: string;
}

interface QuickReply {
  id: string;
  text: string;
}

const QUICK_REPLIES: QuickReply[] = [
  { id: "1", text: "How do I track my order?" },
  { id: "2", text: "I need help with my account" },
  { id: "3", text: "How do commissions work?" },
  { id: "4", text: "I want to become a distributor" },
  { id: "5", text: "Contact support team" },
];

const BOT_RESPONSES: Record<string, string> = {
  "order": "You can track your order by logging into your account and visiting the Orders page. If you need further assistance, I can connect you with our support team.",
  "account": "For account-related issues, please visit your Profile page or Settings. If you're having trouble logging in, try resetting your password. Would you like me to connect you with support?",
  "commission": "Commissions are calculated based on your personal sales and team performance. You can view your commission breakdown in the Commissions tab of your distributor portal. Want more details?",
  "distributor": "Great! To become a distributor, click 'Join Now' on our homepage and complete the registration process. You'll get access to exclusive training, marketing materials, and earning opportunities!",
  "support": "I'll connect you with our support team right away. Please hold while I transfer you to an available agent.",
  "default": "Thanks for your message! I'm here to help. You can ask me about orders, commissions, becoming a distributor, or any other questions. For complex issues, I can connect you with our support team.",
};

export default function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [agentConnected, setAgentConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: "greeting",
        content: `Hi${user?.name ? ` ${user.name}` : ""}! 👋 Welcome to NEON Energy support. How can I help you today?`,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
  }, [isOpen, user?.name]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(m => m.id === userMessage.id ? { ...m, status: "sent" } : m)
      );
    }, 500);

    // Bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      
      // Find matching response
      const lowerContent = inputValue.toLowerCase();
      let responseKey = "default";
      
      if (lowerContent.includes("order") || lowerContent.includes("track")) {
        responseKey = "order";
      } else if (lowerContent.includes("account") || lowerContent.includes("login") || lowerContent.includes("password")) {
        responseKey = "account";
      } else if (lowerContent.includes("commission") || lowerContent.includes("earn") || lowerContent.includes("money")) {
        responseKey = "commission";
      } else if (lowerContent.includes("distributor") || lowerContent.includes("join") || lowerContent.includes("sign up")) {
        responseKey = "distributor";
      } else if (lowerContent.includes("support") || lowerContent.includes("agent") || lowerContent.includes("human") || lowerContent.includes("help")) {
        responseKey = "support";
        // Simulate agent connection
        setTimeout(() => {
          setAgentConnected(true);
          const agentMessage: Message = {
            id: Date.now().toString(),
            content: "Hi! I'm Sarah from the NEON Energy support team. I'm here to help you. What can I assist you with today?",
            sender: "agent",
            timestamp: new Date(),
            agentName: "Sarah",
            agentAvatar: "",
          };
          setMessages(prev => [...prev, agentMessage]);
        }, 2000);
      }

      const botResponse: Message = {
        id: Date.now().toString(),
        content: BOT_RESPONSES[responseKey],
        sender: agentConnected ? "agent" : "bot",
        timestamp: new Date(),
        agentName: agentConnected ? "Sarah" : undefined,
      };

      setMessages(prev => [...prev, botResponse]);
    }, 1500);
  };

  const handleQuickReply = (reply: QuickReply) => {
    setInputValue(reply.text);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setUnreadCount(0);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const getUserType = () => {
    if (!user) return "Guest";
    if (user.role === "admin") return "Admin";
    return "Customer";
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "500px"
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[380px] bg-background border rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              "max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-10 h-10 border-2 border-white/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary-foreground/20">
                      {agentConnected ? "SA" : <Bot className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {agentConnected ? "Sarah - Support" : "NEON Support"}
                  </p>
                  <p className="text-xs opacity-80">
                    {agentConnected ? "Online" : "AI Assistant"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-white/10"
                  onClick={toggleChat}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* User Type Badge */}
                <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Typically replies in minutes</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getUserType()}
                  </Badge>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-2",
                          message.sender === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {message.sender !== "user" && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarFallback className={cn(
                              "text-xs",
                              message.sender === "bot" ? "bg-primary/20" : "bg-green-500/20"
                            )}>
                              {message.sender === "bot" ? <Bot className="w-4 h-4" /> : message.agentName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn(
                          "max-w-[75%] rounded-2xl px-4 py-2",
                          message.sender === "user" 
                            ? "bg-primary text-primary-foreground rounded-br-sm" 
                            : "bg-muted rounded-bl-sm"
                        )}>
                          {message.agentName && message.sender === "agent" && (
                            <p className="text-xs font-semibold mb-1 text-green-600">
                              {message.agentName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            message.sender === "user" ? "justify-end" : "justify-start"
                          )}>
                            <span className="text-[10px] opacity-60">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {message.sender === "user" && message.status && (
                              <CheckCheck className={cn(
                                "w-3 h-3",
                                message.status === "read" ? "text-blue-400" : "opacity-60"
                              )} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-primary/20">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                {messages.length <= 2 && (
                  <div className="px-4 py-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_REPLIES.slice(0, 3).map((reply) => (
                        <button
                          key={reply.id}
                          onClick={() => handleQuickReply(reply)}
                          className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
                        >
                          {reply.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t bg-background">
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 flex-shrink-0"
                    >
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      className="h-9 w-9 rounded-full flex-shrink-0"
                      disabled={!inputValue.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
