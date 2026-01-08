import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Zap, MapPin, DollarSign, Clock, TrendingUp, Users } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Countdown to relaunch date (example: 90 days from now)
  useEffect(() => {
    setIsVisible(true);
    
    const calculateTimeLeft = () => {
      const launchDate = new Date();
      launchDate.setDate(launchDate.getDate() + 90); // 90 days from now
      
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

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#c8ff00]/20 bg-black/80 backdrop-blur-md fixed top-0 w-full z-50 transition-smooth">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#c8ff00] neon-text cursor-pointer" onClick={() => setLocation("/")}>
            NEON
          </h1>
          <nav className="flex gap-6 items-center">
            <button
              onClick={() => setLocation("/")}
              className="text-[#c8ff00] font-semibold transition-smooth hover:neon-text"
            >
              Home
            </button>
            <button
              onClick={() => setLocation("/about")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Our Story
            </button>
            <button
              onClick={() => setLocation("/products")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Products
            </button>
            <button
              onClick={() => setLocation("/celebrities")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Celebrity Fans
            </button>
            <button
              onClick={() => setLocation("/franchise")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Franchise
            </button>
            {user && user.role === "admin" && (
              <Button
                variant="outline"
                className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black transition-smooth neon-border"
                onClick={() => setLocation("/admin")}
              >
                Admin Dashboard
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Countdown */}
      <section className="pt-32 pb-16 px-4 animated-bg relative overflow-hidden">
        <div className="container mx-auto text-center">
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-6xl md:text-8xl font-black leading-tight">
              THE <span className="text-[#c8ff00] neon-text">ENERGY</span>
              <br />
              IS COMING BACK
            </h2>
            
            {/* Countdown Timer */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Clock className="w-6 h-6 text-[#c8ff00] neon-glow" />
                <p className="text-xl text-gray-300">Official Relaunch In:</p>
              </div>
              <div className="grid grid-cols-4 gap-4 md:gap-8">
                <div className="bg-[#0a0a0a] border-2 border-[#c8ff00] rounded-xl p-6 neon-border hover-lift">
                  <div className="text-5xl md:text-7xl font-black text-[#c8ff00] neon-text">{timeLeft.days}</div>
                  <div className="text-sm md:text-lg text-gray-400 mt-2">DAYS</div>
                </div>
                <div className="bg-[#0a0a0a] border-2 border-[#c8ff00] rounded-xl p-6 neon-border hover-lift">
                  <div className="text-5xl md:text-7xl font-black text-[#c8ff00] neon-text">{timeLeft.hours}</div>
                  <div className="text-sm md:text-lg text-gray-400 mt-2">HOURS</div>
                </div>
                <div className="bg-[#0a0a0a] border-2 border-[#c8ff00] rounded-xl p-6 neon-border hover-lift">
                  <div className="text-5xl md:text-7xl font-black text-[#c8ff00] neon-text">{timeLeft.minutes}</div>
                  <div className="text-sm md:text-lg text-gray-400 mt-2">MINUTES</div>
                </div>
                <div className="bg-[#0a0a0a] border-2 border-[#c8ff00] rounded-xl p-6 neon-border hover-lift">
                  <div className="text-5xl md:text-7xl font-black text-[#c8ff00] neon-text">{timeLeft.seconds}</div>
                  <div className="text-sm md:text-lg text-gray-400 mt-2">SECONDS</div>
                </div>
              </div>
            </div>

            {/* New Can Design Showcase */}
            <div className="relative max-w-2xl mx-auto mt-12">
              <div className="absolute inset-0 bg-[#c8ff00] blur-[120px] opacity-40 rounded-full animate-float"></div>
              <img
                src="/neon-can.png"
                alt="New NEON Can Design"
                className="relative z-10 max-w-md mx-auto w-full h-auto neon-glow animate-float"
              />
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-[#c8ff00] text-black px-6 py-2 rounded-full font-bold text-lg neon-pulse">
                NEW DESIGN
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crowdfunding Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black to-[#0a0a0a] animated-bg">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h3 className="text-5xl font-black mb-4">
              HELP FUND THE <span className="text-[#c8ff00] neon-text">RELAUNCH</span>
            </h3>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Be part of the NEON revolution. Support our crowdfunding campaign and get exclusive rewards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Funding Progress */}
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift col-span-full animate-fade-in-up stagger-1">
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-[#c8ff00] flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 neon-glow" />
                  Campaign Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-white">$487,350</span>
                    <span className="text-gray-400">of $1,000,000 goal</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#c8ff00] to-[#a8d600] rounded-full transition-all duration-1000 gradient-animate"
                      style={{ width: '48.7%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      2,847 Backers
                    </span>
                    <span>{timeLeft.days} Days Left</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reward Tiers */}
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#c8ff00]">SUPPORTER</CardTitle>
                <CardDescription className="text-3xl font-black text-white">$25</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• 1 Limited Edition Can</li>
                  <li>• Digital Thank You Card</li>
                  <li>• Campaign Updates</li>
                  <li>• Backer Badge</li>
                </ul>
                <Button 
                  onClick={() => setLocation("/crowdfund")}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold neon-pulse"
                >
                  Back This Tier
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-3 transform scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#c8ff00] text-black px-4 py-1 rounded-full text-sm font-bold">
                MOST POPULAR
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#c8ff00]">ENERGIZER</CardTitle>
                <CardDescription className="text-3xl font-black text-white">$100</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• 1 Case (24 Cans)</li>
                  <li>• Limited Edition T-Shirt</li>
                  <li>• Exclusive Poster</li>
                  <li>• VIP Backer Status</li>
                  <li>• Early Access to Products</li>
                </ul>
                <Button 
                  onClick={() => setLocation("/crowdfund")}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold neon-pulse"
                >
                  Back This Tier
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-4">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-[#c8ff00]">VIP INSIDER</CardTitle>
                <CardDescription className="text-3xl font-black text-white">$500</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• 5 Cases (120 Cans)</li>
                  <li>• Limited Edition Merchandise Pack</li>
                  <li>• Your Name on Website</li>
                  <li>• Exclusive Virtual Event Access</li>
                  <li>• Lifetime 20% Discount</li>
                </ul>
                <Button 
                  onClick={() => setLocation("/crowdfund")}
                  className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold neon-pulse"
                >
                  Back This Tier
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vending Machine Franchise Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Vending Machine Image */}
            <div className={`${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-[#c8ff00] blur-[100px] opacity-30 rounded-full"></div>
                <img
                  src="/vending-machine.jpg"
                  alt="NEON AI Vending Machine"
                  className="relative z-10 rounded-2xl neon-border hover-glow"
                />
              </div>
            </div>

            {/* Franchise Info */}
            <div className={`space-y-6 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <h3 className="text-5xl font-black">
                EXCLUSIVE <span className="text-[#c8ff00] neon-text">FRANCHISE</span> OPPORTUNITY
              </h3>
              <p className="text-xl text-gray-300 leading-relaxed">
                Be the first to bring NEON's revolutionary AI-powered vending machines to your territory. 
                Lock in exclusive licensing rights and build a profitable business with the energy drink 
                that's taking the world by storm.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 neon-border hover-lift">
                  <Zap className="w-8 h-8 text-[#c8ff00] mb-3 neon-glow" />
                  <div className="text-2xl font-bold text-[#c8ff00]">AI-Powered</div>
                  <div className="text-sm text-gray-400">Smart inventory & sales</div>
                </div>
                <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 neon-border hover-lift">
                  <MapPin className="w-8 h-8 text-[#c8ff00] mb-3 neon-glow" />
                  <div className="text-2xl font-bold text-[#c8ff00]">Territory</div>
                  <div className="text-sm text-gray-400">Exclusive rights</div>
                </div>
                <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 neon-border hover-lift">
                  <DollarSign className="w-8 h-8 text-[#c8ff00] mb-3 neon-glow" />
                  <div className="text-2xl font-bold text-[#c8ff00]">Flexible</div>
                  <div className="text-sm text-gray-400">Financing options</div>
                </div>
                <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 neon-border hover-lift">
                  <TrendingUp className="w-8 h-8 text-[#c8ff00] mb-3 neon-glow" />
                  <div className="text-2xl font-bold text-[#c8ff00]">High ROI</div>
                  <div className="text-sm text-gray-400">Proven model</div>
                </div>
              </div>

              <Button
                onClick={() => setLocation("/franchise")}
                className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold text-xl py-8 neon-pulse"
              >
                Explore Territory Map & Pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-1">
              <div className="text-5xl font-black text-[#c8ff00] neon-text">48</div>
              <div className="text-gray-400">States Covered</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-2">
              <div className="text-5xl font-black text-[#c8ff00] neon-text">14</div>
              <div className="text-gray-400">Countries</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-3">
              <div className="text-5xl font-black text-[#c8ff00] neon-text">15%</div>
              <div className="text-gray-400">Global Reach</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-4">
              <div className="text-5xl font-black text-[#c8ff00] neon-text">100+</div>
              <div className="text-gray-400">Celebrity Fans</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
