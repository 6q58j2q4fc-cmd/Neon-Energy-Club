import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles, ExternalLink, Phone, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import { Streamdown } from "streamdown";

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

// Quick action buttons for sales
const quickActions = [
  { id: "preorder", label: "Pre-Order Now", emoji: "🛒", link: "/shop" },
  { id: "franchise", label: "Franchise Info", emoji: "🏪", link: "/franchise" },
  { id: "invest", label: "Invest", emoji: "💰", link: "/investors" },
  { id: "nft", label: "NFT Gallery", emoji: "🎨", link: "/nft-gallery" },
];

// Promo codes for the chatbot to offer
const promoCodes = [
  { code: "NEON10", discount: "10% off", minOrder: "$50" },
  { code: "FIRSTORDER", discount: "15% off first order", minOrder: "None" },
  { code: "FRANCHISE25", discount: "$25 off franchise deposit", minOrder: "$500" },
];

export function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { language, t } = useLanguage();

  // Chat mutation
  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.message
      }]);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: getErrorMessage()
      }]);
      setIsLoading(false);
    }
  });

  // Get welcome message based on language
  const getWelcomeMessage = () => {
    const welcomeMessages: Record<string, string> = {
      en: "👋 Welcome to NEON Energy! I'm here to help you with pre-orders, franchise opportunities, NFTs, and more. How can I assist you today?",
      es: "👋 ¡Bienvenido a NEON Energy! Estoy aquí para ayudarte con pre-pedidos, oportunidades de franquicia, NFTs y más. ¿Cómo puedo ayudarte hoy?",
      fr: "👋 Bienvenue chez NEON Energy! Je suis là pour vous aider avec les pré-commandes, les opportunités de franchise, les NFTs et plus encore. Comment puis-je vous aider aujourd'hui?",
      de: "👋 Willkommen bei NEON Energy! Ich bin hier, um Ihnen bei Vorbestellungen, Franchise-Möglichkeiten, NFTs und mehr zu helfen. Wie kann ich Ihnen heute helfen?",
      it: "👋 Benvenuto in NEON Energy! Sono qui per aiutarti con pre-ordini, opportunità di franchising, NFT e altro. Come posso aiutarti oggi?",
      zh: "👋 欢迎来到NEON Energy！我在这里帮助您处理预订、加盟机会、NFT等。今天我能帮您什么？",
      ja: "👋 NEON Energyへようこそ！予約注文、フランチャイズ機会、NFTなどについてお手伝いします。今日はどのようなご用件でしょうか？",
    };
    return welcomeMessages[language] || welcomeMessages.en;
  };

  const getErrorMessage = () => {
    const errorMessages: Record<string, string> = {
      en: "Sorry, I'm having trouble connecting. Please try again or contact us directly.",
      es: "Lo siento, tengo problemas para conectarme. Por favor, inténtalo de nuevo o contáctanos directamente.",
      fr: "Désolé, j'ai des difficultés à me connecter. Veuillez réessayer ou nous contacter directement.",
      de: "Entschuldigung, ich habe Verbindungsprobleme. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.",
      it: "Mi dispiace, ho problemi di connessione. Per favore riprova o contattaci direttamente.",
      zh: "抱歉，我连接有问题。请重试或直接联系我们。",
      ja: "申し訳ありません、接続に問題があります。もう一度お試しいただくか、直接お問い合わせください。",
    };
    return errorMessages[language] || errorMessages.en;
  };

  // Initialize with welcome message when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: getWelcomeMessage()
      }]);
    }
  }, [isOpen, language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Send to backend with language context
    chatMutation.mutate({
      message: userMessage,
      language: language,
      context: "sales" // Tell the backend this is a sales-focused chat
    });
  };

  const handleQuickAction = (link: string) => {
    window.location.href = link;
    setIsOpen(false);
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full
          flex items-center justify-center
          transition-all duration-300 shadow-lg
          ${isOpen 
            ? "bg-red-500 hover:bg-red-600 rotate-0" 
            : "bg-gradient-to-r from-[#c8ff00] to-[#00ffff] hover:scale-110"
          }
        `}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-black" />
        )}
        
        {/* Notification pulse */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff0080] rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-[#0d1a0d] border-2 border-[#c8ff00] rounded-2xl shadow-2xl shadow-[#c8ff00]/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0d2818] to-[#1a3a2a] p-4 border-b border-[#c8ff00]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#c8ff00] to-[#00ffff] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-white">NEON Assistant</h3>
                <p className="text-xs text-[#c8ff00]">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 border-b border-white/10 bg-black/30">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action.link)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#c8ff00]/20 border border-white/20 hover:border-[#c8ff00]/50 transition-all text-xs text-white flex items-center gap-1.5"
                >
                  <span>{action.emoji}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="h-[300px] overflow-y-auto p-4 space-y-4">
            {messages.filter(m => m.role !== "system").map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[85%] rounded-2xl px-4 py-2.5 text-sm
                    ${msg.role === "user"
                      ? "bg-[#c8ff00] text-black rounded-br-sm"
                      : "bg-white/10 text-white rounded-bl-sm"
                    }
                  `}
                >
                  {msg.role === "assistant" ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
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

          {/* Promo Codes Section */}
          <div className="px-4 py-2 border-t border-white/10 bg-black/30">
            <p className="text-xs text-white/60 mb-2">🎁 Available promo codes:</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {promoCodes.map(promo => (
                <button
                  key={promo.code}
                  onClick={() => copyPromoCode(promo.code)}
                  className="flex-shrink-0 px-2 py-1 rounded bg-[#ff0080]/20 border border-[#ff0080]/30 hover:bg-[#ff0080]/30 transition-all text-xs flex items-center gap-1"
                >
                  <span className="text-[#ff0080] font-mono font-bold">{promo.code}</span>
                  {copiedCode === promo.code ? (
                    <Check className="w-3 h-3 text-[#c8ff00]" />
                  ) : (
                    <Copy className="w-3 h-3 text-white/50" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-[#0a1a0a]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t("chat.placeholder")}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-[#c8ff00]/50"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-white/40 mt-2 text-center">
              Powered by AI • Available 24/7 in multiple languages
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingChatBot;
