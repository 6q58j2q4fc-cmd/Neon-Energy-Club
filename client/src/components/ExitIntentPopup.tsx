import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, X, Zap, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const STORAGE_KEY = "neon_exit_popup_shown";

export default function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const newsletterMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("You're in! Check your email for your discount code.");
    },
    onError: (error) => {
      if (error.message.includes("already subscribed")) {
        toast.info("You're already on our list! Check your email for previous codes.");
        setIsOpen(false);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  useEffect(() => {
    // Check if popup was already shown
    const wasShown = sessionStorage.getItem(STORAGE_KEY);
    if (wasShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves toward the top of the page
      if (e.clientY <= 0) {
        setIsOpen(true);
        sessionStorage.setItem(STORAGE_KEY, "true");
        // Remove listener after showing once
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    // Add delay before enabling exit intent
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    newsletterMutation.mutate({ email, name: "" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-br from-[#0a1a1a] to-[#0d2818] border-[#c8ff00]/30 text-white max-w-md">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <>
            <DialogHeader className="text-center pt-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-[#c8ff00]/20 flex items-center justify-center mb-4">
                <Gift className="w-8 h-8 text-[#c8ff00]" />
              </div>
              <DialogTitle className="text-2xl font-black text-white">
                WAIT! DON'T LEAVE EMPTY-HANDED
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <p className="text-center text-white/70">
                Get <span className="text-[#c8ff00] font-bold">15% OFF</span> your first order 
                when you join our VIP list. Plus early access to launches and exclusive deals.
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12"
                  required
                />
                <Button
                  type="submit"
                  disabled={newsletterMutation.isPending}
                  className="w-full bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold h-12 text-lg"
                >
                  {newsletterMutation.isPending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      CLAIM MY 15% DISCOUNT
                    </>
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-white/40">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">YOU'RE IN!</h3>
            <p className="text-white/70 mb-4">
              Check your email for your exclusive 15% discount code.
            </p>
            <Button
              onClick={() => setIsOpen(false)}
              className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold"
            >
              CONTINUE SHOPPING
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
