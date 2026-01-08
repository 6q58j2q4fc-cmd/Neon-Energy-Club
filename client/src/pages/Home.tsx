import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, DollarSign, Clock, TrendingUp, Users, Star, Play, ChevronDown, ArrowRight, Sparkles } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    
    const calculateTimeLeft = () => {
      const launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + 90);
      
      const difference = launchDate.getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Premium Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-500" style={{
        backgroundColor: scrollY > 50 ? 'rgba(0,0,0,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(200,255,0,0.1)' : 'none',
      }}>
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#c8ff00] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              NEON<span className="text-[#c8ff00]">®</span>
            </h1>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <button onClick={() => setLocation("/")} className="text-[#c8ff00] font-medium text-sm tracking-wide">
              HOME
            </button>
            <button onClick={() => setLocation("/about")} className="text-white/70 hover:text-[#c8ff00] font-medium text-sm tracking-wide transition-colors">
              STORY
            </button>
            <button onClick={() => setLocation("/products")} className="text-white/70 hover:text-[#c8ff00] font-medium text-sm tracking-wide transition-colors">
              PRODUCTS
            </button>
            <button onClick={() => setLocation("/celebrities")} className="text-white/70 hover:text-[#c8ff00] font-medium text-sm tracking-wide transition-colors">
              CELEBRITIES
            </button>
            <button onClick={() => setLocation("/franchise")} className="text-white/70 hover:text-[#c8ff00] font-medium text-sm tracking-wide transition-colors">
              FRANCHISE
            </button>
            <Button
              onClick={() => setLocation("/crowdfund")}
              className="bg-[#c8ff00] text-black hover:bg-white font-bold px-6 rounded-full transition-all duration-300 hover:scale-105"
            >
              BACK US NOW
            </Button>
            {user && user.role === "admin" && (
              <Button variant="outline" className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black rounded-full" onClick={() => setLocation("/admin")}>
                Admin
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section - Cinematic */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a1a00] to-black"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#c8ff00] rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c8ff00] rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `linear-gradient(rgba(200,255,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.3) 1px, transparent 1px)`,
          backgroundSize: '100px 100px',
        }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-sm font-medium text-[#c8ff00]">THE LEGEND RETURNS</span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tight">
                <span className="text-white">THE</span>
                <br />
                <span className="text-[#c8ff00] drop-shadow-[0_0_60px_rgba(200,255,0,0.5)]">ENERGY</span>
                <br />
                <span className="text-white">IS BACK</span>
              </h2>
              
              <p className="text-xl text-white/60 max-w-lg leading-relaxed">
                After years of anticipation, NEON Energy Drink returns with a revolutionary formula. 
                Be among the first to experience the relaunch.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setLocation("/crowdfund")}
                  className="bg-[#c8ff00] text-black hover:bg-white font-bold px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(200,255,0,0.4)]"
                >
                  Back the Relaunch
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={() => setLocation("/franchise")}
                  variant="outline"
                  className="border-2 border-white/20 text-white hover:border-[#c8ff00] hover:text-[#c8ff00] font-bold px-8 py-6 text-lg rounded-full transition-all duration-300 bg-transparent"
                >
                  Franchise Opportunities
                </Button>
              </div>
            </div>

            {/* Right - Product Showcase */}
            <div className={`relative ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#c8ff00] blur-[100px] opacity-30 scale-75"></div>
                
                {/* Can Image */}
                <img
                  src="/neon-can.png"
                  alt="NEON Energy Drink"
                  className="relative z-10 w-full max-w-lg mx-auto drop-shadow-[0_0_80px_rgba(200,255,0,0.3)] animate-float"
                />
                
                {/* New Design Badge */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="bg-[#c8ff00] text-black px-6 py-3 rounded-full font-black text-sm tracking-wider shadow-[0_0_30px_rgba(200,255,0,0.5)]">
                    ✦ NEW FORMULA ✦
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className={`mt-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-[#c8ff00]" />
              <span className="text-white/60 font-medium tracking-wide">OFFICIAL RELAUNCH IN</span>
            </div>
            <div className="flex justify-center gap-4 md:gap-8">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HOURS' },
                { value: timeLeft.minutes, label: 'MINS' },
                { value: timeLeft.seconds, label: 'SECS' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-[#c8ff00]/20 rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[120px] shadow-[0_0_30px_rgba(200,255,0,0.1)]">
                    <div className="text-4xl md:text-6xl font-black text-[#c8ff00] tabular-nums drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">
                      {String(item.value).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-white/40 mt-3 font-medium tracking-widest">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 text-[#c8ff00]/50" />
          </div>
        </div>
      </section>

      {/* Crowdfunding Section - Premium */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#050a00] to-black"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#c8ff00] font-medium tracking-widest text-sm">CROWDFUNDING CAMPAIGN</span>
            <h3 className="text-5xl md:text-7xl font-black mt-4 mb-6">
              FUEL THE <span className="text-[#c8ff00]">COMEBACK</span>
            </h3>
            <p className="text-xl text-white/50 max-w-2xl mx-auto">
              Join thousands of backers making energy drink history. Every contribution brings us closer to the relaunch.
            </p>
          </div>

          {/* Campaign Progress */}
          <Card className="bg-gradient-to-r from-[#0a0a0a] to-[#0f1a00] border-[#c8ff00]/20 mb-16 overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-4 gap-8 mb-8">
                <div className="text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-black text-[#c8ff00]">$487K</div>
                  <div className="text-white/50 mt-2">Raised</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-black text-white">2,847</div>
                  <div className="text-white/50 mt-2">Backers</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-black text-white">48%</div>
                  <div className="text-white/50 mt-2">Funded</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-5xl md:text-6xl font-black text-white">90</div>
                  <div className="text-white/50 mt-2">Days Left</div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#c8ff00] to-[#a8d600] rounded-full transition-all duration-1000 relative"
                    style={{ width: '48%' }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between mt-3 text-sm text-white/40">
                  <span>$0</span>
                  <span className="text-[#c8ff00] font-bold">Goal: $1,000,000</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Tiers */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'SUPPORTER', price: 25, desc: 'Perfect for first-time backers', items: ['1 Limited Edition Can', 'Digital Thank You Card', 'Backer Badge'] },
              { name: 'ENERGIZER', price: 100, desc: 'Our most popular tier', items: ['1 Case (24 Cans)', 'Limited Edition T-Shirt', 'Exclusive Poster', 'VIP Status'], popular: true },
              { name: 'VIP INSIDER', price: 500, desc: 'For true NEON believers', items: ['5 Cases (120 Cans)', 'Full Merch Pack', 'Name on Website', 'Lifetime 20% Off'] },
            ].map((tier, i) => (
              <Card 
                key={i}
                className={`bg-[#0a0a0a] border-2 transition-all duration-300 hover:scale-105 cursor-pointer group ${
                  tier.popular ? 'border-[#c8ff00] shadow-[0_0_40px_rgba(200,255,0,0.2)]' : 'border-white/10 hover:border-[#c8ff00]/50'
                }`}
                onClick={() => setLocation("/crowdfund")}
              >
                {tier.popular && (
                  <div className="bg-[#c8ff00] text-black text-center py-2 font-bold text-sm tracking-wider">
                    MOST POPULAR
                  </div>
                )}
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-[#c8ff00]">{tier.name}</CardTitle>
                  <CardDescription className="text-white/50">{tier.desc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-5xl font-black text-white">${tier.price}</div>
                  <ul className="space-y-3">
                    {tier.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-white/70">
                        <div className="w-5 h-5 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                          <Zap className="w-3 h-3 text-[#c8ff00]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full bg-white/10 hover:bg-[#c8ff00] text-white hover:text-black font-bold rounded-full transition-all duration-300 group-hover:bg-[#c8ff00] group-hover:text-black">
                    Select Tier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => setLocation("/crowdfund")}
              className="bg-[#c8ff00] text-black hover:bg-white font-bold px-12 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
            >
              View All Reward Tiers
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Franchise Section - Premium */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-[#050a00]"></div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute inset-0 bg-[#c8ff00] blur-[80px] opacity-20 scale-75"></div>
              <img
                src="/vending-machine.jpg"
                alt="NEON AI Vending Machine"
                className="relative z-10 rounded-3xl shadow-2xl border border-[#c8ff00]/20"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#c8ff00] text-black px-6 py-4 rounded-2xl font-bold shadow-[0_0_40px_rgba(200,255,0,0.3)]">
                <div className="text-3xl font-black">$75+</div>
                <div className="text-sm opacity-70">per sq mi/month</div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8 order-1 lg:order-2">
              <span className="text-[#c8ff00] font-medium tracking-widest text-sm">FRANCHISE OPPORTUNITY</span>
              <h3 className="text-5xl md:text-6xl font-black leading-tight">
                OWN YOUR <span className="text-[#c8ff00]">TERRITORY</span>
              </h3>
              <p className="text-xl text-white/50 leading-relaxed">
                Secure exclusive licensing rights for NEON's revolutionary AI-powered vending machines. 
                Lock in prime territories and build a profitable franchise business.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: 'AI-Powered', desc: 'Smart inventory' },
                  { icon: MapPin, label: 'Exclusive', desc: 'Territory rights' },
                  { icon: DollarSign, label: 'Flexible', desc: 'Financing options' },
                  { icon: TrendingUp, label: 'High ROI', desc: 'Proven model' },
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#c8ff00]/30 transition-colors">
                    <item.icon className="w-8 h-8 text-[#c8ff00] mb-3" />
                    <div className="font-bold text-white">{item.label}</div>
                    <div className="text-sm text-white/50">{item.desc}</div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setLocation("/franchise")}
                className="bg-[#c8ff00] text-black hover:bg-white font-bold px-10 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
              >
                Explore Territory Map
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 border-y border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: '48', label: 'States Covered' },
              { value: '14', label: 'Countries' },
              { value: '15%', label: 'Global Reach' },
              { value: '100+', label: 'Celebrity Fans' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-6xl font-black text-[#c8ff00] mb-2">{stat.value}</div>
                <div className="text-white/50 font-medium tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebrity Section Teaser */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a00] to-black"></div>
        
        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <Star className="w-12 h-12 text-[#c8ff00] mx-auto mb-6" />
          <h3 className="text-5xl md:text-6xl font-black mb-6">
            LOVED BY <span className="text-[#c8ff00]">CELEBRITIES</span>
          </h3>
          <p className="text-xl text-white/50 mb-10 max-w-2xl mx-auto">
            From A-list music videos to blockbuster events, NEON has been featured alongside the world's biggest stars.
          </p>
          <Button
            onClick={() => setLocation("/celebrities")}
            variant="outline"
            className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black font-bold px-10 py-6 text-lg rounded-full transition-all duration-300 bg-transparent"
          >
            Meet Our Celebrity Fans
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c8ff00] rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-black">NEON<span className="text-[#c8ff00]">®</span></span>
            </div>
            <div className="flex gap-8 text-sm text-white/50">
              <button onClick={() => setLocation("/about")} className="hover:text-[#c8ff00] transition-colors">Story</button>
              <button onClick={() => setLocation("/products")} className="hover:text-[#c8ff00] transition-colors">Products</button>
              <button onClick={() => setLocation("/celebrities")} className="hover:text-[#c8ff00] transition-colors">Celebrities</button>
              <button onClick={() => setLocation("/franchise")} className="hover:text-[#c8ff00] transition-colors">Franchise</button>
            </div>
            <div className="text-sm text-white/30">
              &copy; 2025 NEON Energy Drink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
