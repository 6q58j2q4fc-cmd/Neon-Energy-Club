import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Share2, ShoppingCart, Users, TrendingUp, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DistributorSite() {
  const [, params] = useRoute("/d/:code");
  const distributorCode = params?.code;
  const [timeLeft, setTimeLeft] = useState({ days: 90, hours: 0, minutes: 0, seconds: 0 });

  // In a real implementation, this would fetch distributor info by code
  // For now, we'll show a branded landing page

  useEffect(() => {
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
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Distributor Branding */}
      <header className="border-b border-[#c8ff00]/20 py-4">
        <div className="container px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#c8ff00] flex items-center justify-center">
                <Zap className="w-6 h-6 text-black" />
              </div>
              <div>
                <div className="text-xl font-black neon-text">NEON®</div>
                {distributorCode && (
                  <div className="text-xs text-gray-500">Distributor: {distributorCode}</div>
                )}
              </div>
            </div>
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold">
              Order Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0a0a] to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(200,255,0,0.15),transparent_50%)]"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(200,255,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(200,255,0,0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}></div>

        <div className="container relative z-10 px-6">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/30">
              <Sparkles className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] font-bold text-sm">EXCLUSIVE DISTRIBUTOR OFFER</span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-black leading-none">
              FUEL YOUR <span className="text-[#c8ff00] neon-text">FUTURE</span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              Join the NEON revolution. Get exclusive pricing, early access, and special rewards when you order through your distributor.
            </p>

            {/* Countdown Timer */}
            <div className="bg-gradient-to-r from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30 rounded-2xl p-6 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="text-[#c8ff00] font-bold mb-4">RELAUNCH COUNTDOWN:</div>
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
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg px-10 h-16 neon-pulse"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                ORDER NOW - SPECIAL PRICING
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-black text-lg px-10 h-16"
              >
                <Users className="w-6 h-6 mr-2" />
                BECOME A DISTRIBUTOR
              </Button>
            </div>

            {/* Distributor Info */}
            {distributorCode && (
              <div className="pt-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-full">
                  <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-[#c8ff00]" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Your Distributor</div>
                    <div className="font-bold text-[#c8ff00]">{distributorCode}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-[#c8ff00]/20">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              WHY ORDER THROUGH A <span className="text-[#c8ff00] neon-text">DISTRIBUTOR</span>?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: TrendingUp,
                title: "EXCLUSIVE PRICING",
                description: "Get special distributor pricing not available anywhere else",
              },
              {
                icon: Sparkles,
                title: "PERSONAL SERVICE",
                description: "Direct support and guidance from your dedicated distributor",
              },
              {
                icon: Share2,
                title: "EARLY ACCESS",
                description: "Be first to receive new products and limited editions",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center p-8 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-2xl">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c8ff00]/10 mb-6 neon-glow-soft">
                  <benefit.icon className="w-8 h-8 text-[#c8ff00]" />
                </div>
                <h3 className="text-xl font-black mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#c8ff00]/20">
        <div className="container px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-5xl font-black">
              READY TO <span className="text-[#c8ff00] neon-text">ENERGIZE</span>?
            </h2>
            <p className="text-xl text-gray-300">
              Order now and get exclusive distributor pricing plus free shipping on your first order
            </p>
            <Button
              size="lg"
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-xl px-12 h-16 neon-pulse"
            >
              <ShoppingCart className="w-6 h-6 mr-2" />
              PLACE YOUR ORDER
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#c8ff00]/20 py-8">
        <div className="container px-6">
          <div className="text-center text-sm text-gray-500">
            <p>© 2026 NEON Energy Drink. All rights reserved.</p>
            {distributorCode && (
              <p className="mt-2">Independent Distributor: {distributorCode}</p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
