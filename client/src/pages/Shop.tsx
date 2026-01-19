import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { motion } from "framer-motion";
import { 
  Package, 
  Zap, 
  Crown, 
  Star, 
  Check, 
  ShoppingCart, 
  Repeat, 
  Gift,
  Users,
  TrendingUp,
  Award,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import HamburgerHeader from "@/components/HamburgerHeader";

// Distributor Packages
const distributorPackages = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 199,
    originalPrice: 249,
    pv: 100,
    icon: Package,
    color: "from-green-500 to-emerald-600",
    popular: false,
    contents: [
      "12 cans NEON Original",
      "12 cans NEON Organic",
      "Business starter kit",
      "Training access",
      "Personal replicated website"
    ],
    benefits: [
      "Earn up to 20% direct commissions",
      "Binary team bonuses",
      "Access to back office"
    ]
  },
  {
    id: "pro",
    name: "Pro Pack",
    price: 499,
    originalPrice: 649,
    pv: 300,
    icon: Zap,
    color: "from-[#c8ff00] to-yellow-500",
    popular: true,
    contents: [
      "48 cans mixed (Original + Organic)",
      "Premium business kit",
      "Marketing materials bundle",
      "Personal website + custom domain",
      "Priority support"
    ],
    benefits: [
      "Earn up to 25% direct commissions",
      "Higher binary payouts",
      "Fast Start bonus eligible",
      "Leadership training access"
    ]
  },
  {
    id: "elite",
    name: "Elite Pack",
    price: 999,
    originalPrice: 1299,
    pv: 600,
    icon: Crown,
    color: "from-purple-500 to-pink-600",
    popular: false,
    contents: [
      "144 cans mixed (Full variety)",
      "Complete marketing suite",
      "Premium training library",
      "VIP support line",
      "Event tickets (2)",
      "Branded merchandise kit"
    ],
    benefits: [
      "Earn up to 30% direct commissions",
      "Maximum binary payouts",
      "All bonuses unlocked",
      "Exclusive leadership events",
      "Personal success coach"
    ]
  }
];

// Customer Packages
const customerPackages = [
  {
    id: "single",
    name: "Try It",
    price: 3.99,
    perCan: 3.99,
    quantity: 1,
    icon: Sparkles,
    description: "Perfect for first-timers"
  },
  {
    id: "12pack",
    name: "12-Pack",
    price: 42,
    perCan: 3.50,
    quantity: 12,
    icon: Package,
    description: "Most popular choice",
    popular: true,
    savings: "Save $6"
  },
  {
    id: "24pack",
    name: "24-Pack",
    price: 72,
    perCan: 3.00,
    quantity: 24,
    icon: Gift,
    description: "Best value",
    savings: "Save $24"
  }
];

// Auto-ship discount
const AUTO_SHIP_DISCOUNT = 0.15; // 15% off

