import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Check, Star, Zap, Crown, Gift, ArrowLeft, TrendingUp, Users, Clock } from "lucide-react";
import HamburgerHeader from "@/components/HamburgerHeader";

// Reward tiers
const rewardTiers = [
  {
    id: "supporter",
    name: "SUPPORTER",
    amount: 25,
    icon: Gift,
    popular: false,
    rewards: [
      "1 Limited Edition Can",
      "Digital Thank You Card",
      "Campaign Updates",
      "Backer Badge",
    ],
  },
  {
    id: "energizer",
    name: "ENERGIZER",
    amount: 100,
    icon: Zap,
    popular: true,
    rewards: [
      "1 Case (24 Cans)",
      "Limited Edition T-Shirt",
      "Exclusive Poster",
      "VIP Backer Status",
      "Early Access to Products",
    ],
  },
  {
    id: "vip",
    name: "VIP INSIDER",
    amount: 500,
    icon: Star,
    popular: false,
    rewards: [
      "5 Cases (120 Cans)",
      "Limited Edition Merchandise Pack",
      "Your Name on Website",
      "Exclusive Virtual Event Access",
      "Lifetime 20% Discount",
    ],
  },
  {
    id: "founder",
    name: "FOUNDING MEMBER",
    amount: 2500,
    icon: Crown,
    popular: false,
    rewards: [
      "25 Cases (600 Cans)",
      "Complete Merchandise Collection",
      "Founding Member Plaque",
      "Private Launch Party Invite",
      "Lifetime VIP Status",
      "Direct Line to Founders",
    ],
  },
];

