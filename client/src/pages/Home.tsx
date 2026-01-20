import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, DollarSign, Clock, TrendingUp, Users, Star, Sparkles, ArrowRight, Gift, Target, Trophy, ChevronDown, Play, Shield, Leaf, Heart } from "lucide-react";
import SocialProofNotifications from "@/components/SocialProofNotifications";
import ViralNewsletterPopup, { shouldShowPopup, markPopupShown } from "@/components/ViralNewsletterPopup";
import Header from "@/components/Header";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [showNewsletter, setShowNewsletter] = useState(false);
  
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
      // Fixed launch date: April 19, 2026
      const launchDate = new Date('2026-04-19T00:00:00');
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
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

  

  return (
    <div className="min-h-screen vice-bg text-white overflow-x-hidden">
      <SEO 
        title="NEON Energy Drink - The Relaunch"
        description="Be part of the NEON Energy Drink relaunch. Pre-order now, join our crowdfunding campaign, or become a franchise partner. Clean, natural energy is coming back."
        image="/og-image.png"
        url="/"
        keywords="NEON energy drink, energy drink relaunch, crowdfunding, franchise opportunity, natural energy, clean energy drink, pre-order"
      />
      
      <SocialProofNotifications />
      <ViralNewsletterPopup open={showNewsletter} onClose={() => setShowNewsletter(false)} />

      <Header />

      {/* Hero Section - Tropical Rainforest Night / Miami Style */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Tropical Night Background - Deep Jungle with Miami Glow */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/vice-city-bg-vibrant.png)' }}
        />
        {/* Jungle Canopy Overlay */}
        <div className="jungle-canopy-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a1a] via-[#0a1a1a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d2818]/40 via-transparent to-[#0a1a1a]" />
        
        {/* Synthwave Grid Floor */}
        <div className="synthwave-grid-bg" />
        
        {/* Floating Neon Orbs - Tropical */}
        <div className="floating-neon-orb green w-96 h-96 top-20 -left-48" style={{ animationDelay: '0s' }} />
        <div className="floating-neon-orb pink w-72 h-72 top-40 -right-36" style={{ animationDelay: '-5s' }} />
        <div className="floating-neon-orb cyan w-64 h-64 bottom-20 left-1/4" style={{ animationDelay: '-10s' }} />
        <div className="floating-neon-orb jungle w-80 h-80 top-1/3 right-1/4" style={{ animationDelay: '-3s' }} />
        
        {/* Firefly Effects */}
        <div className="firefly-field">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="firefly" 
              style={{ 
                left: `${10 + (i * 7) % 80}%`, 
                top: `${15 + (i * 11) % 70}%`,
                animationDelay: `${i * 0.5}s`
              }} 
            />
          ))}
        </div>
        
        {/* Decorative Palm Trees */}
        <img src="/neon-palm-tree.png" alt="" className="palm-tree-left hidden lg:block" />
        <img src="/neon-palm-tree.png" alt="" className="palm-tree-right hidden lg:block" />
        
        {/* Corner Accents */}
        <div className="corner-accent-tl" />
        <div className="corner-accent-br" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20">
                <span className="w-2 h-2 rounded-full bg-[#c8ff00] animate-pulse" />
                <span className="text-sm font-medium text-[#c8ff00]">THE RELAUNCH IS COMING</span>
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
                      <div className="bg-black/50 rounded-xl p-3 border border-[#c8ff00]/10">
                        <span className="text-3xl md:text-4xl font-black text-[#c8ff00] font-vice">
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
                  className="bg-[#c8ff00] hover:bg-[#d4ff33] text-black font-bold px-8 h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(200,255,0,0.4)] hover:shadow-[0_0_30px_rgba(200,255,0,0.6)] transition-all"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  BACK THE RELAUNCH
                </Button>
                <Button
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold px-8 h-14 text-lg rounded-xl"
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
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 border-2 border-black flex items-center justify-center text-xs font-bold text-[#c8ff00]"
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

            {/* Right - Product Showcase with Vice City Blending */}
            <div className={`relative ${isVisible ? 'animate-fade-in delay-300' : 'opacity-0'}`}>
              {/* Vice City Glow Effect - Blends with can */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-96 h-96 bg-gradient-to-br from-[#c8ff00]/15 via-[#00ffff]/05 to-[#ff0080]/05 rounded-full blur-[100px] animate-glow-pulse" />
              </div>
              
              {/* Product Image - Seamless Background Blend */}
              <div className="relative z-10 flex justify-center">
                {/* Multi-layer Ambient Glow for Seamless Blending */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-[#c8ff00]/20 via-[#c8ff00]/08 to-transparent rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#c8ff00]/10 rounded-full blur-[60px] pointer-events-none animate-glow-pulse" />
                
                {/* Main Can - Transparent Background */}
                <img
                  src="/neon-original-can.png"
                  alt="NEON Energy Drink Original - Green"
                  className="h-[450px] md:h-[550px] object-contain product-glow animate-float relative z-10"
                  style={{ filter: 'drop-shadow(0 0 80px rgba(184, 230, 0, 0.7)) drop-shadow(0 0 150px rgba(184, 230, 0, 0.4)) drop-shadow(0 40px 80px rgba(0, 0, 0, 0.6))' }}
                />
              </div>

              {/* Fresh New Can Design Label - Below the can, bottom right */}
              <div className="absolute bottom-8 right-0 z-20">
                <div className="bg-gradient-to-r from-[#c8ff00] to-[#00ffff] text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg shadow-[#c8ff00]/30 animate-pulse">
                  ✨ FRESH NEW CAN DESIGN
                </div>
              </div>

              {/* Floating Stats - Vice City Style */}
              <div className="absolute top-20 right-0 glass-card-vice rounded-xl p-4 animate-float-slow" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ffff]/30 to-[#00ffff]/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-[#00ffff]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">150mg</p>
                    <p className="text-xs text-white/50">Natural Caffeine</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-32 left-0 glass-card-vice rounded-xl p-4 animate-float-slow" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-[#c8ff00]" />
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

        {/* Scroll Indicator - Clickable with smooth scroll */}
        <button 
          onClick={() => document.getElementById('crowdfunding-section')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce cursor-pointer hover:scale-110 transition-transform group"
          aria-label="Scroll to next section"
        >
          <span className="text-xs text-white/40 font-medium group-hover:text-[#c8ff00] transition-colors">SCROLL</span>
          <ChevronDown className="w-5 h-5 text-[#c8ff00]/50 group-hover:text-[#c8ff00] transition-colors" />
        </button>
      </section>

      {/* Funding Progress Section - Vice City Style */}
      <section id="crowdfunding-section" className="py-20 relative scroll-mt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ff0080]/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ffff]/3 via-transparent to-[#9d4edd]/3" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="glass-card-neon rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  <span className="text-white">CROWDFUNDING</span>
                  <br />
                  <span className="text-[#c8ff00]">PROGRESS</span>
                </h2>
                <p className="text-white/60 mb-8">
                  Help us bring NEON back. Every contribution brings us closer to the relaunch.
                </p>
                
                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-white/60 text-sm">Raised</span>
                    <span className="text-[#c8ff00] font-bold">{fundingProgress.toFixed(0)}%</span>
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
                    <p className="text-2xl md:text-3xl font-black text-[#c8ff00]">
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
                        ? "border-[#c8ff00]/50 bg-[#c8ff00]/5" 
                        : "border-white/10 bg-white/5 hover:border-[#c8ff00]/30"
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
                        <span className="text-2xl font-black text-[#c8ff00]">${tier.price}</span>
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
      <section className="py-20 relative overflow-hidden">
        {/* Background Graphics */}
        <div className="absolute inset-0 section-bg-gradient-2" />
        <div className="floating-neon-orb purple w-80 h-80 -top-40 -right-40" style={{ animationDelay: '-7s' }} />
        <div className="floating-neon-orb green w-60 h-60 bottom-0 -left-30" style={{ animationDelay: '-12s' }} />
        
        {/* Neon Lines */}
        <div className="neon-line-horizontal w-1/3 left-0 top-1/4" />
        <div className="neon-line-horizontal w-1/4 right-0 bottom-1/3" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-neon mb-4 inline-block">WHY NEON</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              ENERGY <span className="text-[#c8ff00]">REIMAGINED</span>
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
        <div className="absolute inset-0 section-bg-gradient-3" />
        
        {/* Neon Cityscape Background */}
        <div className="neon-cityscape-bg" />
        
        {/* Subtle Background Accents */}
        <div className="floating-neon-orb cyan w-80 h-80 -right-40 top-1/4" style={{ animationDelay: '-3s' }} />
        <div className="floating-neon-orb purple w-60 h-60 -left-40 bottom-1/4" style={{ animationDelay: '-8s' }} />
        
        {/* Decorative Lines */}
        <div className="neon-line-vertical h-1/2 left-10 top-1/4 hidden lg:block" />
        <div className="neon-line-vertical h-1/3 right-10 bottom-1/4 hidden lg:block" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="badge-neon mb-4 inline-block">WHAT'S INSIDE</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              NATURAL <span className="text-[#c8ff00]">INGREDIENTS</span>
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Every can of NEON is packed with premium, natural ingredients for clean, sustained energy.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                image: "/images/passion-fruit.jpg",
                name: "Passion Fruit",
                benefit: "Heart health support with vitamins A, B6, B12 & C",
              },
              {
                image: "/images/prickly-pear.jpg",
                name: "Prickly Pear",
                benefit: "Blood glucose regulation with natural pectin & fiber",
              },
              {
                image: "/images/green-tea-leaves.jpg",
                name: "Green Tea Extract",
                benefit: "150mg natural caffeine with powerful antioxidants",
              },
              {
                image: "/images/blueberries.png",
                name: "Blueberry",
                benefit: "Vitamin C & antioxidants for immune support",
              },
            ].map((ingredient, i) => (
              <div
                key={i}
                className="group text-center"
              >
                <div className="relative mb-6 mx-auto w-40 h-40">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-[#c8ff00]/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Image Container */}
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#c8ff00]/30 group-hover:border-[#c8ff00] transition-all duration-300 shadow-lg">
                    <img
                      src={ingredient.image}
                      alt={ingredient.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  

                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#c8ff00] transition-colors">
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
              <span className="text-[#c8ff00] font-bold">Zero artificial ingredients.</span> Just pure, natural energy.
            </p>
          </div>
        </div>
      </section>

      {/* Franchise CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/10 via-transparent to-[#9d4edd]/10" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-neon mb-4 inline-block">BUSINESS OPPORTUNITY</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                OWN YOUR <span className="text-[#c8ff00]">TERRITORY</span>
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
                    <stat.icon className="w-5 h-5 text-[#c8ff00] mb-2" />
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
                  className="btn-shiny text-[#c8ff00] font-bold px-8 h-12 rounded-xl"
                >
                  VIEW COMP PLAN
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 bg-[#c8ff00]/10 rounded-full blur-[60px]" />
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
              WHAT PEOPLE <span className="text-[#c8ff00]">SAY</span>
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
                    <Star key={star} className="w-4 h-4 fill-[#c8ff00] text-[#c8ff00]" />
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/5 via-transparent to-[#c8ff00]/5" />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                READY TO <span className="text-[#c8ff00]">JOIN?</span>
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
                  className="btn-shiny text-[#c8ff00] font-bold px-8 h-14 text-lg rounded-xl"
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
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c8ff00] to-[#a8e000] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-black font-vice text-[#c8ff00]">NEON®</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Clean energy for a new generation. Join the movement and fuel your potential.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">COMPANY</h4>
              <div className="space-y-3">
                {["About", "Products", "Franchise", "Blog"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#c8ff00] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">SUPPORT</h4>
              <div className="space-y-3">
                {["FAQ", "Contact", "Shipping", "Returns"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#c8ff00] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">LEGAL</h4>
              <div className="space-y-3">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                  <button key={item} className="block text-white/50 hover:text-[#c8ff00] transition-colors text-sm">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Logos & Certifications */}
          <div className="border-t border-[#c8ff00]/10 pt-8 mb-8">
            <div className="flex flex-col items-center gap-6">
              {/* Disney Partnership */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-[#00ffff] text-xs font-semibold tracking-wider">AS SEEN ON</p>
                <div className="flex items-center gap-3 bg-gradient-to-r from-[#1a1a2e]/80 to-[#16213e]/80 px-6 py-3 rounded-xl border border-[#00ffff]/30">
                  <span className="text-2xl font-black bg-gradient-to-r from-[#00ffff] via-[#c8ff00] to-[#ff0080] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                    Disney®
                  </span>
                </div>
                <p className="text-[#c8ff00] text-xs font-bold mt-1">NEON Energy Drink® — Official Advertising Partner of Disney Campaign Manager</p>
              </div>
              
              {/* Certifications Row */}
              <div className="flex flex-wrap justify-center items-center gap-6">
                {/* Rainforest Alliance */}
                <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                  <div className="w-8 h-8 rounded-full bg-[#00a651] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[#00a651] text-xs font-bold">RAINFOREST ALLIANCE</p>
                    <p className="text-white/50 text-[10px]">Certified Supporter</p>
                  </div>
                </div>
                
                {/* Non-GMO */}
                <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                  <div className="w-8 h-8 rounded-full bg-[#f5a623] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">NON</span>
                  </div>
                  <div>
                    <p className="text-[#f5a623] text-xs font-bold">NON-GMO</p>
                    <p className="text-white/50 text-[10px]">Verified</p>
                  </div>
                </div>
                
                {/* Vegan */}
                <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                  <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center">
                    <span className="text-black text-xs font-bold">V</span>
                  </div>
                  <div>
                    <p className="text-[#c8ff00] text-xs font-bold">100% VEGAN</p>
                    <p className="text-white/50 text-[10px]">Plant-Based</p>
                  </div>
                </div>
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
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/50 hover:text-[#c8ff00] hover:bg-[#c8ff00]/10 transition-all"
                >
                  <span className="text-xs font-bold">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Trademark Statement */}
          <div className="mt-6 pt-4 border-t border-[#c8ff00]/5">
            <p className="text-white/30 text-[10px] text-center leading-relaxed">
              Disney® is a registered trademark of The Walt Disney Company. NEON Energy Drink® is a registered trademark of Neon Corporation. 
              All other trademarks, service marks, and logos are the property of their respective owners. 
              Use of third-party trademarks does not imply endorsement or affiliation unless expressly stated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