export default function Shop() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [autoShip, setAutoShip] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<"original" | "organic" | "mixed">("mixed");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDistributorPurchase = (pkg: typeof distributorPackages[0]) => {
    if (!user) {
      toast.info("Please sign in to become a distributor");
      setLocation("/join");
      return;
    }
    toast.success(`Added ${pkg.name} to cart! Redirecting to checkout...`);
    // Would integrate with Stripe checkout
  };

  const handleCustomerPurchase = (pkg: typeof customerPackages[0]) => {
    const finalPrice = autoShip ? pkg.price * (1 - AUTO_SHIP_DISCOUNT) : pkg.price;
    toast.success(`Added ${pkg.name} to cart! ${autoShip ? "(Auto-Ship enabled - 15% OFF)" : ""}`);
    // Would integrate with Stripe checkout
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white relative overflow-hidden">
      {/* Background Graphics */}
      <div className="synthwave-grid-bg" />
      <div className="floating-neon-orb green w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }} />
      <div className="floating-neon-orb pink w-80 h-80 top-1/4 -right-40" style={{ animationDelay: '-5s' }} />
      <div className="floating-neon-orb cyan w-72 h-72 bottom-1/3 -left-36" style={{ animationDelay: '-10s' }} />
      
      {/* Decorative Palm Trees */}
      <img src="/neon-palm-tree.png" alt="" className="palm-tree-left hidden lg:block" />
      <img src="/neon-palm-tree.png" alt="" className="palm-tree-right hidden lg:block" />
      
      <HamburgerHeader variant="default" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(200,255,0,0.15),transparent_50%)]"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30 mb-6">
              <ShoppingCart className="w-4 h-4 mr-2" />
              NEON SHOP
            </Badge>
            <h1 className="text-5xl md:text-7xl font-black mb-6">
              FUEL YOUR
              <span className="block text-[#c8ff00] neon-text">AMBITION</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Choose your path: Join as a distributor and build your empire, or simply enjoy the energy as a customer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Shop Content */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a1a1a] to-[#0d2818]">
        <div className="container mx-auto max-w-7xl">
          <Tabs defaultValue="distributor" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 bg-black/50 border border-[#c8ff00]/30">
              <TabsTrigger 
                value="distributor" 
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                <Users className="w-4 h-4 mr-2" />
                Distributor Packs
              </TabsTrigger>
              <TabsTrigger 
                value="customer"
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Customer Orders
              </TabsTrigger>
            </TabsList>

            {/* Distributor Packages */}
            <TabsContent value="distributor">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Start Your NEON Business</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Choose your starter package and unlock the power of the NEON opportunity. 
                  Each pack includes everything you need to launch your business.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {distributorPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`relative bg-[#0a1a1a]/90 backdrop-blur-sm border-2 ${pkg.popular ? 'border-[#c8ff00] neon-border' : 'border-[#2d5a3d]/50'} overflow-hidden h-full flex flex-col`}>
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-[#c8ff00] text-black px-4 py-1 text-sm font-bold">
                          MOST POPULAR
                        </div>
                      )}
                      
                      {/* Header with gradient */}
                      <div className={`bg-gradient-to-r ${pkg.color} p-6`}>
                        <pkg.icon className="w-12 h-12 text-white mb-4" />
                        <h3 className="text-2xl font-bold text-white">{pkg.name}</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-4xl font-black text-white">${pkg.price}</span>
                          <span className="text-lg text-white/70 line-through">${pkg.originalPrice}</span>
                        </div>
                        <div className="text-white/80 text-sm mt-1">{pkg.pv} PV</div>
                      </div>

                      <CardContent className="p-6 flex-1 flex flex-col">
                        {/* Contents */}
                        <div className="mb-6">
                          <h4 className="font-bold text-[#c8ff00] mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            What's Included
                          </h4>
                          <ul className="space-y-2">
                            {pkg.contents.map((item, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Benefits */}
                        <div className="mb-6 flex-1">
                          <h4 className="font-bold text-[#c8ff00] mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Business Benefits
                          </h4>
                          <ul className="space-y-2">
                            {pkg.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Button 
                          onClick={() => handleDistributorPurchase(pkg)}
                          className={`w-full font-bold py-6 ${pkg.popular ? 'bg-[#c8ff00] text-black hover:bg-[#a8d600] neon-pulse' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Distributor Benefits Banner */}
              <div className="mt-16 bg-gradient-to-r from-[#c8ff00]/10 via-[#c8ff00]/5 to-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-2xl p-8">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                  <div>
                    <Award className="w-10 h-10 text-[#c8ff00] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">Up to 30%</div>
                    <div className="text-gray-400 text-sm">Direct Commissions</div>
                  </div>
                  <div>
                    <Users className="w-10 h-10 text-[#c8ff00] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">5 Levels</div>
                    <div className="text-gray-400 text-sm">Team Bonuses</div>
                  </div>
                  <div>
                    <TrendingUp className="w-10 h-10 text-[#c8ff00] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">Weekly</div>
                    <div className="text-gray-400 text-sm">Commission Payouts</div>
                  </div>
                  <div>
                    <Gift className="w-10 h-10 text-[#c8ff00] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-white">$25K+</div>
                    <div className="text-gray-400 text-sm">Rank Bonuses</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Customer Packages */}
            <TabsContent value="customer">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Shop NEON Energy</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                  Experience the revolutionary energy of NEON. Choose your pack size and save more when you buy in bulk.
                </p>

                {/* Auto-Ship Toggle */}
                <div className="inline-flex items-center gap-4 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-full px-6 py-3">
                  <Repeat className="w-5 h-5 text-[#c8ff00]" />
                  <Label htmlFor="autoship" className="text-white font-medium cursor-pointer">
                    Enable Auto-Ship
                  </Label>
                  <Switch
                    id="autoship"
                    checked={autoShip}
                    onCheckedChange={setAutoShip}
                  />
                  {autoShip && (
                    <Badge className="bg-[#c8ff00] text-black font-bold">
                      15% OFF
                    </Badge>
                  )}
                </div>
                {autoShip && (
                  <p className="text-[#c8ff00] text-sm mt-3">
                    ✨ Auto-Ship subscribers save 15% on every order + free shipping!
                  </p>
                )}
              </div>

              {/* Flavor Selection */}
              <div className="flex justify-center gap-4 mb-12">
                {[
                  { id: "original", name: "Original", color: "bg-[#c8ff00]" },
                  { id: "organic", name: "Organic", color: "bg-green-500" },
                  { id: "mixed", name: "Mixed Pack", color: "bg-gradient-to-r from-[#c8ff00] to-green-500" }
                ].map((flavor) => (
                  <button
                    key={flavor.id}
                    onClick={() => setSelectedFlavor(flavor.id as any)}
                    className={`px-6 py-3 rounded-full font-bold transition-all ${
                      selectedFlavor === flavor.id 
                        ? `${flavor.color} text-black` 
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {customerPackages.map((pkg, index) => {
                  const finalPrice = autoShip ? pkg.price * (1 - AUTO_SHIP_DISCOUNT) : pkg.price;
                  const finalPerCan = autoShip ? pkg.perCan * (1 - AUTO_SHIP_DISCOUNT) : pkg.perCan;
                  
                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className={`relative bg-[#0a0a0a] border-2 ${pkg.popular ? 'border-[#c8ff00] neon-border' : 'border-gray-800'} overflow-hidden`}>
                        {pkg.popular && (
                          <div className="absolute top-0 right-0 bg-[#c8ff00] text-black px-4 py-1 text-sm font-bold">
                            BEST SELLER
                          </div>
                        )}
                        
                        <CardHeader className="text-center pb-2">
                          <pkg.icon className="w-12 h-12 text-[#c8ff00] mx-auto mb-2" />
                          <CardTitle className="text-2xl text-white">{pkg.name}</CardTitle>
                          <CardDescription className="text-gray-400">{pkg.description}</CardDescription>
                        </CardHeader>

                        <CardContent className="text-center">
                          <div className="mb-4">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-4xl font-black text-white">${finalPrice.toFixed(2)}</span>
                              {autoShip && (
                                <span className="text-lg text-gray-500 line-through">${pkg.price.toFixed(2)}</span>
                              )}
                            </div>
                            <div className="text-[#c8ff00] text-sm mt-1">
                              ${finalPerCan.toFixed(2)} per can
                            </div>
                            {pkg.savings && (
                              <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                                {pkg.savings}
                              </Badge>
                            )}
                          </div>

                          <div className="text-gray-400 text-sm mb-6">
                            {pkg.quantity} {pkg.quantity === 1 ? 'can' : 'cans'} • {selectedFlavor === 'mixed' ? 'Mixed flavors' : `NEON ${selectedFlavor.charAt(0).toUpperCase() + selectedFlavor.slice(1)}`}
                          </div>

                          <Button 
                            onClick={() => handleCustomerPurchase(pkg)}
                            className={`w-full font-bold ${pkg.popular ? 'bg-[#c8ff00] text-black hover:bg-[#a8d600]' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add to Cart
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Auto-Ship Benefits */}
              {autoShip && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 bg-gradient-to-r from-[#c8ff00]/10 to-green-500/10 border border-[#c8ff00]/30 rounded-2xl p-8"
                >
                  <h3 className="text-2xl font-bold text-center mb-6 text-[#c8ff00]">Auto-Ship Benefits</h3>
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-white">15%</div>
                      <div className="text-gray-400 text-sm">Savings on every order</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">FREE</div>
                      <div className="text-gray-400 text-sm">Shipping always</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">Flexible</div>
                      <div className="text-gray-400 text-sm">Skip, pause, or cancel anytime</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-white">Priority</div>
                      <div className="text-gray-400 text-sm">First access to new flavors</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to <span className="text-[#c8ff00]">Ignite</span> Your Potential?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Whether you're looking for premium energy or a life-changing business opportunity, NEON has you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/join")}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold px-8 py-6 text-lg neon-pulse"
            >
              <Users className="w-5 h-5 mr-2" />
              Become a Distributor
            </Button>
            <Button 
              onClick={() => setLocation("/compensation")}
              variant="outline"
              className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold px-8 py-6 text-lg"
            >
              View Compensation Plan
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c8ff00]/20 py-8 px-4 bg-black">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
