import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Check, Truck, Gift, Zap, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import Header from "@/components/Header";
import NavigationHeader from "@/components/NavigationHeader";

interface Package {
  id: string;
  name: string;
  quantity: number;
  price: number;
  autoshipPrice: number;
  discount: number;
  description: string;
  popular?: boolean;
}

const NEON_PACKAGES: Package[] = [
  {
    id: "single",
    name: "Single Can",
    quantity: 1,
    price: 3.99,
    autoshipPrice: 3.39,
    discount: 15,
    description: "Try NEON Energy",
  },
  {
    id: "4pack",
    name: "4-Pack",
    quantity: 4,
    price: 13.99,
    autoshipPrice: 11.89,
    discount: 15,
    description: "Great for trying flavors",
  },
  {
    id: "12pack",
    name: "12-Pack",
    quantity: 12,
    price: 35.99,
    autoshipPrice: 30.59,
    discount: 15,
    description: "Best value",
    popular: true,
  },
  {
    id: "24pack",
    name: "24-Pack",
    quantity: 24,
    price: 59.99,
    autoshipPrice: 50.99,
    discount: 15,
    description: "Stock up and save",
  },
  {
    id: "starter-bundle",
    name: "Starter Bundle",
    quantity: 30,
    price: 79.99,
    autoshipPrice: 67.99,
    discount: 15,
    description: "1 month supply + exclusive merch",
  },
];

