import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Gift, Users, Sparkles, Check, ArrowRight, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Storage keys for popup frequency limiting
const STORAGE_KEYS = {
  SUBSCRIBED: "neon_newsletter_subscribed",
  DISMISSED_COUNT: "neon_popup_dismissed_count",
  LAST_SHOWN: "neon_popup_last_shown",
  SESSION_SHOWN: "neon_popup_session_shown",
};

// Check if user should see the popup
export function shouldShowPopup(): boolean {
  // Never show if already subscribed
  if (localStorage.getItem(STORAGE_KEYS.SUBSCRIBED) === "true") {
    return false;
  }

  // Only show once per session
  if (sessionStorage.getItem(STORAGE_KEYS.SESSION_SHOWN) === "true") {
    return false;
  }

  // Check weekly limit (max 3 times per week)
  const dismissedCount = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISSED_COUNT) || "0", 10);
  const lastShown = parseInt(localStorage.getItem(STORAGE_KEYS.LAST_SHOWN) || "0", 10);
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;

  // Reset counter if more than a week has passed
  if (now - lastShown > oneWeek) {
    localStorage.setItem(STORAGE_KEYS.DISMISSED_COUNT, "0");
    return true;
  }

  // Don't show if dismissed 3+ times this week
  if (dismissedCount >= 3) {
    return false;
  }

  return true;
}

// Mark popup as shown for this session
export function markPopupShown(): void {
  sessionStorage.setItem(STORAGE_KEYS.SESSION_SHOWN, "true");
  localStorage.setItem(STORAGE_KEYS.LAST_SHOWN, Date.now().toString());
}

// Mark popup as dismissed (user clicked "No thanks" or X)
export function markPopupDismissed(): void {
  const count = parseInt(localStorage.getItem(STORAGE_KEYS.DISMISSED_COUNT) || "0", 10);
  localStorage.setItem(STORAGE_KEYS.DISMISSED_COUNT, (count + 1).toString());
}

// Mark user as subscribed (never show popup again)
export function markAsSubscribed(): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIBED, "true");
}

interface ViralNewsletterPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function ViralNewsletterPopup({ open, onClose }: ViralNewsletterPopupProps) {
  const [step, setStep] = useState<"email" | "friends" | "success">("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [friendEmails, setFriendEmails] = useState(["", "", ""]);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  const subscribeNewsletter = trpc.newsletter.subscribe.useMutation();
  const addReferrals = trpc.newsletter.addReferrals.useMutation();

  // Mark popup as shown when it opens
  useEffect(() => {
    if (open) {
      markPopupShown();
    }
  }, [open]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await subscribeNewsletter.mutateAsync({ email, name });
      setSubscriptionId(result.id);
      markAsSubscribed(); // Mark as subscribed so popup never shows again
      toast.success("🎉 You've unlocked 10% OFF your first order!");
      setStep("friends");
    } catch (error: any) {
      toast.error(error.message || "Failed to subscribe");
    }
  };

  const handleFriendsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEmails = friendEmails.filter(e => e.trim() && e.includes("@"));
    
    if (validEmails.length === 0) {
      setStep("success");
      return;
    }

    if (validEmails.length < 3) {
      toast.error("Please enter all 3 friend emails to unlock the bonus discount");
      return;
    }

