import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check, Zap, Leaf, Apple, Cherry, Sparkles, Star, Award, Heart, Shield, ExternalLink, Flame, Droplets, Battery, Globe, Gem } from "lucide-react";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import CustomerPhotoGallery from "@/components/CustomerPhotoGallery";
import { ProductQuickView, products as productData, ProductData } from "@/components/ProductQuickView";
import { Eye } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Products() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, setIsOpen } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<ProductData | null>(null);

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
        image: "/neon-can-transparent-final.png",
      },
      pink: {
        id: "neon-pink-case",
        name: "NEON Pink Electric Pom Passion Case (24 Cans)",
        price: 64.99,
        type: "product" as const,
        flavor: "pink" as const,
        image: "/neon-pink-can-new.png",
      },
      mixed: {
        id: "neon-combo-cases",
        name: "NEON Combo: 1 Case Original + 1 Case Pink (48 Cans Total)",
        price: 119.99,
        type: "product" as const,
        flavor: "mixed" as const,
        image: "/neon-can-transparent-final.png",
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
      image: "/neon-can-transparent-final.png",
    });
    setLocation("/checkout");
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden bg-[#050a0a]">
      <SEO 
        title="Products - NEON Energy Drink"
        description="Discover NEON Original and NEON Pink energy drinks. Clean energy with natural ingredients, zero sugar, and no crash. Fuel your potential."
        image="/og-products.png"
        url="/products"
        keywords="NEON products, energy drink flavors, NEON Original, NEON Pink, natural energy drink, zero sugar energy"
      />
      
      {/* Premium background with animated gradients */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1a12] via-[#050a0a] to-[#0a0a14]" />
        
        {/* Animated orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#c8ff00]/8 rounded-full blur-[200px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ff0080]/6 rounded-full blur-[180px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00ff88]/4 rounded-full blur-[250px]" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(200,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <HamburgerHeader variant="vice" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-7xl">
          <Breadcrumb items={breadcrumbConfigs.products} variant="vice" />
        </div>
      </div>

      {/* Hero Section - Premium Design */}
      <section id="hero" className="pt-8 pb-16 px-4 relative overflow-hidden scroll-focus-target">
        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 opacity-20 animate-float">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#c8ff00] to-transparent blur-sm" />
        </div>
        <div className="absolute top-40 right-20 w-16 h-16 opacity-20 animate-float" style={{ animationDelay: '-2s' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ff0080] to-transparent blur-sm" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 opacity-15 animate-float" style={{ animationDelay: '-4s' }}>
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#00ff88] to-transparent blur-sm" />
        </div>
        
        <div className={`container mx-auto max-w-7xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#c8ff00]/20 to-[#00ff88]/20 border border-[#c8ff00]/30 mb-8 backdrop-blur-sm">
            <Zap className="w-5 h-5 text-[#c8ff00]" />
            <span className="text-[#c8ff00] font-bold text-sm tracking-wider">PREMIUM ENERGY COLLECTION</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tight">
            <span className="text-white">THE </span>
            <span className="bg-gradient-to-r from-[#c8ff00] via-[#00ff88] to-[#c8ff00] bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(200,255,0,0.5)]">PRODUCTS</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
            Two incredible flavors crafted for those who demand more. 
            <span className="text-white/80"> Energy that lasts. Zero compromise.</span>
          </p>
          
          {/* Quick Pre-Order CTA with enhanced styling */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={handleQuickCheckout}
              className="bg-gradient-to-r from-[#c8ff00] to-[#a8e600] text-black px-10 py-7 rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_60px_rgba(200,255,0,0.4)] hover:shadow-[0_0_80px_rgba(200,255,0,0.6)]"
            >
              <ShoppingCart className="w-6 h-6 mr-3" />
              Pre-Order Now - $59.99/case
            </Button>
            <p className="text-white/40 text-sm">Free shipping on orders over $100</p>
          </div>
        </div>
      </section>

      {/* Products Showcase - Premium Grid */}
      <section id="products" className="py-16 px-4 relative scroll-focus-target">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            
            {/* NEON Original - Premium Card */}
            <div id="original" className={`group relative scroll-focus-target ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              {/* Card container with glass effect */}
              <div className="relative rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                {/* Premium gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#c8ff00]/10 via-black/60 to-black/80" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="absolute inset-0 border-2 border-[#c8ff00]/20 rounded-[2rem] group-hover:border-[#c8ff00]/40 transition-colors" />
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-[#c8ff00]/20 via-transparent to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Rainforest Trust Badge - Enhanced */}
                <a 
                  href="https://www.rainforesttrust.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-all shadow-lg shadow-green-500/30"
                >
                  <Leaf className="w-4 h-4" />
                  SUPPORTS RAINFOREST TRUST
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <div className="relative p-10">
                  {/* Product image with premium glow */}
                  <div className="relative mb-8 flex justify-center">
                    <img
                      src="/neon-can-transparent-final.png"
                      alt="NEON Original"
                      className="w-80 h-auto relative z-10 animate-float drop-shadow-[0_20px_60px_rgba(200,255,0,0.5)]"
                    />
                  </div>
                  
                  {/* Product info */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-5xl font-black bg-gradient-to-r from-[#c8ff00] to-[#a8e600] bg-clip-text text-transparent">
                        NEON ORIGINAL
                      </h3>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-bold">
                        <Gem className="w-4 h-4" />
                        NFT
                      </span>
                    </div>
                    <p className="text-white/50 text-lg font-medium">The "Top Shelf" Energy Drink</p>
                    
                    {/* Pre-order Notice */}
                    <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl px-4 py-2">
                      <p className="text-[#c8ff00] text-sm font-semibold">PRE-ORDER NOW</p>
                      <p className="text-white/60 text-xs">Ships after 90-day early bird period & crowdfunding goals met</p>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-white">$59.99</span>
                      <span className="text-white/40 text-lg">/ case of 24</span>
                    </div>
                  </div>
                </div>

                {/* Features grid */}
                <div className="relative px-10 pb-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Battery, text: "100mg Natural Caffeine" },
                      { icon: Droplets, text: "24% Real Fruit Juice" },
                      { icon: Flame, text: "Only 100 Calories" },
                      { icon: Zap, text: "6 B Vitamins" },
                      { icon: Shield, text: "No Taurine" },
                      { icon: Sparkles, text: "Glows in Blacklight!" }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/70 group-hover:text-white/90 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
                          <feature.icon className="w-4 h-4 text-[#c8ff00]" />
                        </div>
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePreOrder("original")}
                      className="flex-1 bg-gradient-to-r from-[#c8ff00] to-[#a8e600] text-black hover:opacity-90 font-black py-7 text-lg rounded-2xl shadow-[0_10px_40px_rgba(200,255,0,0.3)] hover:shadow-[0_15px_60px_rgba(200,255,0,0.5)] transition-all"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => setQuickViewProduct(productData[0])}
                      variant="outline"
                      className="w-16 border-2 border-[#c8ff00]/30 hover:border-[#c8ff00] hover:bg-[#c8ff00]/10 rounded-2xl transition-all"
                      title="Quick View"
                    >
                      <Eye className="w-6 h-6 text-[#c8ff00]" />
                    </Button>
                  </div>
                  
                  <p className="text-white/30 text-[10px] text-center leading-tight">
                    *This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                </div>
              </div>
            </div>

            {/* NEON Pink - Premium Card */}
            <div id="pink" className={`group relative scroll-focus-target ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              {/* Card container with glass effect */}
              <div className="relative rounded-[2rem] overflow-hidden transition-all duration-500 hover:scale-[1.02]">
                {/* Premium gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#ff0080]/10 via-black/60 to-black/80" />
                <div className="absolute inset-0 backdrop-blur-xl" />
                <div className="absolute inset-0 border-2 border-pink-500/20 rounded-[2rem] group-hover:border-pink-500/40 transition-colors" />
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-pink-500/20 via-transparent to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Susan G. Komen Badge - Enhanced */}
                <a 
                  href="https://www.komen.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="absolute top-6 left-6 z-20 flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white text-xs font-bold px-4 py-2 rounded-full hover:scale-105 transition-all shadow-lg shadow-pink-500/30"
                >
                  <Heart className="w-4 h-4" />
                  FIGHTS BREAST CANCER
                  <ExternalLink className="w-3 h-3" />
                </a>
                
                <div className="relative p-10">
                  {/* Susan G. Komen Logo */}
                  <div className="flex justify-center mb-6">
                    <a 
                      href="https://www.komen.org/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:scale-105 transition-transform"
                    >
                      <img 
                        src="/susan-g-komen-logo.jpeg" 
                        alt="Susan G. Komen More Than Pink Walk" 
                        className="w-52 h-auto rounded-xl shadow-xl shadow-pink-500/20"
                      />
                    </a>
                  </div>
                  
                  {/* Product image with premium glow */}
                  <div className="relative mb-8 flex justify-center">
                    <img
                      src="/neon-pink-can-final.png"
                      alt="NEON Pink Electric Pom Passion"
                      className="w-80 h-auto relative z-10 animate-float drop-shadow-[0_20px_60px_rgba(255,0,128,0.5)]"
                      style={{ animationDelay: '0.5s' }}
                    />
                  </div>
                  
                  {/* Product info */}
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <h3 className="text-5xl font-black bg-gradient-to-r from-pink-400 to-pink-300 bg-clip-text text-transparent">
                        NEON PINK™
                      </h3>
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-sm font-bold">
                        <Gem className="w-4 h-4" />
                        NFT
                      </span>
                    </div>
                    <p className="text-white/50 text-lg font-medium">Electric Pom Passion</p>
                    <p className="text-pink-300/80 text-sm italic">The first energy drink engineered for women's health</p>
                    
                    {/* Pre-order Notice */}
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl px-4 py-2">
                      <p className="text-pink-400 text-sm font-semibold">PRE-ORDER NOW</p>
                      <p className="text-white/60 text-xs">Ships after 90-day early bird period & crowdfunding goals met</p>
                    </div>
                    
                    {/* Price */}
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-5xl font-black text-white">$64.99</span>
                      <span className="text-white/40 text-lg">/ case of 24</span>
                    </div>
                    <p className="text-pink-300/60 text-sm">A portion of every sale supports Susan G. Komen®</p>
                  </div>
                </div>

                {/* Features grid */}
                <div className="relative px-10 pb-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Heart, text: "Women's Health Formula" },
                      { icon: Shield, text: "Cancer Fighting Ingredients" },
                      { icon: Cherry, text: "Pomegranate & Passion Fruit" },
                      { icon: Sparkles, text: "Antioxidant Rich" },
                      { icon: Award, text: "Supports Susan G. Komen®" },
                      { icon: Flame, text: "Fight Back - Every Day!" }
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/70 group-hover:text-white/90 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center">
                          <feature.icon className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handlePreOrder("pink")}
                      className="flex-1 bg-gradient-to-r from-pink-500 to-pink-400 text-white hover:opacity-90 font-black py-7 text-lg rounded-2xl shadow-[0_10px_40px_rgba(255,0,128,0.3)] hover:shadow-[0_15px_60px_rgba(255,0,128,0.5)] transition-all"
                    >
                      <ShoppingCart className="w-6 h-6 mr-3" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={() => setQuickViewProduct(productData[1])}
                      variant="outline"
                      className="w-16 border-2 border-pink-500/30 hover:border-pink-500 hover:bg-pink-500/10 rounded-2xl transition-all"
                      title="Quick View"
                    >
                      <Eye className="w-6 h-6 text-pink-400" />
                    </Button>
                  </div>
                  
                  <p className="text-white/30 text-[10px] text-center leading-tight">
                    *This statement has not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Try a Case of Each - Premium Design */}
          <div id="mixed" className="mt-16 relative scroll-focus-target">
            <div className="relative rounded-[2rem] overflow-hidden">
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/10 via-black/60 to-pink-500/10" />
              <div className="absolute inset-0 backdrop-blur-xl" />
              <div className="absolute inset-0 border-2 border-white/10 rounded-[2rem]" />
              
              <div className="relative p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#c8ff00]/20 to-pink-500/20 border border-white/20 mb-6">
                    <Sparkles className="w-5 h-5 text-[#c8ff00]" />
                    <span className="text-white font-bold tracking-wider">BEST VALUE — SAVE $4.99</span>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-black text-white mb-4">Try a Case of Each!</h3>
                  <p className="text-white/50 text-lg">Get a full case of NEON Original + a full case of NEON Pink</p>
                </div>

                {/* Two case display */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {/* Original Case */}
                  <div className="bg-black/40 border border-[#c8ff00]/20 rounded-2xl p-6 text-center">
                    <div className="w-24 h-32 mx-auto mb-4 relative">
                      <img src="/neon-can-transparent-final.png" alt="NEON Original" className="w-full h-full object-contain" />
                    </div>
                    <h4 className="text-xl font-black text-[#c8ff00] mb-1">NEON Original</h4>
                    <p className="text-white/50 text-sm mb-2">24 × 8.4oz Cans</p>
                    <p className="text-white/30 text-xs">Full Case — Citrus Blast Energy</p>
                  </div>
                  
                  {/* Pink Case */}
                  <div className="bg-black/40 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <div className="w-24 h-32 mx-auto mb-4 relative">
                      <img src="/neon-pink-can-new.png" alt="NEON Pink" className="w-full h-full object-contain" />
                    </div>
                    <h4 className="text-xl font-black text-pink-400 mb-1">NEON Pink</h4>
                    <p className="text-white/50 text-sm mb-2">24 × 8.4oz Cans</p>
                    <p className="text-white/30 text-xs">Full Case — Electric Pom Passion</p>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-2xl text-white/30 line-through">$124.98</span>
                    <span className="text-6xl font-black bg-gradient-to-r from-[#c8ff00] to-pink-400 bg-clip-text text-transparent">$119.99</span>
                  </div>
                  <p className="text-white/40 text-sm mb-6">48 cans total — 2 full cases of 24 × 8.4oz each</p>
                  <Button
                    onClick={() => handlePreOrder("mixed")}
                    className="bg-gradient-to-r from-[#c8ff00] via-[#00ff88] to-pink-500 text-black hover:opacity-90 font-black px-12 py-7 text-xl rounded-2xl shadow-[0_10px_50px_rgba(200,255,0,0.3)] hover:shadow-[0_15px_60px_rgba(200,255,0,0.5)] transition-all"
                  >
                    <ShoppingCart className="w-7 h-7 mr-3" />
                    Add Both Cases to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Natural Ingredients Section - Premium Design */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c8ff00]/5 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 mb-6">
              <Leaf className="w-5 h-5 text-[#c8ff00]" />
              <span className="text-[#c8ff00] font-bold text-sm tracking-wider">NATURAL INGREDIENTS</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              Powered by <span className="bg-gradient-to-r from-[#c8ff00] to-[#00ff88] bg-clip-text text-transparent">Nature</span>
            </h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">
              Every ingredient is carefully selected for maximum energy and health benefits
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Leaf, title: "Green Tea Extract", desc: "100mg natural caffeine for sustained energy without the jitters", color: "#c8ff00" },
              { icon: Droplets, title: "Real Fruit Juice", desc: "24% fruit juice blend for authentic taste and natural sweetness", color: "#00ff88" },
              { icon: Zap, title: "B Vitamins", desc: "Over 100% daily value of 6 essential B vitamins", color: "#c8ff00" }
            ].map((item, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-black/40 backdrop-blur-xl border border-[#c8ff00]/10 rounded-3xl p-10 text-center hover:border-[#c8ff00]/30 transition-all duration-500 h-full">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#c8ff00]/20 to-transparent flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <item.icon className="w-10 h-10 text-[#c8ff00]" />
                  </div>
                  <h3 className="text-2xl font-black text-[#c8ff00] mb-4">{item.title}</h3>
                  <p className="text-white/50 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges - Premium Design */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-6">
            {[
              { icon: Shield, text: "30-Day Money Back", color: "#c8ff00" },
              { icon: Heart, text: "100% Natural", color: "#00ff88" },
              { icon: Award, text: "Lab Tested", color: "#c8ff00" },
              { icon: Zap, text: "Fast Shipping", color: "#00ff88" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
                <span className="text-white/70 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rainforest Trust Partnership Section - Premium Design */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 via-black/40 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Emblem and Visual */}
            <div className="text-center md:text-left">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-[60px] scale-150" />
                <img 
                  src="/rainforest-trust-emblem.webp" 
                  alt="Rainforest Trust Conservation Circle Member" 
                  className="w-64 h-64 mx-auto md:mx-0 object-contain relative z-10 drop-shadow-[0_0_40px_rgba(0,255,100,0.4)]"
                />
              </div>
            </div>
            
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-green-600/20 border border-green-500/30">
                <Leaf className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-bold text-sm tracking-wider">CONSERVATION CIRCLE MEMBER</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Proud Partner of{' '}
                <a href="https://www.rainforesttrust.org/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">
                  Rainforest Trust
                  <ExternalLink className="inline w-6 h-6 ml-2" />
                </a>
              </h2>
              
              <p className="text-white/70 text-lg leading-relaxed">
                Rainforest Trust is one of the most efficient and transparent conservation organizations in the world. 
                With a remarkable <span className="text-green-400 font-bold">100% of donations going directly to conservation</span>, 
                they've protected over 50 million acres of critical rainforest habitat.
              </p>
              
              <blockquote className="border-l-4 border-green-500 pl-6 py-4 bg-green-900/20 rounded-r-2xl">
                <p className="text-white/90 italic text-lg leading-relaxed">
                  "At NEON, we believe in giving back to the jungle that bears our fruits. Every can of NEON Original 
                  you buy or sell makes a real difference."
                </p>
                <footer className="text-green-400 font-bold mt-3">— NEON Energy Drink</footer>
              </blockquote>
              
              <div className="flex flex-wrap gap-6">
                {[
                  { icon: Award, text: "4-Star Charity Navigator" },
                  { icon: Shield, text: "100% to Conservation" },
                  { icon: Globe, text: "50M+ Acres Protected" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-white/70">
                    <item.icon className="w-6 h-6 text-green-400" />
                    <span className="font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              
              <a 
                href="https://www.rainforesttrust.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-[0_10px_40px_rgba(0,255,100,0.3)]"
              >
                Learn More About Rainforest Trust
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Photo Gallery */}
      <CustomerPhotoGallery />

      {/* Final CTA - Premium Design */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c8ff00]/10 to-transparent" />
        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to <span className="bg-gradient-to-r from-[#c8ff00] to-[#00ff88] bg-clip-text text-transparent">Feel the Energy?</span>
          </h2>
          <p className="text-xl text-white/50 mb-10">
            Join thousands who've made the switch to clean, natural energy.
          </p>
          <Button
            onClick={handleQuickCheckout}
            className="bg-gradient-to-r from-[#c8ff00] to-[#a8e600] text-black px-14 py-8 rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-[0_10px_60px_rgba(200,255,0,0.5)]"
          >
            <ShoppingCart className="w-7 h-7 mr-3" />
            Pre-Order Now
          </Button>
          <p className="text-sm text-white/30 mt-6">Free shipping on orders over $100</p>
        </div>
      </section>

      {/* Product Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
