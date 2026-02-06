import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { Check, Package, Zap, Crown, Star, Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

interface PackageOption {
  id: string;
  name: string;
  price: number;
  description: string;
  items: string[];
  pv: number;
  recommended?: boolean;
  icon: any;
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  pv: number;
  quantity: number;
}

const PACKAGES: PackageOption[] = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 199,
    pv: 100,
    description: "Perfect for getting started with NEON",
    icon: Package,
    items: [
      "2 cases of NEON Original (48 cans)",
      "Distributor welcome kit",
      "Marketing materials (digital)",
      "Training access",
      "Replicated website",
    ],
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: 399,
    pv: 250,
    description: "Best value for serious entrepreneurs",
    icon: Zap,
    recommended: true,
    items: [
      "4 cases of NEON Original (96 cans)",
      "2 cases of NEON Pink (48 cans)",
      "Distributor welcome kit",
      "Marketing materials (digital + physical)",
      "Training access + 1-on-1 coaching session",
      "Replicated website",
      "Branded merchandise",
    ],
  },
  {
    id: "elite",
    name: "Elite Pack",
    price: 799,
    pv: 500,
    description: "Maximum impact for top performers",
    icon: Crown,
    items: [
      "8 cases of NEON Original (192 cans)",
      "4 cases of NEON Pink (96 cans)",
      "Distributor welcome kit",
      "Marketing materials (premium package)",
      "Training access + 3 coaching sessions",
      "Replicated website",
      "Branded merchandise (premium)",
      "Event tickets (2)",
      "Fast Start Bonus boost",
    ],
  },
];

const ADDON_ITEMS: AddonItem[] = [
  { id: "neon-original-case", name: "NEON Original (24-pack)", price: 48, pv: 24, quantity: 0 },
  { id: "neon-pink-case", name: "NEON Pink (24-pack)", price: 48, pv: 24, quantity: 0 },
  { id: "marketing-kit", name: "Physical Marketing Kit", price: 29, pv: 15, quantity: 0 },
  { id: "branded-merch", name: "Branded Merchandise Pack", price: 59, pv: 30, quantity: 0 },
];

export default function PackageSelection() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [addons, setAddons] = useState<AddonItem[]>(ADDON_ITEMS);
  const [autoship, setAutoship] = useState(true);

  const handleAddonQuantityChange = (id: string, delta: number) => {
    setAddons(prev => prev.map(addon => 
      addon.id === id 
        ? { ...addon, quantity: Math.max(0, addon.quantity + delta) }
        : addon
    ));
  };

  const calculateTotal = () => {
    const packagePrice = PACKAGES.find(p => p.id === selectedPackage)?.price || 0;
    const addonsPrice = addons.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
    return packagePrice + addonsPrice;
  };

  const calculatePV = () => {
    const packagePV = PACKAGES.find(p => p.id === selectedPackage)?.pv || 0;
    const addonsPV = addons.reduce((sum, addon) => sum + (addon.pv * addon.quantity), 0);
    return packagePV + addonsPV;
  };

  const handleContinueToCheckout = () => {
    if (!selectedPackage) {
      toast.error("Please select a starter package");
      return;
    }

    // Store selection in localStorage for checkout
    const orderData = {
      package: PACKAGES.find(p => p.id === selectedPackage),
      addons: addons.filter(a => a.quantity > 0),
      autoship,
      total: calculateTotal(),
      pv: calculatePV(),
    };
    
    localStorage.setItem("distributorPackageOrder", JSON.stringify(orderData));
    
    // Redirect to checkout
    toast.success("Package selected! Proceeding to checkout...");
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SEO 
        title="Select Your Starter Package - NEON Distributor"
        description="Choose the perfect starter package to launch your NEON Energy Drink business"
        url="/package-selection"
      />
      <HamburgerHeader variant="default" />

      <section className="py-20">
        <div className="container px-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 mb-6">
                <Star className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-[#c8ff00] font-bold text-sm">WELCOME TO NEON</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black mb-4">
                CHOOSE YOUR <span className="text-[#c8ff00] neon-text">STARTER PACKAGE</span>
              </h1>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Select the package that best fits your goals. You can always add more products later!
              </p>
            </div>

            {/* Package Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {PACKAGES.map((pkg) => {
                const Icon = pkg.icon;
                const isSelected = selectedPackage === pkg.id;
                
                return (
                  <Card
                    key={pkg.id}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? "border-2 border-[#c8ff00] bg-[#c8ff00]/5"
                        : "border border-gray-700 bg-black/50 hover:border-[#c8ff00]/50"
                    } ${pkg.recommended ? "ring-2 ring-[#c8ff00]/30" : ""}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {pkg.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#c8ff00] text-black text-xs font-black rounded-full">
                        RECOMMENDED
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 mx-auto ${
                        isSelected ? "bg-[#c8ff00]/20" : "bg-gray-800"
                      }`}>
                        <Icon className={`w-8 h-8 ${isSelected ? "text-[#c8ff00]" : "text-gray-400"}`} />
                      </div>
                      <CardTitle className="text-2xl font-black mb-2">{pkg.name}</CardTitle>
                      <div className="text-3xl font-black text-[#c8ff00] mb-2">
                        ${pkg.price}
                      </div>
                      <Badge variant="outline" className="border-[#c8ff00]/30 text-[#c8ff00]">
                        {pkg.pv} PV
                      </Badge>
                      <CardDescription className="text-gray-400 mt-2">
                        {pkg.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {pkg.items.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-[#c8ff00] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                      
                      {isSelected && (
                        <div className="mt-4 p-3 bg-[#c8ff00]/10 rounded-lg border border-[#c8ff00]/30">
                          <div className="flex items-center gap-2">
                            <Check className="w-5 h-5 text-[#c8ff00]" />
                            <span className="text-sm font-bold text-[#c8ff00]">Selected</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Add-ons Section */}
            {selectedPackage && (
              <Card className="bg-black/50 border-gray-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-2xl font-black">Add More Products (Optional)</CardTitle>
                  <CardDescription>Boost your inventory and PV with additional items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                        <div className="flex-1">
                          <div className="font-bold">{addon.name}</div>
                          <div className="text-sm text-gray-400">
                            ${addon.price} • {addon.pv} PV
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0"
                            onClick={() => handleAddonQuantityChange(addon.id, -1)}
                            disabled={addon.quantity === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">{addon.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-8 h-8 p-0"
                            onClick={() => handleAddonQuantityChange(addon.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Autoship Option */}
            {selectedPackage && (
              <Card className="bg-black/50 border-gray-700 mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      id="autoship"
                      checked={autoship}
                      onCheckedChange={(checked) => setAutoship(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="autoship" className="font-bold cursor-pointer">
                        Set up monthly autoship (Recommended)
                      </label>
                      <p className="text-sm text-gray-400 mt-1">
                        Automatically receive your products every month and stay qualified for commissions.
                        You can modify or cancel anytime from your dashboard.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary & Checkout */}
            {selectedPackage && (
              <Card className="bg-gradient-to-br from-[#c8ff00]/10 to-black border-2 border-[#c8ff00]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Order Total</div>
                      <div className="text-4xl font-black text-[#c8ff00]">
                        ${calculateTotal()}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        Total PV: {calculatePV()}
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="bg-[#c8ff00] text-black hover:bg-[#b3e600] font-black text-lg px-8 h-14"
                      onClick={handleContinueToCheckout}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Continue to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="text-sm text-gray-400 text-center">
                    You'll be able to review your order before final payment
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedPackage && (
              <div className="text-center text-gray-400 py-8">
                Select a package above to continue
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