export default function Crowdfund() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const submitMutation = trpc.crowdfunding.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your contribution! You'll receive a confirmation email shortly.");
      setLocation("/");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process contribution");
    },
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const selectedTierData = rewardTiers.find((t) => t.id === selectedTier);
  const finalAmount = selectedTierData?.amount || customAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTier && customAmount < 1) {
      toast.error("Please select a reward tier or enter a custom amount");
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Please fill in your name and email");
      return;
    }

    submitMutation.mutate({
      name: formData.name,
      email: formData.email,
      amount: finalAmount,
      rewardTier: selectedTierData?.name || "Custom",
      message: formData.message || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0620] via-[#1a0a2e] to-[#0d0620] text-white relative overflow-hidden">
      {/* Background Graphics */}
      <div className="synthwave-grid-bg" />
      <div className="floating-neon-orb green w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-neon-orb pink w-80 h-80 top-1/3 -right-40" style={{ animationDelay: '-5s' }} />
      <div className="floating-neon-orb cyan w-72 h-72 bottom-1/4 -left-36" style={{ animationDelay: '-10s' }} />
      
      {/* Decorative Palm Trees */}
      <img src="/neon-palm-tree.png" alt="" className="palm-tree-left hidden lg:block" />
      <img src="/neon-palm-tree.png" alt="" className="palm-tree-right hidden lg:block" />
      
      <HamburgerHeader variant="default" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative z-10">
        <div className={`container mx-auto max-w-6xl ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-[#c8ff00] mb-8 transition-smooth"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-7xl font-black mb-6">
              BACK THE <span className="text-[#c8ff00] neon-text">RELAUNCH</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of backers bringing NEON back. Choose your reward tier and be part of energy drink history.
            </p>
          </div>

          {/* Campaign Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-xl p-6 text-center neon-border hover-lift">
              <TrendingUp className="w-8 h-8 text-[#c8ff00] mx-auto mb-2 neon-glow" />
              <div className="text-3xl font-black text-[#c8ff00]">$487,350</div>
              <div className="text-sm text-gray-400">Raised</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-xl p-6 text-center neon-border hover-lift">
              <Users className="w-8 h-8 text-[#c8ff00] mx-auto mb-2 neon-glow" />
              <div className="text-3xl font-black text-[#c8ff00]">2,847</div>
              <div className="text-sm text-gray-400">Backers</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-xl p-6 text-center neon-border hover-lift">
              <Clock className="w-8 h-8 text-[#c8ff00] mx-auto mb-2 neon-glow" />
              <div className="text-3xl font-black text-[#c8ff00]">48%</div>
              <div className="text-sm text-gray-400">Funded</div>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-xl p-6 text-center neon-border hover-lift">
              <Star className="w-8 h-8 text-[#c8ff00] mx-auto mb-2 neon-glow" />
              <div className="text-3xl font-black text-[#c8ff00]">90</div>
              <div className="text-sm text-gray-400">Days Left</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-[#0a0a0a] animated-bg">
        <div className="container mx-auto max-w-7xl">
          <h3 className="text-3xl font-black text-center mb-8">
            SELECT YOUR <span className="text-[#c8ff00] neon-text">REWARD</span>
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {rewardTiers.map((tier, index) => {
              const Icon = tier.icon;
              const isSelected = selectedTier === tier.id;
              
              return (
                <Card
                  key={tier.id}
                  onClick={() => {
                    setSelectedTier(tier.id);
                    setCustomAmount(0);
                  }}
                  className={`bg-[#0a0a0a] border-2 cursor-pointer transition-all duration-300 hover-lift relative overflow-hidden animate-fade-in-up stagger-${index + 1} ${
                    isSelected
                      ? "border-[#c8ff00] neon-border scale-105"
                      : "border-[#c8ff00]/20 hover:border-[#c8ff00]/50"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-1 -right-1 bg-[#c8ff00] text-black px-3 py-1 text-xs font-bold rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-10 h-10 ${isSelected ? 'text-[#c8ff00] neon-glow' : 'text-[#c8ff00]/60'}`} />
                      {isSelected && <Check className="w-6 h-6 text-[#c8ff00]" />}
                    </div>
                    <CardTitle className="text-xl font-bold text-[#c8ff00]">{tier.name}</CardTitle>
                    <CardDescription className="text-4xl font-black text-white">${tier.amount}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.rewards.map((reward, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                          <span>{reward}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Custom Amount */}
          <Card className="bg-[#0a0a0a] border-[#c8ff00]/20 neon-border max-w-md mx-auto mb-12">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Or Enter Custom Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-[#c8ff00]">$</span>
                <Input
                  type="number"
                  min="1"
                  value={customAmount || ""}
                  onChange={(e) => {
                    setCustomAmount(parseInt(e.target.value) || 0);
                    setSelectedTier(null);
                  }}
                  placeholder="Enter amount"
                  className="bg-black border-[#c8ff00]/30 text-white text-xl font-bold"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contribution Form */}
      <section className="py-12 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-2xl">
          <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#c8ff00]">Complete Your Contribution</CardTitle>
              <CardDescription className="text-gray-400">
                {selectedTierData
                  ? `${selectedTierData.name} tier - $${selectedTierData.amount}`
                  : customAmount > 0
                  ? `Custom amount - $${customAmount}`
                  : "Select a tier or enter a custom amount above"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="bg-black border-[#c8ff00]/30 text-white focus:border-[#c8ff00]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="bg-black border-[#c8ff00]/30 text-white min-h-[100px] focus:border-[#c8ff00]"
                    placeholder="Leave a message for the NEON team..."
                  />
                </div>

                {/* Summary */}
                {(selectedTierData || customAmount > 0) && (
                  <div className="p-6 bg-black rounded-lg border border-[#c8ff00]/20 space-y-3">
                    <div className="font-bold text-[#c8ff00] mb-3">Contribution Summary</div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tier:</span>
                      <span className="text-white font-semibold">{selectedTierData?.name || "Custom"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-[#c8ff00] font-bold text-2xl">${finalAmount}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={(!selectedTier && customAmount < 1) || submitMutation.isPending}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-lg py-6 neon-pulse disabled:opacity-50"
                >
                  {submitMutation.isPending ? "Processing..." : `Contribute $${finalAmount}`}
                </Button>

                <p className="text-center text-sm text-gray-500">
                  Stripe payment integration coming soon. Your contribution will be recorded and you'll be contacted for payment.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
