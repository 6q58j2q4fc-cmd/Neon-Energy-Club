import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Gift, 
  Package, 
  Truck, 
  Check, 
  MapPin,
  Phone,
  Mail,
  User,
  Loader2,
  PartyPopper,
  Sparkles,
  Award
} from "lucide-react";

interface DistributorRewardRedemptionProps {
  reward: {
    id: number;
    pointsRedeemed: number;
    earnedMonth: string;
    status: string;
  };
  userInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  onRedeemed?: () => void;
}

export default function DistributorRewardRedemption({ reward, userInfo, onRedeemed }: DistributorRewardRedemptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'shipping' | 'confirm' | 'success'>('shipping');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Shipping form state
  const [shippingInfo, setShippingInfo] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    addressLine1: userInfo?.addressLine1 || '',
    addressLine2: userInfo?.addressLine2 || '',
    city: userInfo?.city || '',
    state: userInfo?.state || '',
    postalCode: userInfo?.postalCode || '',
    country: userInfo?.country || 'USA',
  });

  const redeemMutation = trpc.distributor.redeemFreeRewardWithShipping.useMutation({
    onSuccess: () => {
      setStep('success');
      toast.success("Reward Redeemed!", {
        description: "Your free NEON case is on its way!",
      });
      onRedeemed?.();
    },
    onError: (error: any) => {
      toast.error("Redemption Failed", {
        description: error.message || "Please try again later.",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateShipping = () => {
    const required = ['name', 'email', 'addressLine1', 'city', 'state', 'postalCode', 'country'];
    for (const field of required) {
      if (!shippingInfo[field as keyof typeof shippingInfo]) {
        toast.error("Missing Information", {
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
        });
        return false;
      }
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      toast.error("Invalid Email", {
        description: "Please enter a valid email address.",
      });
      return false;
    }
    return true;
  };

  const handleContinue = () => {
    if (validateShipping()) {
      setStep('confirm');
    }
  };

  const handleRedeem = async () => {
    setIsSubmitting(true);
    redeemMutation.mutate({
      rewardId: reward.id,
      shippingInfo,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reset state after animation
    setTimeout(() => {
      if (step !== 'success') {
        setStep('shipping');
      }
    }, 300);
  };

  // Format month for display
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (reward.status !== 'pending') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-[#c8ff00] to-[#00ff88] hover:opacity-90 text-black font-bold"
      >
        <Gift className="w-4 h-4 mr-2" />
        Claim Reward
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gradient-to-br from-[#0d2818] to-[#1a3a2a] border-[#c8ff00]/30 text-white max-w-lg">
          {step === 'shipping' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#c8ff00]" />
                  Claim Your Distributor Reward
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Enter your shipping address to receive your free 12-pack case of NEON Energy!
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Reward Info */}
                <div className="p-3 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                      <Gift className="w-5 h-5 text-[#c8ff00]" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">3-for-Free Distributor Reward</div>
                      <div className="text-sm text-[#c8ff00]">
                        Earned: {formatMonth(reward.earnedMonth)} • {reward.pointsRedeemed} Points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white/80 flex items-center gap-1">
                      <User className="w-3 h-3" /> Full Name *
                    </Label>
                    <Input
                      value={shippingInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    <Input
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email *
                  </Label>
                  <Input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label className="text-white/80 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Street Address *
                  </Label>
                  <Input
                    value={shippingInfo.addressLine1}
                    onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                    placeholder="123 Main Street"
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Apt, Suite, Unit (Optional)</Label>
                  <Input
                    value={shippingInfo.addressLine2}
                    onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                    placeholder="Apt 4B"
                    className="bg-black/30 border-white/20 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white/80">City *</Label>
                    <Input
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Los Angeles"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">State *</Label>
                    <Input
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="CA"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-white/80">ZIP Code *</Label>
                    <Input
                      value={shippingInfo.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="90001"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Country *</Label>
                    <Input
                      value={shippingInfo.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="USA"
                      className="bg-black/30 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} className="border-white/20 text-white hover:bg-white/10">
                  Cancel
                </Button>
                <Button onClick={handleContinue} className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold">
                  Continue
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'confirm' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                  <Check className="w-6 h-6 text-[#c8ff00]" />
                  Confirm Your Reward
                </DialogTitle>
                <DialogDescription className="text-white/60">
                  Review your shipping details before claiming your free case.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Reward Summary */}
                <div className="p-4 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/20 flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#c8ff00]" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-lg">FREE 12-Pack Case</div>
                      <div className="text-[#c8ff00] font-semibold">
                        3-for-Free Reward • {formatMonth(reward.earnedMonth)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Summary */}
                <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="w-5 h-5 text-[#00ff88]" />
                    <span className="font-semibold text-white">Shipping To:</span>
                  </div>
                  <div className="text-white/80 space-y-1">
                    <div className="font-medium">{shippingInfo.name}</div>
                    <div>{shippingInfo.addressLine1}</div>
                    {shippingInfo.addressLine2 && <div>{shippingInfo.addressLine2}</div>}
                    <div>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</div>
                    <div>{shippingInfo.country}</div>
                    <div className="pt-2 text-sm text-white/60">
                      {shippingInfo.email} • {shippingInfo.phone || 'No phone'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="text-sm text-blue-300">
                    <strong>Estimated Delivery:</strong> 5-7 business days after processing
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setStep('shipping')} className="border-white/20 text-white hover:bg-white/10">
                  Back
                </Button>
                <Button 
                  onClick={handleRedeem} 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-[#c8ff00] to-[#00ff88] hover:opacity-90 text-black font-bold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Claim My Free Case
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === 'success' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black flex items-center gap-2 justify-center">
                  <PartyPopper className="w-8 h-8 text-[#c8ff00]" />
                  Congratulations!
                </DialogTitle>
              </DialogHeader>

              <div className="py-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#c8ff00]/20 to-[#00ff88]/20 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-12 h-12 text-[#c8ff00]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Your Free Case is On Its Way!</h3>
                <p className="text-white/60 mb-6">
                  We've received your redemption request. You'll receive a confirmation email shortly with tracking information.
                </p>
                <div className="p-4 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl inline-block">
                  <div className="text-sm text-white/60 mb-1">Shipping To:</div>
                  <div className="text-white font-medium">{shippingInfo.name}</div>
                  <div className="text-white/80 text-sm">
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}
                  </div>
                </div>
              </div>

              <DialogFooter className="justify-center">
                <Button onClick={handleClose} className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-8">
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
