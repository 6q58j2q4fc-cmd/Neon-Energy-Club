import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, DollarSign, Clock, TrendingUp, Users, Star, Sparkles, ArrowRight, Gift, Target, Trophy } from "lucide-react";
import SocialProofNotifications from "@/components/SocialProofNotifications";
import ViralNewsletterPopup from "@/components/ViralNewsletterPopup";
import { trpc } from "@/lib/trpc";

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
    
    // Show newsletter popup after 3 seconds
    const newsletterTimer = setTimeout(() => {
      setShowNewsletter(true);
    }, 3000);
    
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
    ? (crowdfundingStats.data.totalRaised / crowdfundingStats.data.goal) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <SocialProofNotifications />
      <ViralNewsletterPopup open={showNewsletter} onClose={() => setShowNewsletter(false)} />

      {/* Ultra-Premium Header */}
      <header className="fixed top-0 w-full z-50 transition-all duration-500" style={{
        backgroundColor: scrollY > 50 ? 'rgba(0,0,0,0.98)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(30px)' : 'none',
        borderBottom: scrollY > 50 ? '1px solid rgba(200,255,0,0.2)' : 'none',
      }}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <div className="w-12 h-12 rounded-xl bg-[#c8ff00] flex items-center justify-center neon-glow">
                <Zap className="w-7 h-7 text-black" />
              </div>
              <span className="text-2xl font-black tracking-tight neon-text">NEON®</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => setLocation("/")} className="text-white hover:text-[#c8ff00] transition-colors font-semibold">HOME</button>
              <button onClick={() => setLocation("/about")} className="text-gray-400 hover:text-[#c8ff00] transition-colors font-semibold">STORY</button>
              <button onClick={() => setLocation("/products")} className="text-gray-400 hover:text-[#c8ff00] transition-colors font-semibold">PRODUCTS</button>
              <button onClick={() => setLocation("/celebrities")} className="text-gray-400 hover:text-[#c8ff00] transition-colors font-semibold">CELEBRITIES</button>
              <button onClick={() => setLocation("/franchise")} className="text-gray-400 hover:text-[#c8ff00] transition-colors font-semibold">FRANCHISE</button>
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setLocation("/crowdfund")}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold px-8 h-12 neon-pulse hidden md:flex"
              >
                BACK US NOW
              </Button>
              {user && (
                <Button
                  variant="outline"
                  onClick={() => setLocation("/admin")}
                  className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
                >
                  {user.role === "admin" ? "Admin" : "Account"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Ultra Premium */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,255,0,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(200,255,0,0.1),transparent_50%)]"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(200,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
          animation: 'grid-move 20s linear infinite',
        }}></div>

        <div className="container relative z-10 px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30 neon-glow-soft">
                <Sparkles className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-[#c8ff00] font-bold text-sm tracking-wide">THE LEGEND RETURNS</span>
              </div>

              <h1 className="text-7xl lg:text-8xl font-black leading-none">
                THE <span className="text-[#c8ff00] neon-text">ENERGY</span><br />
                IS BACK
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                After years of anticipation, NEON Energy Drink returns with a revolutionary formula. 
                Be among the first to experience the next generation of energy.
              </p>

              {/* Countdown Timer */}
              <div className="bg-gradient-to-r from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#c8ff00]" />
                  <span className="text-[#c8ff00] font-bold">OFFICIAL RELAUNCH IN:</span>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { value: timeLeft.days, label: "DAYS" },
                    { value: timeLeft.hours, label: "HOURS" },
                    { value: timeLeft.minutes, label: "MINS" },
                    { value: timeLeft.seconds, label: "SECS" },
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl font-black text-[#c8ff00] neon-text mb-1">
                        {String(item.value).padStart(2, "0")}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setLocation("/crowdfund")}
                  size="lg"
                  className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg px-10 h-16 neon-pulse"
                >
                  <Gift className="w-6 h-6 mr-2" />
                  BACK THE RELAUNCH
                </Button>
                <Button
                  onClick={() => setLocation("/franchise")}
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-black text-lg px-10 h-16"
                >
                  <MapPin className="w-6 h-6 mr-2" />
                  BECOME A DISTRIBUTOR
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-black text-[#c8ff00] neon-text">{crowdfundingStats.data?.totalBackers || 0}</div>
                  <div className="text-sm text-gray-500 font-semibold">BACKERS</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#c8ff00] neon-text">${((crowdfundingStats.data?.totalRaised || 0) / 100).toLocaleString()}</div>
                  <div className="text-sm text-gray-500 font-semibold">RAISED</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-[#c8ff00] neon-text">{Math.round(fundingProgress)}%</div>
                  <div className="text-sm text-gray-500 font-semibold">FUNDED</div>
                </div>
              </div>
            </div>

            {/* Right - Product Image */}
            <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
              <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-[#c8ff00] opacity-30 blur-[100px] animate-pulse"></div>
                
                {/* Product Image */}
                <img
                  src="/neon-can.png"
                  alt="NEON Energy Drink"
                  className="relative z-10 w-full max-w-md mx-auto drop-shadow-2xl floating"
                  style={{
                    filter: 'drop-shadow(0 0 60px rgba(200,255,0,0.6))',
                  }}
                />

                {/* Floating Elements */}
                <div className="absolute top-1/4 -left-10 w-32 h-32 bg-[#c8ff00]/20 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-1/4 -right-10 w-40 h-40 bg-[#c8ff00]/15 rounded-full blur-3xl animate-float-delayed"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-[#c8ff00]/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-[#c8ff00] rounded-full animate-scroll"></div>
          </div>
        </div>
      </section>

      {/* Why NEON Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="container px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">
              WHY <span className="text-[#c8ff00] neon-text">NEON</span>?
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              The most advanced energy formula ever created, backed by science and loved by millions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "INSTANT ENERGY",
                description: "Feel the rush within minutes. Our revolutionary formula delivers sustained energy without the crash.",
              },
              {
                icon: Target,
                title: "LASER FOCUS",
                description: "Enhanced cognitive function and mental clarity to power through your day with precision.",
              },
              {
                icon: Trophy,
                title: "ZERO COMPROMISE",
                description: "Premium ingredients, zero sugar, maximum performance. The energy drink redefined.",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-[#0a0a0a] to-black border-[#c8ff00]/30 hover:border-[#c8ff00] transition-all duration-300 group">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8ff00]/10 mb-6 group-hover:bg-[#c8ff00]/20 transition-colors neon-glow-soft">
                    <feature.icon className="w-8 h-8 text-[#c8ff00]" />
                  </div>
                  <h3 className="text-2xl font-black mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Crowdfunding CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#c8ff00]/10 via-transparent to-[#c8ff00]/10"></div>
        
        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30">
              <TrendingUp className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] font-bold text-sm">CROWDFUNDING LIVE</span>
            </div>

            <h2 className="text-6xl font-black">
              FUEL THE <span className="text-[#c8ff00] neon-text">REVOLUTION</span>
            </h2>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join thousands of backers bringing NEON back to life. Exclusive rewards, lifetime discounts, and VIP access await.
            </p>

            {/* Progress Bar */}
            <div className="bg-black/50 border border-[#c8ff00]/30 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-black text-[#c8ff00]">
                  ${((crowdfundingStats.data?.totalRaised || 0) / 100).toLocaleString()}
                </span>
                <span className="text-gray-400">
                  of ${((crowdfundingStats.data?.goal || 1000000) / 100).toLocaleString()} goal
                </span>
              </div>
              <div className="w-full h-4 bg-black/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c8ff00] to-[#a8d600] neon-glow transition-all duration-1000"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>{crowdfundingStats.data?.totalBackers || 0} backers</span>
                <span>{crowdfundingStats.data?.daysLeft || 90} days left</span>
              </div>
            </div>

            <Button
              onClick={() => setLocation("/crowdfund")}
              size="lg"
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-xl px-12 h-16 neon-pulse"
            >
              <DollarSign className="w-6 h-6 mr-2" />
              BACK THIS PROJECT
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-[#c8ff00]/20 py-12">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00] flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <span className="text-xl font-black neon-text">NEON®</span>
            </div>

            <div className="flex gap-8 text-sm text-gray-500">
              <button onClick={() => setLocation("/faq")} className="hover:text-[#c8ff00] transition-colors">FAQ</button>
              <button className="hover:text-[#c8ff00] transition-colors">Privacy</button>
              <button className="hover:text-[#c8ff00] transition-colors">Terms</button>
              <button className="hover:text-[#c8ff00] transition-colors">Contact</button>
            </div>

            <div className="text-sm text-gray-500">
              © 2026 NEON Energy Drink. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
