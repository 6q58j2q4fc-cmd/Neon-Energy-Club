import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, X, Send, Sparkles, Bot, User,
  GraduationCap, ShoppingCart, HelpCircle, BookOpen,
  Phone, ChevronDown, Loader2,
  Minimize2, Maximize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

type ChatMode = "general" | "sales" | "support" | "training" | "tutorial";

const CHAT_MODES = [
  { id: "general" as ChatMode, label: "General Help", icon: HelpCircle, color: "from-blue-500 to-cyan-500" },
  { id: "sales" as ChatMode, label: "Sales Training", icon: ShoppingCart, color: "from-green-500 to-emerald-500" },
  { id: "support" as ChatMode, label: "Customer Support", icon: Phone, color: "from-purple-500 to-pink-500" },
  { id: "training" as ChatMode, label: "Distributor Training", icon: GraduationCap, color: "from-orange-500 to-yellow-500" },
  { id: "tutorial" as ChatMode, label: "Website Tutorial", icon: BookOpen, color: "from-red-500 to-rose-500" },
];

const MODE_SYSTEM_PROMPTS: Record<ChatMode, string> = {
  general: "You are a helpful NEON Energy assistant. Help users with any questions about the product, company, or website.",
  sales: `You are a SALES TRAINING coach for NEON Energy distributors. Teach them:
- How to approach prospects and overcome objections
- The NEON product benefits and unique selling points
- Closing techniques and follow-up strategies
- Building rapport and trust with customers
- Handling price objections
- Creating urgency without being pushy
Always provide specific scripts and examples they can use.`,
  support: `You are a CUSTOMER SUPPORT specialist for NEON Energy. Help users with:
- Order tracking and shipping questions
- Product information and ingredients
- Account and login issues
- Refund and return policies
- Technical website issues
Be empathetic, professional, and solution-oriented.`,
  training: `You are a DISTRIBUTOR TRAINING coach for NEON Energy MLM. Teach them:
- How the compensation plan works (binary, matching bonuses, fast-start)
- Rank advancement strategies
- Team building and recruitment
- How to maximize commissions
- Using the distributor portal effectively
- Best practices from top earners
Provide actionable advice and real examples.`,
  tutorial: `You are a WEBSITE TUTORIAL guide for NEON Energy. Help users navigate:
- How to create an account and log in
- How to place orders and use promo codes
- How to become a distributor
- How to use the distributor portal
- How to track commissions and payouts
- How to manage autoship subscriptions
- How to apply for franchise/vending opportunities
Provide step-by-step instructions with specific button names and locations.`,
};

const QUICK_ACTIONS: Record<ChatMode, { text: string; emoji: string }[]> = {
  general: [
    { text: "What is NEON Energy?", emoji: "⚡" },
    { text: "How do I order?", emoji: "🛒" },
    { text: "Become a distributor", emoji: "💼" },
    { text: "Contact support", emoji: "📞" },
  ],
  sales: [
    { text: "How to handle price objections?", emoji: "💰" },
    { text: "Best opening lines for prospects", emoji: "👋" },
    { text: "How to close a sale?", emoji: "🎯" },
    { text: "Follow-up strategies", emoji: "📱" },
  ],
  support: [
    { text: "Track my order", emoji: "📦" },
    { text: "Request a refund", emoji: "💳" },
    { text: "Account login help", emoji: "🔐" },
    { text: "Product ingredients", emoji: "🧪" },
  ],
  training: [
    { text: "Explain the comp plan", emoji: "📊" },
    { text: "How to advance ranks?", emoji: "🏆" },
    { text: "Team building tips", emoji: "👥" },
    { text: "Maximize my commissions", emoji: "💵" },
  ],
  tutorial: [
    { text: "How to place an order?", emoji: "🛒" },
    { text: "How to use distributor portal?", emoji: "📱" },
    { text: "How to track commissions?", emoji: "💰" },
    { text: "How to set up autoship?", emoji: "🔄" },
  ],
};



