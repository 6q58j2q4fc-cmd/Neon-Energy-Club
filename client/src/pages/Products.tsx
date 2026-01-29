import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check, Zap, Leaf, Apple, Cherry, Sparkles, Star, Award, Heart, Shield } from "lucide-react";

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
    <div className="min-h-screen text-white product-bg-vibrant relative overflow-hidden">
      <SEO 
        title="Products - NEON Energy Drink"
        description="Discover NEON Original and NEON Organic energy drinks. Clean energy with natural ingredients, zero sugar, and no crash. Fuel your potential."
        image="/og-products.png"
        url="/products"
        keywords="NEON products, energy drink flavors, NEON Original, NEON Organic, natural energy drink, zero sugar energy"
      />
      
      {/* Vibrant background gradient overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1a1a] via-[#0d2818]/90 to-[#0a1a1a] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8ff00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-500/8 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[200px]" />
      </div>
      
      <HamburgerHeader variant="vice" />

      {/* Hero Section - More vibrant */}
      <section className="pt-32 pb-12 px-4 relative overflow-hidden">
        {/* Floating decorative elements - fixed transparency */}
        <div className="absolute top-20 left-10 w-16 h-16 opacity-30 animate-float decorative-image-normal">
          <Apple className="w-full h-full text-[#c8ff00]" />
        </div>
        <div className="absolute top-40 right-20 w-12 h-12 opacity-30 animate-float decorative-image-normal" style={{ animationDelay: '-2s' }}>
          <Cherry className="w-full h-full text-[#ff6b6b]" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-14 h-14 opacity-30 animate-float decorative-image-normal" style={{ animationDelay: '-4s' }}>
          <Leaf className="w-full h-full text-[#00ff88]" />
        </div>
        
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30 mb-6">
            <Zap className="w-4 h-4 text-[#c8ff00]" />
            <span className="text-[#c8ff00] font-semibold text-sm">PREMIUM ENERGY</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            THE <span className="text-[#c8ff00] drop-shadow-[0_0_30px_rgba(200,255,0,0.5)]">PRODUCTS</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed max-w-2xl mx-auto mb-8">
            Two incredible flavors, both designed to give you energy that lasts without the crash.
          </p>
          
          {/* Quick Pre-Order CTA */}
          <Button
            onClick={handleQuickCheckout}
            className="bg-[#c8ff00] text-black px-8 py-6 rounded-lg font-bold text-lg hover:bg-[#a8d600] transition-all hover:scale-105 shadow-[0_0_40px_rgba(200,255,0,0.4)] vibrant-glow-green"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Pre-Order Now - $59.99/case
          </Button>
        </div>
      </section>

      {/* Products Grid - Seamless blending */}
      <section className="py-12 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* NEON Original - Seamless design */}
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              {/* Gradient background that blends with page */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/15 via-black/40 to-black/60 backdrop-blur-sm" />
              <div className="absolute inset-0 border border-[#c8ff00]/20 rounded-3xl" />
              
              <div className="relative p-8 text-center">
                {/* Product image with seamless glow */}
                <div className="relative mb-6 product-image-seamless">
                  <div className="absolute inset-0 bg-gradient-radial from-[#c8ff00]/30 via-[#c8ff00]/10 to-transparent blur-[80px] scale-150" />
                  <img
                    src="/neon-original-can.png"
                    alt="NEON Original"
                    className="w-48 h-auto mx-auto animate-float relative z-10"
                    style={{ 
                      filter: 'drop-shadow(0 0 50px rgba(184, 230, 0, 0.6)) drop-shadow(0 0 100px rgba(184, 230, 0, 0.3))',
                      background: 'transparent'
                    }}
                  />
                </div>
                
                <h3 className="text-4xl font-black text-[#c8ff00] mb-2 drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">NEON ORIGINAL</h3>
                <p className="text-white/60 mb-2">The "Top Shelf" Energy Drink</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#c8ff00] text-[#c8ff00]" />
                  ))}
                  <span className="text-white/50 text-sm ml-2">(2,847 reviews)</span>
                </div>
                <p className="text-3xl font-black text-white mb-6">$59.99 <span className="text-sm text-white/50 font-normal">/ case of 24</span></p>
              </div>

              <div className="relative p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    "100mg Natural Caffeine",
                    "24% Real Fruit Juice",
                    "Only 100 Calories",
                    "6 B Vitamins",
                    "No Taurine",
                    "Glows in Blacklight!"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="w-4 h-4 text-[#c8ff00] flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePreOrder("original")}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(200,255,0,0.3)] hover:shadow-[0_0_50px_rgba(200,255,0,0.5)] transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            {/* NEON Organic - Seamless design */}
            <div className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              {/* Gradient background that blends with page */}
              <div className="absolute inset-0 bg-gradient-to-b from-orange-500/15 via-black/40 to-black/60 backdrop-blur-sm" />
              <div className="absolute inset-0 border border-orange-500/20 rounded-3xl" />
              
              {/* USDA Organic Badge */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
                <Award className="w-3 h-3" />
                USDA ORGANIC
              </div>
              
              <div className="relative p-8 text-center">
                {/* Product image with seamless glow */}
                <div className="relative mb-6 product-image-seamless-orange">
                  <div className="absolute inset-0 bg-gradient-radial from-orange-500/30 via-orange-500/10 to-transparent blur-[80px] scale-150" />
                  <img
                    src="/neon-organic-can.png"
                    alt="NEON Organic"
                    className="w-48 h-auto mx-auto animate-float relative z-10"
                    style={{ 
                      filter: 'drop-shadow(0 0 50px rgba(255, 140, 0, 0.6)) drop-shadow(0 0 100px rgba(255, 140, 0, 0.3))',
                      animationDelay: '0.5s',
                      background: 'transparent'
                    }}
                  />
                </div>
                
                <h3 className="text-4xl font-black text-orange-400 mb-2 drop-shadow-[0_0_20px_rgba(255,140,0,0.5)]">NEON ORGANIC</h3>
                <p className="text-white/60 mb-2">USDA Certified Organic</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                  <span className="text-white/50 text-sm ml-2">(1,923 reviews)</span>
                </div>
                <p className="text-3xl font-black text-white mb-6">$64.99 <span className="text-sm text-white/50 font-normal">/ case of 24</span></p>
              </div>

              <div className="relative p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    "100mg Natural Caffeine",
                    "Only 40 Calories!",
                    "Vegan & Non-GMO",
                    "No Artificial Anything",
                    "Stevia Sweetened",
                    "Glows Orange!"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="w-4 h-4 text-orange-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePreOrder("organic")}
                  className="w-full bg-orange-500 text-black hover:bg-orange-400 font-bold py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(255,140,0,0.3)] hover:shadow-[0_0_50px_rgba(255,140,0,0.5)] transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Mixed Case Option - Enhanced */}
          <div className="mt-12 relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/10 via-transparent to-orange-500/10" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            
            <div className="relative p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
                <Sparkles className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-white font-semibold text-sm">BEST VALUE</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Can't Decide? Try Both!</h3>
              <p className="text-white/60 mb-6">Mixed Case: 12 Original + 12 Organic</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="text-4xl font-black text-white">$62.99</span>
                <Button
                  onClick={() => handlePreOrder("mixed")}
                  className="bg-gradient-to-r from-[#c8ff00] to-orange-500 text-black hover:opacity-90 font-bold px-10 py-6 text-lg rounded-xl shadow-[0_0_40px_rgba(200,255,0,0.3)]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add Mixed Case
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Natural Ingredients Section - Enhanced */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c8ff00]/5 to-transparent" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Powered by <span className="text-[#c8ff00] drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">Nature</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every ingredient is carefully selected for maximum energy and health benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Leaf, title: "Green Tea Extract", desc: "100mg natural caffeine for sustained energy without the jitters", color: "#c8ff00" },
              { icon: Apple, title: "Real Fruit Juice", desc: "24% fruit juice blend for authentic taste and natural sweetness", color: "#c8ff00" },
              { icon: Zap, title: "B Vitamins", desc: "Over 100% daily value of 6 essential B vitamins", color: "#c8ff00" }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative bg-black/40 backdrop-blur-sm border border-[#c8ff00]/20 rounded-2xl p-6 text-center hover:border-[#c8ff00]/50 transition-all">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-[#c8ff00]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#c8ff00] mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-wrap justify-center gap-6 text-center">
            {[
              { icon: Shield, text: "30-Day Money Back" },
              { icon: Heart, text: "100% Natural" },
              { icon: Award, text: "Lab Tested" },
              { icon: Zap, text: "Fast Shipping" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <item.icon className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-white/70 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c8ff00]/10 to-transparent" />
        <div className="container mx-auto max-w-2xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to <span className="text-[#c8ff00] drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">Feel the Energy?</span>
          </h2>
          <p className="text-lg text-white/60 mb-8">
            Join thousands who've made the switch to clean, natural energy.
          </p>
          <Button
            onClick={handleQuickCheckout}
            className="bg-[#c8ff00] text-black px-12 py-7 rounded-xl font-bold text-xl hover:bg-[#a8d600] transition-all hover:scale-105 shadow-[0_0_50px_rgba(200,255,0,0.5)] animate-pulse-glow"
          >
            <ShoppingCart className="w-6 h-6 mr-2" />
            Pre-Order Now
          </Button>
          <p className="text-sm text-white/40 mt-4">Free shipping on orders over $100</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
