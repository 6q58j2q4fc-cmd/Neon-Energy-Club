import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Zap, Share2, ShoppingCart, Users, TrendingUp, Sparkles, MapPin, Star, CheckCircle, Copy, ExternalLink, Instagram, Facebook, Twitter, Youtube, Linkedin } from "lucide-react";
import { trpc } from "@/lib/trpc";
import LeaderboardWidget from "@/components/LeaderboardWidget";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { LAUNCH_DATE } from "@/hooks/useCountdown";

interface DistributorProfile {
  id: number;
  distributorCode: string;
  username: string;
  displayName: string;
  profilePhoto: string | null;
  location: string | null;
  country: string | null;
  bio: string | null;
  rank: string;
  joinDate: string;
  totalCustomers: number;
  isActive: boolean;
  // Social media links
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  youtube?: string | null;
  linkedin?: string | null;
}

// Country flag emoji mapping
const getCountryFlag = (countryCode: string | null): string => {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase();
  // Convert country code to flag emoji
  const codePoints = code.split('').map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export default function DistributorSite() {
  const [, params] = useRoute("/d/:code");
  const distributorCode = params?.code;
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState({ days: 95, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);
  const { addItem, openCart } = useCart();

  // Fetch real distributor profile data
  const { data: profile, isLoading, error } = trpc.distributor.getPublicProfile.useQuery(
    { code: distributorCode || "" },
    { enabled: !!distributorCode }
  );

  // Track referral click when page loads
  const trackClick = trpc.distributor.trackReferralClick.useMutation();

  useEffect(() => {
    if (distributorCode) {
      // Store distributor code in localStorage with 30-day expiration for order attribution
      const referralData = {
        distributorCode,
        expiry: new Date(Date.now().toISOString() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        visitedAt: new Date().toISOString(),
      };
      localStorage.setItem('neon_referral', JSON.stringify(referralData));
      
      // Also keep sessionStorage for backward compatibility
      sessionStorage.setItem('referringDistributor', distributorCode);
      
      // Track the click
      trackClick.mutate({ distributorCode });
    }
  }, [distributorCode]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Use centralized launch date from useCountdown hook
      const now = new Date();
      const difference = LAUNCH_DATE.getTime() - now.getTime();
      
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

  const handleOrderNow = () => {
    // Add default product to cart with distributor attribution
    addItem({
      id: "neon-original-case",
      name: "NEON Original Case (24 Cans)",
      price: 59.99,
      quantity: 1,
      image: "/neon-can.png",
      distributorCode: distributorCode,
    });
    openCart();
    toast.success("Added to cart! Your order will be credited to your distributor.");
  };

  const handleBecomeDistributor = () => {
    // Navigate to join page with sponsor code pre-filled
    setLocation(`/join?sponsor=${distributorCode}`);
  };

  const copyLink = () => {
    const link = `${window.location.origin}/d/${distributorCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#c8ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading distributor page...</p>
        </div>
      </div>
    );
  }

  // Show error state for invalid distributor code
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-4">Distributor Not Found</h1>
          <p className="text-gray-400 mb-8">
            The distributor code "{distributorCode}" doesn't exist or is no longer active.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
          >
            Go to Main Site
          </Button>
        </div>
      </div>
    );
  }

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
                <div className="text-xs text-gray-500">Independent Distributor</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={copyLink}
                className="border-[#c8ff00]/30 text-[#c8ff00] hover:bg-[#c8ff00]/10"
              >
                {copied ? <CheckCircle className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button 
                onClick={handleOrderNow}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Order Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Distributor Profile Section */}
      <section className="py-8 border-b border-[#c8ff00]/20 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container px-6">
          <div className="flex flex-col md:flex-row items-center gap-6 max-w-4xl mx-auto">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#c8ff00] neon-glow">
                {profile.profilePhoto ? (
                  <img 
                    src={profile.profilePhoto} 
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#c8ff00]/20 flex items-center justify-center">
                    <Users className="w-12 h-12 text-[#c8ff00]" />
                  </div>
                )}
              </div>
              {/* Rank Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#c8ff00] text-black text-xs font-bold rounded-full uppercase">
                {profile.rank}
              </div>
              {/* Country Flag */}
              {profile.country && (
                <div className="absolute -top-1 -right-1 text-2xl" title={profile.country}>
                  {getCountryFlag(profile.country)}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-black mb-2">{profile.displayName}</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 mb-3">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[#c8ff00]" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#c8ff00]" />
                  {profile.totalCustomers} Happy Customers
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Verified Distributor
                </span>
              </div>
              {profile.bio && (
                <p className="text-gray-300 max-w-xl">{profile.bio}</p>
              )}
              
              {/* Social Media Links */}
              {(profile.instagram || profile.tiktok || profile.facebook || profile.twitter || profile.youtube || profile.linkedin) && (
                <div className="flex items-center gap-3 mt-4">
                  {profile.instagram && (
                    <a
                      href={`https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 hover:opacity-80 transition-opacity"
                      title={`@${profile.instagram}`}
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {profile.tiktok && (
                    <a
                      href={`https://tiktok.com/@${profile.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black border border-white/20 hover:border-[#c8ff00] transition-colors"
                      title={`@${profile.tiktok}`}
                    >
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                      </svg>
                    </a>
                  )}
                  {profile.facebook && (
                    <a
                      href={profile.facebook.startsWith('http') ? profile.facebook : `https://facebook.com/${profile.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
                      title="Facebook"
                    >
                      <Facebook className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a
                      href={`https://twitter.com/${profile.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-black border border-white/20 hover:border-sky-400 transition-colors"
                      title={`@${profile.twitter}`}
                    >
                      <Twitter className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {profile.youtube && (
                    <a
                      href={profile.youtube.startsWith('http') ? profile.youtube : `https://youtube.com/@${profile.youtube}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                      title="YouTube"
                    >
                      <Youtube className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://linkedin.com/in/${profile.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-blue-700 hover:bg-blue-800 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-lg">
                <div className="text-2xl font-black text-[#c8ff00]">{profile.totalCustomers}</div>
                <div className="text-xs text-gray-500">Customers</div>
              </div>
              <div className="text-center px-4 py-2 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-lg">
                <div className="text-2xl font-black text-[#c8ff00]">4.9</div>
                <div className="text-xs text-gray-500">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
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

            <h1 className="text-5xl lg:text-7xl font-black leading-none">
              FUEL YOUR <span className="text-[#c8ff00] neon-text">POTENTIAL</span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
              {profile.displayName} invites you to join the NEON revolution. Get exclusive pricing, early access, and special rewards when you order through your personal distributor.
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
                onClick={handleOrderNow}
                className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg px-10 h-16 neon-pulse"
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                ORDER NOW - SPECIAL PRICING
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBecomeDistributor}
                className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 font-black text-lg px-10 h-16"
              >
                <Users className="w-6 h-6 mr-2" />
                JOIN THE TEAM
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                30-Day Money Back
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                100% Natural
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Free Shipping $50+
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 border-t border-[#c8ff00]/20">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              WHY ORDER FROM <span className="text-[#c8ff00] neon-text">{profile.displayName.split(' ')[0].toUpperCase()}</span>?
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
                description: `Direct support and guidance from ${profile.displayName}`,
              },
              {
                icon: Share2,
                title: "EARLY ACCESS",
                description: "Be first to receive new products and limited editions",
              },
            ].map((benefit, index) => (
              <div key={index} className="text-center p-8 bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-2xl hover:border-[#c8ff00]/60 transition-colors">
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

      {/* Top Performers Leaderboard */}
      <section className="py-16 border-t border-[#c8ff00]/20 bg-gradient-to-b from-[#0a0a0a] to-black">
        <div className="container px-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black mb-2">
              TOP <span className="text-[#c8ff00] neon-text">PERFORMERS</span>
            </h2>
            <p className="text-gray-400">Join our community of successful distributors</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <LeaderboardWidget limit={5} compact />
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 border-t border-[#c8ff00]/20 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">
              FEATURED <span className="text-[#c8ff00] neon-text">PRODUCTS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { name: "NEON Original", price: "$2.99", desc: "Classic energy formula" },
              { name: "NEON Pink", price: "$3.49", desc: "Beauty + Energy formula" },
              { name: "NEON Case (24)", price: "$59.99", desc: "Best value pack" },
            ].map((product, index) => (
              <div key={index} className="bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-xl p-6 text-center hover:border-[#c8ff00] transition-colors cursor-pointer" onClick={handleOrderNow}>
                <div className="w-24 h-32 bg-gradient-to-b from-[#c8ff00]/20 to-transparent rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <Zap className="w-12 h-12 text-[#c8ff00]" />
                </div>
                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                <p className="text-sm text-gray-400 mb-2">{product.desc}</p>
                <p className="text-2xl font-black text-[#c8ff00]">{product.price}</p>
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
              Order now through {profile.displayName} and get exclusive distributor pricing plus free shipping on your first order over $50
            </p>
            <Button
              size="lg"
              onClick={handleOrderNow}
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
            <p className="mt-2">
              Independent Distributor: <span className="text-[#c8ff00]">{profile.displayName}</span> ({profile.distributorCode})
            </p>
            <div className="mt-4 flex items-center justify-center gap-4">
              <button onClick={() => setLocation("/")} className="text-gray-400 hover:text-[#c8ff00] transition-colors">
                Main Site
              </button>
              <span className="text-gray-600">•</span>
              <button onClick={() => setLocation("/join")} className="text-gray-400 hover:text-[#c8ff00] transition-colors">
                Become a Distributor
              </button>
              <span className="text-gray-600">•</span>
              <button onClick={() => setLocation("/products")} className="text-gray-400 hover:text-[#c8ff00] transition-colors">
                All Products
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