export default function UnifiedChatBot() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mode, setMode] = useState<ChatMode>("general");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: response.message,
        timestamp: new Date().toISOString().toISOString(),
      }]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        timestamp: new Date().toISOString().toISOString(),
      }]);
      setIsLoading(false);
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Add welcome message when chat opens or mode changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addWelcomeMessage();
    }
  }, [isOpen]);

  const addWelcomeMessage = () => {
    const modeInfo = CHAT_MODES.find(m => m.id === mode);
    const welcomeContent = mode === "general" 
      ? `👋 Welcome to NEON Energy! I'm your AI assistant. How can I help you today?\n\nYou can switch between different modes using the dropdown above:\n• **Sales Training** - Learn selling techniques\n• **Customer Support** - Get help with orders\n• **Distributor Training** - Learn the business\n• **Website Tutorial** - Navigate the site`
      : `👋 Welcome to **${modeInfo?.label}** mode!\n\nI'm here to help you with ${
          mode === "sales" ? "sales techniques, scripts, and closing strategies" :
          mode === "support" ? "orders, refunds, and account issues" :
          mode === "training" ? "the compensation plan, rank advancement, and team building" :
          "navigating the NEON Energy website step by step"
        }.\n\nAsk me anything or use the quick actions below!`;

    setMessages([{
      id: "welcome",
      role: "assistant",
      content: welcomeContent,
      timestamp: new Date().toISOString().toISOString(),
    }]);
  };

  const handleModeChange = (newMode: ChatMode) => {
    setMode(newMode);
    setShowModeSelector(false);
    setMessages([]);
    setTimeout(() => addWelcomeMessage(), 100);
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString().toISOString(),
    }]);
    setIsLoading(true);

    chatMutation.mutate({
      message: userMessage,
      language: language,
      context: mode,
      systemPrompt: MODE_SYSTEM_PROMPTS[mode],
    });
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentMode = CHAT_MODES.find(m => m.id === mode)!;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-[#c8ff00] to-[#00ffff] text-black shadow-lg flex items-center justify-center hover:shadow-[0_0_20px_rgba(200,255,0,0.5)] transition-all"
            aria-label="Open chat"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0080] rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-20 md:bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              isMinimized ? "h-auto" : "h-[600px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className={cn(
              "p-4 flex items-center justify-between bg-gradient-to-r",
              currentMode.color
            )}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">NEON AI Assistant</p>
                  <button
                    onClick={() => setShowModeSelector(!showModeSelector)}
                    className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
                  >
                    <currentMode.icon className="w-3 h-3" />
                    {currentMode.label}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", showModeSelector && "rotate-180")} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mode Selector Dropdown */}
            <AnimatePresence>
              {showModeSelector && !isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 bg-black/50 overflow-hidden"
                >
                  <div className="p-2 grid grid-cols-2 gap-2">
                    {CHAT_MODES.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleModeChange(m.id)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg text-xs transition-all",
                          mode === m.id 
                            ? "bg-white/20 text-white" 
                            : "text-white/60 hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <m.icon className="w-4 h-4" />
                        {m.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex gap-2",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {msg.role !== "user" && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c8ff00] to-[#00ffff] flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-black" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                            msg.role === "user"
                              ? "bg-[#c8ff00] text-black rounded-br-sm"
                              : "bg-white/10 text-white rounded-bl-sm"
                          )}
                        >
                          {msg.role === "assistant" ? (
                            <Streamdown>{msg.content}</Streamdown>
                          ) : (
                            msg.content
                          )}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {isLoading && (
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#c8ff00] to-[#00ffff] flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-black" />
                        </div>
                        <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-2 h-2 bg-[#c8ff00] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                  <div className="px-4 py-2 border-t border-white/10">
                    <p className="text-xs text-white/50 mb-2">Quick actions:</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_ACTIONS[mode].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.text)}
                          className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 hover:text-white transition-all flex items-center gap-1"
                        >
                          <span>{action.emoji}</span>
                          <span>{action.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Promo Codes (only in sales/general mode) */}
                {(mode === "general" || mode === "sales") && (
                  <div className="px-4 py-2 border-t border-white/10 bg-black/30">
                    <p className="text-xs text-white/50 mb-2">🛒 Quick Order:</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      <a
                        href="/neon-original"
                        className="flex-shrink-0 px-3 py-2 rounded bg-[#c8ff00]/20 border border-[#c8ff00]/30 hover:bg-[#c8ff00]/30 transition-all text-xs flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#c8ff00]" />
                        <span className="text-[#c8ff00] font-bold">NEON Original</span>
                      </a>
                      <a
                        href="/neon-pink"
                        className="flex-shrink-0 px-3 py-2 rounded bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/30 transition-all text-xs flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3 h-3 text-pink-400" />
                        <span className="text-pink-400 font-bold">NEON Pink</span>
                      </a>
                      <a
                        href="/preorder"
                        className="flex-shrink-0 px-3 py-2 rounded bg-[#ff0080]/20 border border-[#ff0080]/30 hover:bg-[#ff0080]/30 transition-all text-xs flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3 h-3 text-[#ff0080]" />
                        <span className="text-[#ff0080] font-bold">Pre-Order Now</span>
                      </a>
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-3 border-t border-white/10 bg-[#0a0a0a]">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                  <p className="text-[10px] text-white/40 mt-2 text-center">
                    Powered by AI • {currentMode.label} Mode
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
