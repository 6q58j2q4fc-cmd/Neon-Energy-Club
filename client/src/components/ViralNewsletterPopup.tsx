import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Gift, Users, Sparkles, Check, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !name) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await subscribeNewsletter.mutateAsync({ email, name });
      setSubscriptionId(result.id);
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

  const handleClose = () => {
    setEmail("");
    setName("");
    setFriendEmails(["", "", ""]);
    setStep("email");
    setSubscriptionId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-black border-2 border-[#c8ff00] p-0 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black opacity-95"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(200,255,0,0.1),transparent_50%)]"></div>

        <div className="relative z-10 p-8">
          {/* Step 1: Email Signup */}
          {step === "email" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8ff00]/20 mb-4 neon-glow">
                  <Gift className="w-8 h-8 text-[#c8ff00]" />
                </div>
                <DialogTitle className="text-3xl font-black text-white mb-2">
                  GET <span className="text-[#c8ff00] neon-text">10% OFF</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-lg">
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

              <div className="text-center text-sm text-gray-500">
                No spam, ever. Unsubscribe anytime.
              </div>
            </div>
          )}

          {/* Step 2: Friend Referrals */}
          {step === "friends" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8ff00]/20 mb-4 neon-glow animate-pulse">
                  <Sparkles className="w-8 h-8 text-[#c8ff00]" />
                </div>
                <DialogTitle className="text-3xl font-black text-white mb-2">
                  UNLOCK <span className="text-[#c8ff00] neon-text">25% OFF!</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-lg">
                  Refer 3 friends and upgrade your discount to 25% off your first case
                </DialogDescription>
              </div>

              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-white font-semibold">Current Discount: 10% OFF</span>
                </div>
                <div className="flex items-center gap-3 text-gray-400">
                  <Users className="w-5 h-5 text-[#c8ff00]" />
                  <span>Refer 3 friends → Upgrade to 25% OFF</span>
                </div>
              </div>

              <form onSubmit={handleFriendsSubmit} className="space-y-4">
                <div className="space-y-3">
                  {friendEmails.map((email, index) => (
                    <div key={index} className="space-y-2">
                      <Label htmlFor={`friend-${index}`} className="text-white">
                        Friend {index + 1} Email
                      </Label>
                      <Input
                        id={`friend-${index}`}
                        type="email"
                        placeholder={`friend${index + 1}@example.com`}
                        value={email}
                        onChange={(e) => {
                          const newEmails = [...friendEmails];
                          newEmails[index] = e.target.value;
                          setFriendEmails(newEmails);
                        }}
                        className="bg-[#0a0a0a] border-[#c8ff00]/30 text-white placeholder:text-gray-500 focus:border-[#c8ff00] h-12"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSkip}
                    className="flex-1 border-[#c8ff00]/30 text-white hover:bg-[#c8ff00]/10 h-12"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    type="submit"
                    disabled={addReferrals.isPending}
                    className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold h-12 neon-pulse"
                  >
                    {addReferrals.isPending ? "Sending..." : "Unlock 25% OFF"}
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-500">
                Your friends will receive their own 10% discount too!
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === "success" && (
            <div className="space-y-6 text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#c8ff00]/20 mb-4 neon-glow animate-bounce">
                <Check className="w-10 h-10 text-[#c8ff00]" />
              </div>
              
              <div>
                <DialogTitle className="text-4xl font-black text-white mb-3">
                  YOU'RE <span className="text-[#c8ff00] neon-text">ALL SET!</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-lg">
                  Check your email for your exclusive discount code
                </DialogDescription>
              </div>

              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg p-6">
                <div className="text-5xl font-black text-[#c8ff00] neon-text mb-2">
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

              <div className="text-sm text-gray-500">
                We'll send you exclusive updates about the NEON relaunch
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