    try {
      await addReferrals.mutateAsync({
        subscriptionId: subscriptionId!,
        friendEmails: validEmails,
      });
      toast.success("🔥 BONUS UNLOCKED! You've earned 25% OFF your first case!");
      setStep("success");
    } catch (error: any) {
      toast.error(error.message || "Failed to add referrals");
    }
  };

  const handleSkip = () => {
    setStep("success");
  };

  const handleDismiss = () => {
    markPopupDismissed();
    handleClose();
  };

  const handleClose = () => {
    setEmail("");
    setName("");
    setFriendEmails(["", "", ""]);
    setStep("email");
    setSubscriptionId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleDismiss(); }}>
      <DialogContent 
        className="sm:max-w-[600px] max-w-[95vw] bg-black border-2 border-[#c8ff00] p-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={handleDismiss}
        showCloseButton={false}
      >
        {/* Close Button - Always visible and clickable */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 z-50 rounded-full p-2 bg-black/50 hover:bg-[#c8ff00]/20 transition-colors border border-[#c8ff00]/30"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-[#c8ff00]" />
        </button>

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,255,0,0.1),transparent_50%)]"></div>

        <div className="relative z-10 p-6 sm:p-8">
          {/* Step 1: Email Signup */}
          {step === "email" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c8ff00]/20 mb-3 neon-glow">
                  <Gift className="w-7 h-7 sm:w-8 sm:h-8 text-[#c8ff00]" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-white mb-2">
                  GET <span className="text-[#c8ff00] neon-text">10% OFF</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base sm:text-lg">
                  Join our exclusive launch list and save on your first order
                </DialogDescription>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] h-12"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={subscribeNewsletter.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold h-12 text-lg neon-pulse"
                >
                  {subscribeNewsletter.isPending ? "Subscribing..." : "Claim My 10% Discount"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>

              {/* No Thanks Link */}
              <div className="text-center space-y-2">
                <button
                  onClick={handleDismiss}
                  className="text-gray-500 hover:text-gray-300 text-sm underline underline-offset-2 transition-colors"
                >
                  No thanks, I'll pay full price
                </button>
                <p className="text-xs text-gray-600">No spam, ever. Unsubscribe anytime.</p>
              </div>
            </div>
          )}

          {/* Step 2: Friend Referrals */}
          {step === "friends" && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#c8ff00]/20 mb-3 neon-glow animate-pulse">
                  <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#c8ff00]" />
                </div>
                <DialogTitle className="text-2xl sm:text-3xl font-black text-white mb-2">
                  UNLOCK <span className="text-[#c8ff00] neon-text">25% OFF!</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base sm:text-lg">
                  Refer 3 friends and upgrade your discount to 25% off your first case
                </DialogDescription>
              </div>

              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-3 sm:p-4 mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-[#c8ff00] flex-shrink-0" />
                  <span className="text-white font-semibold text-sm sm:text-base">Current Discount: 10% OFF</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Users className="w-5 h-5 text-[#c8ff00] flex-shrink-0" />
                  <span className="text-sm sm:text-base">Refer 3 friends → Upgrade to 25% OFF</span>
                </div>
              </div>

              <form onSubmit={handleFriendsSubmit} className="space-y-3">
                <div className="space-y-2">
                  {friendEmails.map((email, index) => (
                    <div key={index}>
                      <Input
                        type="email"
                        placeholder={`Friend ${index + 1} email`}
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...friendEmails];
                          newEmails[index] = e.target.value;
                          setFriendEmails(newEmails);
                        }}
                        className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] h-11"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 border-[#c8ff00]/30 text-white hover:bg-[#c8ff00]/10 h-11"
                  >
                    Skip
                  </Button>
                  <Button
                    type="submit"
                    disabled={addReferrals.isPending}
                    className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold h-11 neon-pulse"
                  >
                    {addReferrals.isPending ? "..." : "Unlock 25%"}
                    <Sparkles className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </form>

              <div className="text-center text-xs text-gray-500">
                Your friends will receive their own 10% discount too!
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-5 text-center py-4 sm:py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#c8ff00]/20 mb-3 neon-glow animate-bounce">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-[#c8ff00]" />
              </div>
              
              <div>
                <DialogTitle className="text-3xl sm:text-4xl font-black text-white mb-2">
                  YOU'RE <span className="text-[#c8ff00] neon-text">ALL SET!</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base sm:text-lg">
                  Check your email for your exclusive discount code
                </DialogDescription>
              </div>

              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4 sm:p-6">
                <div className="text-4xl sm:text-5xl font-black text-[#c8ff00] neon-text mb-2">
                  {friendEmails.filter(e => e.trim()).length >= 3 ? "25%" : "10%"} OFF
                </div>
                <div className="text-white font-semibold mb-1">Your First Case</div>
                <div className="text-gray-400 text-sm">Code sent to {email}</div>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold h-12 text-lg"
              >
                Start Shopping
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="text-xs text-gray-500">
                We'll send you exclusive updates about the NEON relaunch
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
