import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check, Zap, Leaf, Apple, Cherry, Sparkles, Star, Award, Heart, Shield, Link as LinkIcon, ExternalLink } from "lucide-react";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { useHashNavigation } from "@/hooks/useHashNavigation";

export default function Products() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, setIsOpen } = useCart();

  // Initialize hash navigation
  const { getShareableUrl } = useHashNavigation({ offset: 120 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Copy section link to clipboard
  const copyLink = (hash: string) => {
    const url = getShareableUrl(hash);
    navigator.clipboard.writeText(url);
    toast.success('Link copied!', { description: url });
  };

  const handlePreOrder = (product: "original" | "pink" | "mixed") => {
    const products = {
      original: {
        id: "neon-original-case",
        name: "NEON Original Case (24 Cans)",
        price: 59.99,
        type: "product" as const,
        flavor: "original" as const,
        image: "/neon-original-can.png",
      },
      pink: {
        id: "neon-pink-case",
        name: "NEON Pink Electric Pom Passion Case (24 Cans)",
        price: 64.99,
        type: "product" as const,
        flavor: "pink" as const,
        image: "/neon-pink-can.png",
      },
      mixed: {
        id: "neon-mixed-case",
        name: "NEON Mixed Case (12 Original + 12 Pink)",
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

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb items={breadcrumbConfigs.products} variant="vice" />
        </div>
      </div>

      {/* Hero Section - More vibrant */}
      <section id="hero" className="pt-8 pb-12 px-4 relative overflow-hidden scroll-focus-target">
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
      <section id="products" className="py-12 px-4 relative scroll-focus-target">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* NEON Original - Seamless design */}
            <div id="original" className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] scroll-focus-target ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              {/* Gradient background that blends with page */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/15 via-black/40 to-black/60 backdrop-blur-sm" />
              <div className="absolute inset-0 border border-[#c8ff00]/20 rounded-3xl" />
              
              {/* Rainforest Trust Badge */}
              <a 
                href="https://www.rainforesttrust.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-green-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-green-500 transition-colors cursor-pointer"
              >
                <Leaf className="w-3 h-3" />
                SUPPORTS RAINFOREST TRUST
                <ExternalLink className="w-3 h-3" />
              </a>
              
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
                
                {/* FDA Disclaimer */}
                <p className="text-white/40 text-[10px] text-center mt-2 leading-tight">
                  *This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            </div>

            {/* NEON Pink - Electric Pom Passion - Women's Health Edition */}
            <div id="pink" className={`relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] scroll-focus-target ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              {/* Gradient background that blends with page */}
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/15 via-black/40 to-black/60 backdrop-blur-sm" />
              <div className="absolute inset-0 border border-pink-500/20 rounded-3xl" />
              
              {/* Susan G. Komen Badge */}
              <a 
                href="https://www.komen.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-pink-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-pink-500 transition-colors cursor-pointer"
              >
                <Heart className="w-3 h-3" />
                FIGHTS BREAST CANCER
                <ExternalLink className="w-3 h-3" />
              </a>
              
              <div className="relative p-8 text-center">
                {/* Susan G. Komen Logo */}
                <div className="flex justify-center mb-4">
                  <a 
                    href="https://www.komen.org/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:scale-105 transition-transform"
                  >
                    <img 
                      src="/susan-g-komen-logo.jpeg" 
                      alt="Susan G. Komen More Than Pink Walk" 
                      className="w-48 h-auto rounded-lg shadow-lg"
                    />
                  </a>
                </div>
                
                {/* Product image with seamless glow */}
                <div className="relative mb-6 product-image-seamless-pink">
                  <div className="absolute inset-0 bg-gradient-radial from-pink-500/30 via-pink-500/10 to-transparent blur-[80px] scale-150" />
                  <img
                    src="/neon-pink-can-nobg.png"
                    alt="NEON Pink Electric Pom Passion"
                    className="w-48 h-auto mx-auto animate-float relative z-10"
                    style={{ 
                      filter: 'drop-shadow(0 0 50px rgba(255, 0, 128, 0.6)) drop-shadow(0 0 100px rgba(255, 0, 128, 0.3))',
                      animationDelay: '0.5s',
                      background: 'transparent'
                    }}
                  />
                </div>
                
                <h3 className="text-4xl font-black text-pink-400 mb-2 drop-shadow-[0_0_20px_rgba(255,0,128,0.5)]">NEON PINK™</h3>
                <p className="text-white/60 mb-2">Electric Pom Passion</p>
                <p className="text-pink-300/80 text-sm mb-2 italic">The first energy drink engineered for women's health</p>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-pink-400 text-pink-400" />
                  ))}
                  <span className="text-white/50 text-sm ml-2">(2,156 reviews)</span>
                </div>
                <p className="text-3xl font-black text-white mb-4">$64.99 <span className="text-sm text-white/50 font-normal">/ case of 24</span></p>
                <p className="text-pink-300/70 text-xs mb-2">A portion of every sale supports Susan G. Komen®</p>
              </div>

              <div className="relative p-6 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    "Women's Health Formula",
                    "Breast Cancer Fighting Ingredients",
                    "Pomegranate & Passion Fruit",
                    "Antioxidant Rich",
                    "Supports Susan G. Komen®",
                    "Fight Back - Not Just in October!"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-white/80">
                      <Check className="w-4 h-4 text-pink-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handlePreOrder("pink")}
                  className="w-full bg-pink-500 text-white hover:bg-pink-400 font-bold py-6 text-lg rounded-xl shadow-[0_0_30px_rgba(255,0,128,0.3)] hover:shadow-[0_0_50px_rgba(255,0,128,0.5)] transition-all"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                
                {/* FDA Disclaimer */}
                <p className="text-white/40 text-[10px] text-center mt-2 leading-tight">
                  *This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
                </p>
              </div>
            </div>
          </div>

          {/* Mixed Case Option - Enhanced */}
          <div id="mixed" className="mt-12 relative rounded-3xl overflow-hidden scroll-focus-target">
            <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/10 via-transparent to-orange-500/10" />
            <div className="absolute inset-0 border border-white/10 rounded-3xl" />
            
            <div className="relative p-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-4">
                <Sparkles className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-white font-semibold text-sm">BEST VALUE</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">Can't Decide? Try Both!</h3>
              <p className="text-white/60 mb-6">Mixed Case: 12 Original + 12 Pink</p>
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

      {/* Rainforest Trust Partnership Section */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-black/40 to-transparent" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Emblem and Visual */}
            <div className="text-center md:text-left">
              <img 
                src="/rainforest-trust-emblem.png" 
                alt="Rainforest Trust Conservation Circle Member" 
                className="w-48 h-48 mx-auto md:mx-0 object-contain drop-shadow-[0_0_30px_rgba(0,255,100,0.3)]"
              />
            </div>
            
            {/* Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">CONSERVATION CIRCLE MEMBER</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Proud Partner of <a href="https://www.rainforesttrust.org/" target="_blank" rel="noopener noreferrer" className="text-green-400 drop-shadow-[0_0_20px_rgba(0,255,100,0.5)] hover:text-green-300 transition-colors">Rainforest Trust <ExternalLink className="inline w-5 h-5 ml-1" /></a>
              </h2>
              
              <p className="text-white/80 leading-relaxed">
                Rainforest Trust is one of the most efficient and transparent conservation organizations in the world. 
                With a remarkable <span className="text-green-400 font-bold">100% of donations going directly to conservation</span>, 
                they've protected over 50 million acres of critical rainforest habitat. Their 4-star Charity Navigator 
                rating and commitment to transparency make them a rare gem in the nonprofit world.
              </p>
              
              <blockquote className="border-l-4 border-green-500 pl-4 py-2 bg-green-900/20 rounded-r-lg">
                <p className="text-white/90 italic">
                  "At NEON, we believe in giving back to the jungle that bears our fruits. Every can of NEON Original 
                  you buy or sell makes a real difference. Join us in our mission to support a charity where you 
                  know your contribution creates genuine, lasting impact."
                </p>
                <footer className="text-green-400 text-sm mt-2 font-semibold">— NEON Energy Drink</footer>
              </blockquote>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <Award className="w-5 h-5 text-green-400" />
                  <span>4-Star Charity Navigator</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span>100% to Conservation</span>
                </div>
                <div className="flex items-center gap-2 text-white/70">
                  <Heart className="w-5 h-5 text-green-400" />
                  <span>50M+ Acres Protected</span>
                </div>
              </div>
              
              {/* Learn More Link */}
              <a 
                href="https://www.rainforesttrust.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-[0_0_20px_rgba(0,255,100,0.3)]"
              >
                Learn More About Rainforest Trust
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
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
