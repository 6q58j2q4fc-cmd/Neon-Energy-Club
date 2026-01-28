import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function StickyCTABar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 500px
      if (window.scrollY > 500 && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= 500) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a1a1a]/95 via-[#0d2818]/95 to-[#0a1a1a]/95 backdrop-blur-lg border-t border-[#c8ff00]/20 p-3 md:p-4 animate-slide-up">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Left side - Urgency message */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm text-white/80">
            <span className="text-[#c8ff00] font-bold">47 people</span> are viewing this right now
          </span>
        </div>

        {/* Center/Right - CTA */}
        <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
          <Button
            onClick={() => setLocation("/crowdfund")}
            className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-6 h-11 text-sm rounded-lg shadow-[0_0_15px_rgba(200,255,0,0.4)] transition-all"
          >
            <Zap className="w-4 h-4 mr-2" />
            GET NEON NOW
          </Button>
          
          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 text-white/40 hover:text-white/60 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