export default function PreOrder() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState<Package>(NEON_PACKAGES[2]); // Default to 12-pack
  const [hasAutoship, setHasAutoship] = useState(true);
  const [showAutoshipWarning, setShowAutoshipWarning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const createCheckout = trpc.payment.createCrowdfundingCheckout.useMutation({
    onSuccess: (data: any) => {
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Redirecting to checkout...");
      }
    },
    onError: (error: any) => {
      toast.error("Checkout failed", {
        description: error.message || "Failed to create checkout session",
      });
      setIsProcessing(false);
    },
  });

  const handleAutoshipToggle = (checked: boolean) => {
    if (!checked && hasAutoship) {
      // User is unchecking autoship
      setShowAutoshipWarning(true);
    }
    setHasAutoship(checked);
  };

  const handleCheckout = async () => {
    if (!user) {
      setLocation("/join");
      return;
    }

    setIsProcessing(true);
    try {
      const price = hasAutoship ? selectedPackage.autoshipPrice : selectedPackage.price;
      const quantity = selectedPackage.quantity;

      createCheckout.mutate({
        amount: Math.round(price * 100), // Convert to cents
        tierName: selectedPackage.name,
        name: user.name || "NEON Customer",
        email: user.email || "",
        message: `Pre-order: ${selectedPackage.name} (${quantity} cans) - Auto-ship: ${hasAutoship}`,
      });
    } catch (error) {
      toast.error("Error processing checkout");
      setIsProcessing(false);
    }
  };

  const currentPrice = hasAutoship ? selectedPackage.autoshipPrice : selectedPackage.price;
  const savings = hasAutoship ? (selectedPackage.price - selectedPackage.autoshipPrice).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen vice-bg text-white">
      <Header />
      <NavigationHeader />

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#c8ff00]">
            Pre-Order NEON Energy
          </h1>
          <p className="text-white/70 text-lg">
            Secure your supply of clean, natural energy. Limited pre-order pricing available now.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Package Selection */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-black/40 border-[#c8ff00]/20">
              <CardHeader>
                <CardTitle className="text-[#c8ff00]">Choose Your Package</CardTitle>
                <CardDescription>Select the perfect NEON package for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {NEON_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPackage.id === pkg.id
                        ? "border-[#c8ff00] bg-[#c8ff00]/10"
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{pkg.name}</h3>
                          {pkg.popular && (
                            <Badge className="bg-[#c8ff00] text-black text-xs">POPULAR</Badge>
                          )}
                        </div>
                        <p className="text-sm text-white/60 mb-2">{pkg.description}</p>
                        <p className="text-xs text-white/40">{pkg.quantity} cans total</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-[#c8ff00]">
                          ${pkg.price.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/50">Regular price</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Auto-Ship Section */}
            <Card className="bg-black/40 border-[#c8ff00]/20">
              <CardHeader>
                <CardTitle className="text-[#c8ff00]">Delivery Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20">
                  <Checkbox
                    id="autoship"
                    checked={hasAutoship}
                    onCheckedChange={handleAutoshipToggle}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label htmlFor="autoship" className="cursor-pointer">
                      <div className="font-bold text-white mb-1 flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        Auto-Ship (Recommended)
                      </div>
                      <p className="text-sm text-white/70">
                        Get {selectedPackage.quantity} cans delivered every month. Cancel anytime.
                      </p>
                    </Label>
                  </div>
                </div>

                {hasAutoship && (
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-bold text-green-400 mb-1">
                          Save {selectedPackage.discount}% with Auto-Ship
                        </p>
                        <p className="text-sm text-white/70">
                          You save ${savings} per order compared to regular pricing
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showAutoshipWarning && !hasAutoship && (
                  <Alert className="border-orange-500/50 bg-orange-500/10">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-200 ml-2">
                      You've disabled Auto-Ship. The {selectedPackage.discount}% discount has been removed.
                      Regular pricing now applies to your order.
                    </AlertDescription>
                  </Alert>
                )}

                {!hasAutoship && (
                  <div className="p-4 rounded-lg bg-white/5 border border-white/20">
                    <p className="text-sm text-white/70">
                      <strong>One-time purchase:</strong> Your order will be shipped once. No recurring charges.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-black/40 border-[#c8ff00]/20 sticky top-20">
              <CardHeader>
                <CardTitle className="text-[#c8ff00]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-white/60 text-sm mb-1">Package</p>
                  <p className="font-bold text-white">{selectedPackage.name}</p>
                  <p className="text-xs text-white/50">{selectedPackage.quantity} cans</p>
                </div>

                <div className="border-t border-white/20 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Subtotal</span>
                    <span className="text-white">${selectedPackage.price.toFixed(2)}</span>
                  </div>

                  {hasAutoship && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Auto-Ship Discount</span>
                      <span className="text-green-400">-${savings}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Shipping</span>
                    <span className="text-white">FREE</span>
                  </div>
                </div>

                <div className="border-t border-[#c8ff00]/20 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-white/60">Total</span>
                    <div className="text-right">
                      <p className="text-3xl font-black text-[#c8ff00]">
                        ${currentPrice.toFixed(2)}
                      </p>
                      {hasAutoship && (
                        <p className="text-xs text-green-400">per month</p>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={isProcessing || createCheckout.isPending}
                    className="w-full bg-[#c8ff00] text-black hover:bg-[#b8ef00] font-bold py-6 text-lg"
                  >
                    {isProcessing || createCheckout.isPending ? (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Proceed to Checkout
                      </>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-xs text-white/50 text-center mt-2">
                      You'll need to sign in to complete your order
                    </p>
                  )}
                </div>

                <div className="pt-4 space-y-2 text-xs text-white/50">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#c8ff00]" />
                    <span>150mg natural caffeine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-[#c8ff00]" />
                    <span>Zero added sugar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>Money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card className="bg-black/40 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Auto-Ship Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>✓ Save 15% on every order</p>
              <p>✓ Never run out of NEON</p>
              <p>✓ Free shipping on all orders</p>
              <p>✓ Cancel anytime, no penalties</p>
              <p>✓ Exclusive member perks</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Pre-Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-white/70">
              <p>✓ Expected shipping: April 2026</p>
              <p>✓ Secure payment processing</p>
              <p>✓ 30-day satisfaction guarantee</p>
              <p>✓ Early bird pricing locked in</p>
              <p>✓ Free NEON merch with first order</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
