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
  Sparkles,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import HamburgerHeader from "@/components/HamburgerHeader";
import { useCart } from "@/contexts/CartContext";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { useHashNavigation } from "@/hooks/useHashNavigation";

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

// Book Products
const bookProducts = [
  {
    id: "neon-dreams-book",
    name: "NEON DREAMS: The Book",
    price: 24.99,
    icon: Sparkles,
    description: "The untold story behind the energy revolution",
    details: [
      "Hardcover edition",
      "300+ pages",
      "Exclusive photos",
      "Signed by Dakota Rea"
    ],
    releaseDate: "Summer 2026"
  },
  {
    id: "neon-dreams-audiobook",
    name: "NEON DREAMS: Audiobook",
    price: 19.99,
    icon: Star,
    description: "Listen to the NEON story on the go",
    details: [
      "8+ hours of content",
      "Narrated by Dakota Rea",
      "Instant digital download",
      "Bonus interviews"
    ],
    releaseDate: "Summer 2026"
  },
  {
    id: "neon-dreams-bundle",
    name: "NEON DREAMS: Complete Bundle",
    price: 39.99,
    originalPrice: 44.98,
    icon: Crown,
    description: "Get both the book and audiobook",
    details: [
      "Hardcover book",
      "Digital audiobook",
      "Exclusive bonus chapter",
      "Limited edition bookmark"
    ],
    releaseDate: "Summer 2026",
    savings: "Save $5"
  }
];

// Auto-ship discount
const AUTO_SHIP_DISCOUNT = 0.1; // 10% off

export default function Shop() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { addItem, setIsOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [autoShip, setAutoShip] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState<"original" | "organic" | "mixed">("mixed");
  
  // Initialize hash navigation
  useHashNavigation({ offset: 120 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDistributorPurchase = (pkg: typeof distributorPackages[0]) => {
    if (!user) {
      toast.info("Please sign in to become a distributor");
      setLocation("/join");
      return;
    }
    addItem({
      id: `distributor-${pkg.id}`,
      name: pkg.name,
      price: pkg.price,
      type: "package",
      image: "/neon-can.png"
    });
    toast.success(`Added ${pkg.name} to cart!`);
  };

  const handleCustomerPurchase = (pkg: typeof customerPackages[0]) => {
    const finalPrice = autoShip ? pkg.price * (1 - AUTO_SHIP_DISCOUNT) : pkg.price;
    addItem({
      id: `customer-${pkg.id}-${selectedFlavor}${autoShip ? '-autoship' : ''}`,
      name: `${pkg.name}${autoShip ? ' (Auto-Ship)' : ''} - ${selectedFlavor.charAt(0).toUpperCase() + selectedFlavor.slice(1)}`,
      price: finalPrice,
      type: "product",
      flavor: selectedFlavor,
      image: "/neon-can.png"
    });
    toast.success(`Added ${pkg.name} to cart! ${autoShip ? "(Auto-Ship enabled - 15% OFF)" : ""}`);
  };

  const handleBookPurchase = (book: typeof bookProducts[0]) => {
    addItem({
      id: book.id,
      name: book.name,
      price: book.price,
      type: "book",
      image: "/neon-dreams-book.png"
    });
    toast.success(`Added ${book.name} to cart!`, {
      description: "Pre-order now - Expected release Summer 2026"
    });
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

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbConfigs.shop} variant="default" />
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="pt-8 pb-16 px-4 relative z-10 scroll-focus-target">
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
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 bg-black/50 border border-[#c8ff00]/30">
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
              <TabsTrigger 
                value="books"
                className="data-[state=active]:bg-[#c8ff00] data-[state=active]:text-black font-bold"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Books
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

            {/* Books Tab */}
            <TabsContent value="books">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">NEON DREAMS</h2>
                <p className="text-gray-400 max-w-2xl mx-auto mb-4">
                  The untold story behind the energy revolution. Pre-order Dakota Rea's book 
                  and discover the journey that built NEON Energy.
                </p>
                <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 max-w-2xl mx-auto">
                  <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                    <span className="text-2xl">🌳</span>
                    A portion of every book sold will be donated to the <a href="https://www.rainforesttrust.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300 transition-colors">Rainforest Trust</a>
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {bookProducts.map((book, index) => (
                  <motion.div
                    key={book.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 30 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className={`relative bg-gradient-to-b from-[#1a0a2e] to-[#0a0a0a] border-2 ${'savings' in book ? 'border-[#c8ff00] neon-border' : 'border-purple-500/30'} overflow-hidden h-full flex flex-col`}>
                      {'savings' in book && (
                        <div className="absolute top-0 right-0 bg-[#c8ff00] text-black px-4 py-1 text-sm font-bold">
                          BEST VALUE
                        </div>
                      )}
                      
                      <CardHeader className="text-center pb-2">
                        <div className="w-32 h-44 mx-auto mb-4">
                          <img 
                            src="/neon-dreams-book.jpg" 
                            alt="NEON Dreams Book Cover"
                            className="w-full h-full object-cover rounded-lg shadow-[0_0_30px_rgba(200,255,0,0.3)] border border-[#c8ff00]/50 hover:shadow-[0_0_40px_rgba(200,255,0,0.5)] transition-all duration-300"
                          />
                        </div>
                        <CardTitle className="text-xl text-white">{book.name}</CardTitle>
                        <CardDescription className="text-gray-400">{book.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 flex flex-col">
                        <div className="mb-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-4xl font-black text-white">${book.price.toFixed(2)}</span>
                            {'originalPrice' in book && (
                              <span className="text-lg text-gray-500 line-through">${(book as any).originalPrice.toFixed(2)}</span>
                            )}
                          </div>
                          {'savings' in book && (
                            <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">
                              {(book as any).savings}
                            </Badge>
                          )}
                        </div>

                        <ul className="space-y-2 mb-6 flex-1">
                          {book.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <Check className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>

                        <div className="text-center text-xs text-gray-500 mb-4">
                          Expected Release: {book.releaseDate}
                        </div>

                        <Button 
                          onClick={() => handleBookPurchase(book)}
                          className={`w-full font-bold ${'savings' in book ? 'bg-[#c8ff00] text-black hover:bg-[#a8d600]' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Pre-Order Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Book Info Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 bg-gradient-to-r from-purple-900/20 to-[#c8ff00]/10 border border-purple-500/30 rounded-2xl p-8 max-w-4xl mx-auto"
              >
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4 text-white">About the Book</h3>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    Go behind the scenes of NEON Energy Drink's incredible journey. From a small startup in Bend, Oregon 
                    to a global phenomenon reaching 15% of the world's population. Dakota Rea shares the triumphs, 
                    challenges, and lessons learned building one of the fastest-growing beverage brands in history.
                  </p>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-[#c8ff00]">300+</div>
                      <div className="text-gray-400 text-sm">Pages of insights</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#c8ff00]">50+</div>
                      <div className="text-gray-400 text-sm">Exclusive photos</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#c8ff00]">8+</div>
                      <div className="text-gray-400 text-sm">Hours of audiobook</div>
                    </div>
                  </div>
                </div>
              </motion.div>
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
