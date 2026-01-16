import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, DollarSign, Clock, TrendingUp, Users, Star, Sparkles, ArrowRight, Gift, Target, Trophy, Menu, X, ChevronDown, Play, Shield, Leaf, Heart } from "lucide-react";
import SocialProofNotifications from "@/components/SocialProofNotifications";
import ViralNewsletterPopup, { shouldShowPopup, markPopupShown } from "@/components/ViralNewsletterPopup";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const crowdfundingStats = trpc.crowdfunding.stats.useQuery();

  useEffect(() => {
    setIsVisible(true);
    
    const newsletterTimer = setTimeout(() => {
      if (shouldShowPopup()) {
        setShowNewsletter(true);
      }
    }, 5000);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
    const calculateTimeLeft = () => {
      const launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + 90);
      
      const difference = launchDate.getTime() - new Date().getTime();
      
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => {
      clearTimeout(newsletterTimer);
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fundingProgress = crowdfundingStats.data 
    ? Math.min((crowdfundingStats.data.totalRaised / crowdfundingStats.data.goal) * 100, 100)
    : 35;

  const navItems = [
    { label: "HOME", path: "/" },
    { label: "STORY", path: "/about" },
    { label: "PRODUCTS", path: "/shop" },
    { label: "CELEBRITIES", path: "/celebrities" },
    { label: "FRANCHISE", path: "/franchise" },
    { label: "COMPENSATION", path: "/compensation" },
  ];

  return (
    <div className="min-h-screen vice-bg text-white overflow-x-hidden">
      <SEO 
        title="NEON Energy Drink - The Relaunch"
        description="Be part of the NEON Energy Drink relaunch. Pre-order now, join our crowdfunding campaign, or become a franchise partner. Clean, natural energy is coming back."
        keywords="NEON energy drink, energy drink relaunch, crowdfunding, franchise opportunity, natural energy, clean energy drink, pre-order"
        url="/"
      />
      
      <SocialProofNotifications />
      <ViralNewsletterPopup open={showNewsletter} onClose={() => setShowNewsletter(false)} />

      {/* Premium Glass Header */}
      <header 
        className="fixed top-0 w-full z-50 transition-all duration-500"
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(10, 10, 18, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(184, 230, 0, 0.1)' : 'none',
        }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setLocation("/")}
            >
              <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#b8e600] to-[#8fb800] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(184,230,0,0.3)] transition-all duration-300">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="text-2xl font-black tracking-tight font-vice">
                <span className="text-[#b8e600]">NEON</span>
                <span className="text-white/80 text-sm ml-1">®</span>
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                    item.path === "/" 
                      ? "text-[#b8e600] bg-[#b8e600]/10" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setLocation("/join")}
                variant="outline"
                className="hidden md:flex border-[#b8e600]/30 text-[#b8e600] hover:bg-[#b8e600]/10 font-semibold h-10 px-5"
              >
                JOIN NOW
              </Button>
              <Button
                onClick={() => setLocation("/crowdfund")}
                className="btn-primary-shiny text-black font-bold px-6 h-10 rounded-lg"
              >
                BACK US
              </Button>
              
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/80 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 fixed top-[72px] left-0 right-0 z-40"
            >
              <nav className="container mx-auto px-6 py-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 text-left text-white/80 hover:text-[#b8e600] hover:bg-white/5 rounded-lg transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 animated-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#b8e600]/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#9d4edd]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        
        {/* Liquid Splash Effects */}
        <img 
          src="/images/green-splash-1.png" 
          alt="" 
          className="absolute -left-20 top-1/3 w-64 h-auto opacity-40 animate-float-slow pointer-events-none"
          style={{ animationDelay: "0.5s" }}
        />
        <img 
          src="/images/green-splash-2.png" 
          alt="" 
          className="absolute -right-10 bottom-1/4 w-48 h-auto opacity-30 animate-float pointer-events-none"
          style={{ animationDelay: "1.5s" }}
        />
        <img 
          src="/images/water-splash.png" 
          alt="" 
          className="absolute right-1/4 top-20 w-32 h-auto opacity-20 animate-pulse pointer-events-none"
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#b8e600]/10 border border-[#b8e600]/20">
                <span className="w-2 h-2 rounded-full bg-[#b8e600] animate-pulse" />
                <span className="text-sm font-medium text-[#b8e600]">THE RELAUNCH IS COMING</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tight">
                <span className="text-white">FUEL YOUR</span>
                <br />
                <span className="gradient-text font-vice">POTENTIAL</span>
              </h1>

              <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                Clean energy. Natural ingredients. Zero compromise. 
                Join the movement and be part of the NEON revolution.
              </p>

              {/* Countdown Timer */}
              <div className="glass-card-neon rounded-2xl p-6 max-w-md">
                <p className="text-sm text-white/50 mb-4 font-medium">OFFICIAL RELAUNCH IN</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { value: timeLeft.days, label: "DAYS" },
                    { value: timeLeft.hours, label: "HRS" },
                    { value: timeLeft.minutes, label: "MIN" },
                    { value: timeLeft.seconds, label: "SEC" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="bg-black/50 rounded-xl p-3 border border-[#b8e600]/10">
                        <span className="text-3xl md:text-4xl font-black text-[#b8e600] font-vice">
                          {String(item.value).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 mt-2 block font-semibold">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setLocation("/crowdfund")}
                  className="btn-primary-shiny text-black font-bold px-8 h-14 text-lg rounded-xl"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  BACK THE RELAUNCH
                </Button>
                <Button
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="btn-shiny text-[#b8e600] font-bold px-8 h-14 text-lg rounded-xl"
                >
                  <Play className="w-5 h-5 mr-2" />
                  PRE-ORDER NOW
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#b8e600]/30 to-[#b8e600]/10 border-2 border-black flex items-center justify-center text-xs font-bold text-[#b8e600]"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-white font-semibold">2,847+ Backers</p>
                  <p className="text-white/50 text-sm">Already joined the movement</p>
                </div>
              </div>
            </div>

            {/* Right - Product Showcase */}
            <div className={`relative ${isVisible ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
              {/* Glow Effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-[#b8e600]/10 rounded-full blur-[80px] animate-pulse" />
              </div>
              
              {/* Product Image with Splash Effect */}
              <div className="relative z-10 flex justify-center">
                {/* Background Splash */}
                <img 
                  src="/images/energy-splash.png" 
                  alt="" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-auto opacity-60 animate-pulse pointer-events-none"
                />
                
                {/* Floating Fruits */}
                <img 
                  src="/images/lime-splash.jpg" 
                  alt="Fresh limes" 
                  className="absolute -left-8 top-1/4 w-24 h-24 object-cover rounded-full border-2 border-[#b8e600]/30 shadow-lg animate-float-slow"
                  style={{ animationDelay: "0.3s" }}
                />
                <img 
                  src="/images/apple-splash.jpg" 
                  alt="Green apple" 
                  className="absolute -right-4 bottom-1/3 w-20 h-20 object-cover rounded-full border-2 border-[#b8e600]/30 shadow-lg animate-float"
                  style={{ animationDelay: "0.8s" }}
                />
                
                {/* Main Can */}
                <img
                  src="/neon-can.png"
                  alt="NEON Energy Drink Can"
                  className="h-[500px] md:h-[600px] object-contain product-glow animate-float relative z-10"
                />
              </div>

              {/* Floating Stats */}
              <div className="absolute top-20 right-0 glass-card rounded-xl p-4 animate-float-slow" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#b8e600]/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#b8e600]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">150mg</p>
                    <p className="text-xs text-white/50">Natural Caffeine</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-32 left-0 glass-card rounded-xl p-4 animate-float-slow" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">0g</p>
                    <p className="text-xs text-white/50">Added Sugar</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-white/40 font-medium">SCROLL</span>
          <ChevronDown className="w-5 h-5 text-[#b8e600]/50" />
        </div>
      </section>

      {/* Funding Progress Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#b8e600]/5 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="glass-card-neon rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  <span className="text-white">CROWDFUNDING</span>
                  <br />
                  <span className="text-[#b8e600]">PROGRESS</span>
                </h2>
                <p className="text-white/60 mb-8">
                  Help us bring NEON back. Every contribution brings us closer to the relaunch.
                </p>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60 text-sm">Raised</span>
                    <span className="text-[#b8e600] font-bold">{fundingProgress.toFixed(0)}%</span>
                  </div>
                  <div className="progress-neon h-4 rounded-full">
                    <div 
                      className="progress-neon-bar h-full"
                      style={{ width: `${fundingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="stat-card text-center">
                    <p className="text-2xl md:text-3xl font-black text-[#b8e600]">
                      ${((crowdfundingStats.data?.totalRaised || 175000) / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-white/50 mt-1">RAISED</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="text-2xl md:text-3xl font-black text-white">
                      {crowdfundingStats.data?.totalBackers || 2847}
                    </p>
                    <p className="text-xs text-white/50 mt-1">BACKERS</p>
                  </div>
                  <div className="stat-card text-center">
                    <p className="text-2xl md:text-3xl font-black text-white">
                      $500K
                    </p>
                    <p className="text-xs text-white/50 mt-1">GOAL</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-6">REWARD TIERS</h3>
                {[
                  { name: "Early Bird", price: 25, reward: "6-Pack + Exclusive Sticker", popular: false },
                  { name: "Supporter", price: 50, reward: "12-Pack + T-Shirt + Sticker", popular: true },
                  { name: "Champion", price: 100, reward: "24-Pack + Hoodie + VIP Access", popular: false },
                ].map((tier, i) => (
                  <div
                    key={i}
                    onClick={() => setLocation("/crowdfund")}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover-lift ${
                      tier.popular 
                        ? "border-[#b8e600]/50 bg-[#b8e600]/5" 
                        : "border-white/10 bg-white/5 hover:border-[#b8e600]/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tier.name}</span>
                          {tier.popular && (
                            <span className="badge-neon text-[10px]">POPULAR</span>
                          )}
                        </div>
                        <p className="text-sm text-white/50 mt-1">{tier.reward}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-[#b8e600]">${tier.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button
                  onClick={() => setLocation("/crowdfund")}
                  className="w-full btn-primary-shiny text-black font-bold h-12 rounded-xl mt-4"
                >
                  VIEW ALL TIERS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="badge-neon mb-4 inline-block">WHY NEON</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              ENERGY <span className="text-[#b8e600]">REIMAGINED</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We're not just another energy drink. We're a movement towards cleaner, smarter energy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Leaf,
                title: "100% Natural",
                description: "No artificial colors, flavors, or preservatives. Just pure, clean energy from nature.",
                color: "from-green-500/20 to-green-500/5"
              },
              {
                icon: Shield,
                title: "Science-Backed",
                description: "Formulated with optimal doses of caffeine, taurine, and B-vitamins for sustained energy.",
                color: "from-blue-500/20 to-blue-500/5"
              },
              {
                icon: Heart,
                title: "No Crash",
                description: "Smooth, sustained energy without the jitters or afternoon crash. Feel good all day.",
                color: "from-pink-500/20 to-pink-500/5"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`glass-card rounded-2xl p-8 hover-lift ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Natural Ingredients Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#b8e600]/5 to-transparent" />
        
        {/* Decorative Splashes */}
        <img 
          src="/images/green-splash-1.png" 
          alt="" 
          className="absolute -right-20 top-0 w-80 h-auto opacity-20 rotate-180 pointer-events-none"
        />
        <img 
          src="/images/water-splash.png" 
          alt="" 
          className="absolute -left-10 bottom-0 w-60 h-auto opacity-15 pointer-events-none"
        />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-neon mb-4 inline-block">WHAT'S INSIDE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              NATURAL <span className="text-[#b8e600]">INGREDIENTS</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every can of NEON is packed with premium, natural ingredients for clean, sustained energy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                image: "/images/lime-splash.jpg",
                name: "Fresh Lime",
                benefit: "Natural citrus flavor with vitamin C boost",
              },
              {
                image: "/images/apple-splash.jpg",
                name: "Green Apple",
                benefit: "Crisp, refreshing taste with natural sweetness",
              },
              {
                image: "/images/citrus-slices.png",
                name: "Citrus Blend",
                benefit: "Energizing citrus complex for mental clarity",
              },
              {
                image: "/images/green-apple-splash.jpg",
                name: "Natural Caffeine",
                benefit: "150mg from green tea for smooth energy",
              },
            ].map((ingredient, i) => (
              <div
                key={i}
                className="group text-center"
              >
                <div className="relative mb-6 mx-auto w-40 h-40">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-[#b8e600]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image Container */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#b8e600]/30 group-hover:border-[#b8e600] transition-all duration-300 shadow-lg">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Floating Particles */}
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#b8e600] rounded-full opacity-60 animate-ping" style={{ animationDuration: "2s" }} />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-[#b8e600] rounded-full opacity-40 animate-ping" style={{ animationDuration: "3s", animationDelay: "0.5s" }} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#b8e600] transition-colors">
                  {ingredient.name}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {ingredient.benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Tagline */}
          <div className="text-center mt-16">
            <p className="text-lg text-white/80 font-medium">
              <span className="text-[#b8e600] font-bold">Zero artificial ingredients.</span> Just pure, natural energy.
            </p>
          </div>
        </div>
      </section>

      {/* Franchise CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#b8e600]/10 via-transparent to-[#9d4edd]/10" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-neon mb-4 inline-block">BUSINESS OPPORTUNITY</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                OWN YOUR <span className="text-[#b8e600]">TERRITORY</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Become a NEON micro-franchise partner. Get exclusive vending machine rights 
                in your area with our revolutionary AI-powered dispensing technology.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: MapPin, label: "Territory Rights", value: "Exclusive" },
                  { icon: DollarSign, label: "Starting From", value: "$2,500" },
                  { icon: TrendingUp, label: "Avg. ROI", value: "180%" },
                  { icon: Users, label: "Support", value: "24/7" },
                ].map((stat, i) => (
                  <div key={i} className="stat-card">
                    <stat.icon className="w-5 h-5 text-[#b8e600] mb-2" />
                    <p className="text-xs text-white/50">{stat.label}</p>
                    <p className="text-lg font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setLocation("/franchise")}
                  className="btn-primary-shiny text-black font-bold px-8 h-12 rounded-xl"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  EXPLORE TERRITORIES
                </Button>
                <Button
                  onClick={() => setLocation("/compensation")}
                  variant="outline"
                  className="btn-shiny text-[#b8e600] font-bold px-8 h-12 rounded-xl"
                >
                  VIEW COMP PLAN
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-[#b8e600]/10 rounded-full blur-[60px]" />
              </div>
              <img
                src="/vending-machine.jpeg"
                alt="NEON AI Vending Machine"
                className="relative z-10 rounded-2xl shadow-2xl product-glow max-h-[500px] mx-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="badge-neon mb-4 inline-block">TESTIMONIALS</span>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              WHAT PEOPLE <span className="text-[#b8e600]">SAY</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "NEON is the only energy drink that doesn't make me crash. I've been waiting for the relaunch!",
                author: "Sarah M.",
                role: "Fitness Instructor"
              },
              {
                quote: "The franchise opportunity is incredible. I've already secured my territory and can't wait to start.",
                author: "Marcus T.",
                role: "Entrepreneur"
              },
              {
                quote: "Clean ingredients, great taste, and real energy. This is what the market has been missing.",
                author: "Jennifer K.",
                role: "Nutritionist"
              },
            ].map((testimonial, i) => (
              <div key={i} className="glass-card rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-[#b8e600] text-[#b8e600]" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-white">{testimonial.author}</p>
                  <p className="text-sm text-white/50">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="glass-card-neon rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#b8e600]/5 via-transparent to-[#b8e600]/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                READY TO <span className="text-[#b8e600]">JOIN?</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                Whether you want to pre-order, back our crowdfunding, or become a franchise partner, 
                there's a place for you in the NEON family.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => setLocation("/shop")}
                  className="btn-primary-shiny text-black font-bold px-8 h-14 text-lg rounded-xl"
                >
                  PRE-ORDER NOW
                </Button>
                <Button
                  onClick={() => setLocation("/join")}
                  variant="outline"
                  className="btn-shiny text-[#b8e600] font-bold px-8 h-14 text-lg rounded-xl"
                >
                  BECOME A PARTNER
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#b8e600] to-[#8fb800] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-black font-vice text-[#b8e600]">NEON®</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Clean energy for a new generation. Join the movement and fuel your potential.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">COMPANY</h4>
              <div className="space-y-3">
                {["About", "Products", "Franchise", "Blog"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#b8e600] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">SUPPORT</h4>
              <div className="space-y-3">
                {["FAQ", "Contact", "Shipping", "Returns"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#b8e600] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">LEGAL</h4>
              <div className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#b8e600] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="neon-divider mb-8" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2026 NEON Energy Drink. All rights reserved.
            </p>
            <div className="flex gap-4">
              {["Twitter", "Instagram", "Facebook", "YouTube"].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-[#b8e600] hover:bg-[#b8e600]/10 transition-all"
                >
                  <span className="text-xs font-bold">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
