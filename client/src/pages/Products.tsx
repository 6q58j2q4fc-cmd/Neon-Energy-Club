import { Check, X, ShoppingCart, Zap, Leaf, Apple, Cherry } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Products() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, setIsOpen } = useCart();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handlePreOrder = (product: "original" | "organic" | "mixed") => {
    const products = {
      original: {
        id: "neon-original-case",
        name: "NEON Original Case (24 Cans)",
        price: 59.99,
        type: "product" as const,
        flavor: "original" as const,
        image: "/neon-original-can.png",
      },
      organic: {
        id: "neon-organic-case",
        name: "NEON Organic Case (24 Cans)",
        price: 64.99,
        type: "product" as const,
        flavor: "organic" as const,
        image: "/neon-organic-can.png",
      },
      mixed: {
        id: "neon-mixed-case",
        name: "NEON Mixed Case (12 Original + 12 Organic)",
        price: 62.99,
        type: "product" as const,
        flavor: "mixed" as const,
        image: "/neon-original-can.png",
      },
    };

    addItem(products[product]);
    toast.success(`Added ${products[product].name} to cart!`, {
      description: "Click checkout to complete your order",
      action: {
        label: "Checkout",
        onClick: () => setLocation("/checkout"),
      },
    });
  };

  const handleQuickCheckout = () => {
    // Add the most popular item and go straight to checkout
    addItem({
      id: "neon-original-case",
      name: "NEON Original Case (24 Cans)",
      price: 59.99,
      type: "product" as const,
      flavor: "original" as const,
      image: "/neon-original-can.png",
    });
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white">
      <SEO 
        title="Products - NEON Energy Drink"
        description="Discover NEON Original and NEON Organic energy drinks. Clean energy with natural ingredients, zero sugar, and no crash. Fuel your potential."
        image="/og-products.png"
        url="/products"
        keywords="NEON products, energy drink flavors, NEON Original, NEON Organic, natural energy drink, zero sugar energy"
      />
      <HamburgerHeader variant="vice" />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a] via-[#0a1a1a]/80 to-transparent" />
        <div className="jungle-canopy-overlay" />
        
        {/* Floating Fruit Decorations */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-float" style={{ animationDelay: '0s' }}>
          <Apple className="w-full h-full text-[#c8ff00]" />
        </div>
        <div className="absolute top-40 right-20 w-12 h-12 opacity-20 animate-float" style={{ animationDelay: '-2s' }}>
          <Cherry className="w-full h-full text-[#ff6b6b]" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-14 h-14 opacity-20 animate-float" style={{ animationDelay: '-4s' }}>
          <Leaf className="w-full h-full text-[#00ff88]" />
        </div>
        
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30 mb-6">
            <Zap className="w-4 h-4 text-[#c8ff00]" />
            <span className="text-[#c8ff00] font-semibold text-sm">PREMIUM ENERGY</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            THE <span className="text-[#c8ff00]">PRODUCTS</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
            Two incredible flavors, both designed to give you energy that lasts without the crash.
          </p>
          
          {/* Quick Pre-Order CTA */}
          <Button
            onClick={handleQuickCheckout}
            className="bg-[#c8ff00] text-black px-8 py-6 rounded-lg font-bold text-lg hover:bg-[#a8d600] transition-all hover:scale-105 shadow-[0_0_30px_rgba(200,255,0,0.3)]"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Pre-Order Now - $59.99/case
          </Button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* NEON Original */}
            <div className={`bg-black/40 backdrop-blur-sm border border-[#c8ff00]/30 rounded-2xl overflow-hidden hover:border-[#c8ff00]/60 transition-all ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-[#c8ff00]/10 to-transparent p-8 text-center relative">
                {/* Fruit decoration */}
                <div className="absolute top-4 right-4 opacity-30">
                  <Apple className="w-8 h-8 text-[#c8ff00]" />
                </div>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#c8ff00] blur-[60px] opacity-40 rounded-full"></div>
                  <img
                    src="/neon-original-can.png"
                    alt="NEON Original"
                    className="w-40 h-auto mx-auto mb-4 animate-float relative z-10"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(184, 230, 0, 0.5))' }}
                  />
                </div>
                <h3 className="text-3xl font-black text-[#c8ff00] mb-2">NEON ORIGINAL</h3>
                <p className="text-gray-400">The "Top Shelf" Energy Drink</p>
                <p className="text-2xl font-bold text-white mt-4">$59.99 <span className="text-sm text-gray-400">/ case of 24</span></p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>100mg Natural Caffeine</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>24% Real Fruit Juice</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>Only 100 Calories</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>6 B Vitamins</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>No Taurine</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-[#c8ff00]" />
                    <span>Glows in Blacklight!</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePreOrder("original")}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold py-6 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* NEON Organic */}
            <div className={`bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-2xl overflow-hidden hover:border-orange-500/60 transition-all ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-orange-500/10 to-transparent p-8 text-center relative">
                {/* Fruit decoration */}
                <div className="absolute top-4 right-4 opacity-30">
                  <Leaf className="w-8 h-8 text-orange-400" />
                </div>
                
                {/* USDA Organic Badge */}
                <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                  USDA ORGANIC
                </div>
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-40 rounded-full"></div>
                  <img
                    src="/neon-organic-can.png"
                    alt="NEON Organic"
                    className="w-40 h-auto mx-auto mb-4 animate-float relative z-10"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(255, 140, 0, 0.5))', animationDelay: '0.5s' }}
                  />
                </div>
                <h3 className="text-3xl font-black text-orange-400 mb-2">NEON ORGANIC</h3>
                <p className="text-gray-400">USDA Certified Organic</p>
                <p className="text-2xl font-bold text-white mt-4">$64.99 <span className="text-sm text-gray-400">/ case of 24</span></p>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>100mg Natural Caffeine</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>Only 40 Calories!</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>Vegan & Non-GMO</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>No Artificial Anything</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>Stevia Sweetened</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-orange-400" />
                    <span>Glows Orange!</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePreOrder("organic")}
                  className="w-full bg-orange-500 text-black hover:bg-orange-400 font-bold py-6 text-lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Mixed Case Option */}
          <div className="mt-8 bg-gradient-to-r from-[#c8ff00]/10 via-transparent to-orange-500/10 border border-white/20 rounded-2xl p-6 text-center">
            <h3 className="text-2xl font-bold text-white mb-2">Can't Decide? Try Both!</h3>
            <p className="text-gray-400 mb-4">Mixed Case: 12 Original + 12 Organic</p>
            <div className="flex items-center justify-center gap-4">
              <span className="text-3xl font-black text-white">$62.99</span>
              <Button
                onClick={() => handlePreOrder("mixed")}
                className="bg-gradient-to-r from-[#c8ff00] to-orange-500 text-black hover:opacity-90 font-bold px-8 py-4"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add Mixed Case
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Natural Ingredients Section with Fruit Graphics */}
      <section className="py-16 px-4 bg-black/50 relative overflow-hidden">
        {/* Floating fruit decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/green-apple.png" alt="" className="absolute top-10 left-[10%] w-20 h-20 object-contain opacity-40 animate-float" style={{ animationDelay: '0s' }} />
          <img src="/images/lime.png" alt="" className="absolute top-1/3 right-[15%] w-16 h-16 object-contain opacity-40 animate-float" style={{ animationDelay: '-2s' }} />
          <img src="/cherry.png" alt="" className="absolute bottom-20 left-[20%] w-14 h-14 object-contain opacity-40 animate-float" style={{ animationDelay: '-4s' }} />
          <img src="/blueberry.png" alt="" className="absolute bottom-1/3 right-[10%] w-12 h-12 object-contain opacity-40 animate-float" style={{ animationDelay: '-3s' }} />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-4xl font-bold text-center mb-12">
            Powered by <span className="text-[#c8ff00]">Nature</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black/60 border border-[#c8ff00]/20 rounded-xl p-6 text-center hover:border-[#c8ff00]/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-[#c8ff00]" />
              </div>
              <h3 className="text-xl font-bold text-[#c8ff00] mb-2">Green Tea Extract</h3>
              <p className="text-gray-400 text-sm">100mg natural caffeine for sustained energy without the jitters</p>
            </div>
            
            <div className="bg-black/60 border border-[#c8ff00]/20 rounded-xl p-6 text-center hover:border-[#c8ff00]/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                <Apple className="w-8 h-8 text-[#c8ff00]" />
              </div>
              <h3 className="text-xl font-bold text-[#c8ff00] mb-2">Real Fruit Juice</h3>
              <p className="text-gray-400 text-sm">24% fruit juice blend for authentic taste and natural sweetness</p>
            </div>
            
            <div className="bg-black/60 border border-[#c8ff00]/20 rounded-xl p-6 text-center hover:border-[#c8ff00]/50 transition-colors">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#c8ff00]" />
              </div>
              <h3 className="text-xl font-bold text-[#c8ff00] mb-2">B Vitamins</h3>
              <p className="text-gray-400 text-sm">Over 100% daily value of 6 essential B vitamins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to <span className="text-[#c8ff00]">Feel the Energy?</span>
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join thousands who've made the switch to clean, natural energy.
          </p>
          <Button
            onClick={handleQuickCheckout}
            className="bg-[#c8ff00] text-black px-10 py-6 rounded-lg font-bold text-xl hover:bg-[#a8d600] transition-all hover:scale-105 shadow-[0_0_40px_rgba(200,255,0,0.4)] animate-pulse-glow"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Pre-Order Now
          </Button>
          <p className="text-sm text-gray-500 mt-4">Free shipping on orders over $100</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
