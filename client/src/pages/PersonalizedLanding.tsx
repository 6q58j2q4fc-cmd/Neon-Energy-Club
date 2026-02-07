import { useParams, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Zap, 
  Users, 
  ShoppingCart, 
  ArrowRight,
  Star,
  CheckCircle,
  Loader2,
  Gift,
  Trophy,
  Sparkles,
  Heart,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Phone
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VideoPlayer } from "@/components/VideoPlayer";

export default function PersonalizedLanding() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading, error } = trpc.profile.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  // Store referral in session storage for tracking
  useEffect(() => {
    if (slug) {
      sessionStorage.setItem('referralCode', slug);
      
      // If this is a distributor code lookup, also store for order attribution
      if (profile?.distributor?.distributorCode) {
        const referralData = {
          distributorCode: profile.distributor.distributorCode,
          expiry: new Date(Date.now().toISOString() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          visitedAt: new Date().toISOString(),
        };
        localStorage.setItem('neon_referral', JSON.stringify(referralData));
        sessionStorage.setItem('referringDistributor', profile.distributor.distributorCode);
      }
    }
  }, [slug, profile]);

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out NEON Energy Drink - Clean energy for your potential! Referred by ${profile?.displayName || 'a NEON Ambassador'}`;
    
    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link Copied!", {
      description: "Share this link with friends to spread the word!",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#c8ff00] mx-auto mb-4" />
          <p className="text-gray-400">Loading personalized page...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <Card className="bg-black/60 border-white/10 max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-10 w-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Page Not Found</h1>
            <p className="text-gray-400 mb-6">
              This referral link doesn't exist or has been deactivated.
            </p>
            <Link href="/">
              <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600]">
                Go to Main Site
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const referrerName = profile.displayName || "NEON Ambassador";
  const referrerRank = profile.distributor?.rank || "Ambassador";

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-[#c8ff00]/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <Zap className="h-8 w-8 text-[#c8ff00]" />
              <span className="text-2xl font-black text-white">NEON<sup className="text-xs">®</sup></span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation(`/shop?ref=${slug}`)}
              className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Pre-Order
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Referrer Info */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/neon-grid.svg')] opacity-10" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8ff00]/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Referrer Card - Prominent Display */}
          <div className="max-w-3xl mx-auto mb-12">
            <Card className="bg-gradient-to-br from-black/80 to-purple-900/20 border-[#c8ff00]/40 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  {/* Large Avatar */}
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-[#c8ff00] shadow-lg shadow-[#c8ff00]/30">
                      <AvatarImage src={profile.profilePhotoUrl || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[#c8ff00]/30 to-purple-500/30 text-[#c8ff00] text-5xl font-bold">
                        {referrerName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {profile.userType === "distributor" && (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#c8ff00] flex items-center justify-center">
                        <Star className="h-5 w-5 text-black" />
                      </div>
                    )}
                  </div>
                  
                  {/* Referrer Info */}
                  <div className="text-center md:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                      <h2 className="text-3xl font-bold text-white">
                        {referrerName}
                      </h2>
                      {profile.userType === "distributor" && (
                        <Badge className="bg-gradient-to-r from-[#c8ff00]/30 to-purple-500/30 text-[#c8ff00] border-[#c8ff00]/50 px-3 py-1">
                          <Trophy className="h-3 w-3 mr-1" />
                          {referrerRank}
                        </Badge>
                      )}
                    </div>
                    
                    {profile.location && (
                      <p className="text-gray-300 flex items-center justify-center md:justify-start gap-2 mb-3 text-lg">
                        <MapPin className="h-5 w-5 text-[#c8ff00]" />
                        {profile.location}
                      </p>
                    )}
                    
                    {profile.bio && (
                      <p className="text-gray-400 italic text-lg leading-relaxed max-w-xl">
                        "{profile.bio}"
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-[#c8ff00]/20">
                  <p className="text-center text-xl">
                    <span className="text-[#c8ff00] font-bold">{referrerName}</span>
                    <span className="text-gray-300"> invited you to discover </span>
                    <span className="text-white font-bold">NEON Energy!</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-[#c8ff00]/20 text-[#c8ff00] border-[#c8ff00]/30 mb-6 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              Clean Energy Revolution
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              FUEL YOUR{" "}
              <span className="text-[#c8ff00] drop-shadow-[0_0_30px_rgba(200,255,0,0.5)]">POTENTIAL</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Clean energy. Natural ingredients. Zero compromise.
              Join the movement and be part of the NEON revolution.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={`/shop?ref=${slug}`}>
                <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#a8d600] text-lg px-10 py-7 font-bold shadow-lg shadow-[#c8ff00]/30">
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  Pre-Order Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              
              <Link href={`/join?ref=${slug}`}>
                <Button size="lg" variant="outline" className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 text-lg px-10 py-7 font-bold">
                  <Users className="mr-2 h-6 w-6" />
                  Become a Distributor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Discover <span className="text-[#c8ff00]">NEON</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <VideoPlayer 
              videos={[
                { src: "/videos/neon-ad-1.mp4", title: "NEON Energy - Fuel Your Potential" },
                { src: "/videos/neon-ad-2.mp4", title: "NEON Energy - Clean Energy Revolution" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-4">
            Why Choose <span className="text-[#c8ff00]">NEON</span>?
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Experience the difference of clean, natural energy that powers your day without the crash.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-black/60 border-white/10 hover:border-[#c8ff00]/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-[#c8ff00]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">150mg Natural Caffeine</h3>
                <p className="text-gray-400 leading-relaxed">
                  Clean energy from natural sources for sustained focus without the crash or jitters.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/60 border-white/10 hover:border-[#c8ff00]/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-10 w-10 text-[#c8ff00]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Zero Sugar</h3>
                <p className="text-gray-400 leading-relaxed">
                  All the energy you need without the sugar crash or empty calories. Just pure fuel.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/60 border-white/10 hover:border-[#c8ff00]/50 transition-all duration-300 hover:transform hover:scale-105">
              <CardContent className="pt-8 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c8ff00]/30 to-[#c8ff00]/10 flex items-center justify-center mx-auto mb-6">
                  <Star className="h-10 w-10 text-[#c8ff00]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Premium Quality</h3>
                <p className="text-gray-400 leading-relaxed">
                  Made with the finest ingredients for a superior energy experience every time.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 3-for-Free Program */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-r from-[#c8ff00]/20 via-purple-500/20 to-[#c8ff00]/20 border-[#c8ff00]/40 max-w-4xl mx-auto overflow-hidden">
            <CardContent className="py-16 text-center relative">
              <div className="absolute top-0 left-0 w-32 h-32 bg-[#c8ff00]/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-[80px]" />
              
              <div className="relative z-10">
                <Badge className="bg-[#c8ff00] text-black mb-6 px-4 py-2 text-lg font-bold">
                  <Gift className="h-4 w-4 mr-2" />
                  LIMITED TIME OFFER
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  Get Your NEON <span className="text-[#c8ff00]">FREE</span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Refer 3 friends who pre-order and get a <strong className="text-[#c8ff00]">FREE case</strong> of NEON Energy!
                  It's that simple.
                </p>
                <Link href={`/shop?ref=${slug}`}>
                  <Button size="lg" className="bg-[#c8ff00] text-black hover:bg-[#a8d600] text-lg px-10 py-6 font-bold">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Opportunity Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Join the <span className="text-[#c8ff00]">NEON</span> Movement
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Become a distributor and build your own business with NEON Energy.
              Earn commissions, bonuses, and exclusive rewards.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 bg-black/40 rounded-xl border border-white/10">
                <div className="text-4xl font-bold text-[#c8ff00] mb-2">20%</div>
                <div className="text-gray-400">Customer Commissions</div>
              </div>
              <div className="p-6 bg-black/40 rounded-xl border border-white/10">
                <div className="text-4xl font-bold text-[#c8ff00] mb-2">25%</div>
                <div className="text-gray-400">Team Bonuses</div>
              </div>
              <div className="p-6 bg-black/40 rounded-xl border border-white/10">
                <div className="text-4xl font-bold text-[#c8ff00] mb-2">8</div>
                <div className="text-gray-400">Rank Levels</div>
              </div>
            </div>
            
            <Link href={`/join?ref=${slug}`}>
              <Button size="lg" variant="outline" className="border-2 border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00]/10 text-lg px-10 py-6 font-bold">
                <Users className="mr-2 h-5 w-5" />
                Learn More About the Opportunity
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Social Sharing Section */}
      <section className="py-12 bg-gray-900 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Share This Page</h3>
            <p className="text-gray-400">Help spread the word about NEON Energy!</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => handleShare('facebook')}
              className="bg-[#1877F2] hover:bg-[#1877F2]/80 text-white"
            >
              <Facebook className="h-5 w-5 mr-2" />
              Facebook
            </Button>
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-[#1DA1F2] hover:bg-[#1DA1F2]/80 text-white"
            >
              <Twitter className="h-5 w-5 mr-2" />
              Twitter
            </Button>
            <Button
              onClick={() => handleShare('linkedin')}
              className="bg-[#0A66C2] hover:bg-[#0A66C2]/80 text-white"
            >
              <Linkedin className="h-5 w-5 mr-2" />
              LinkedIn
            </Button>
            <Button
              onClick={() => handleShare('whatsapp')}
              className="bg-[#25D366] hover:bg-[#25D366]/80 text-white"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-[#c8ff00]" />
              <span className="text-xl font-bold text-white">NEON<sup className="text-xs">®</sup></span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
              <Link href="/about" className="hover:text-[#c8ff00] transition-colors">About</Link>
              <Link href="/products" className="hover:text-[#c8ff00] transition-colors">Products</Link>
              <Link href="/faq" className="hover:text-[#c8ff00] transition-colors">FAQ</Link>
              <Link href="/privacy" className="hover:text-[#c8ff00] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[#c8ff00] transition-colors">Terms</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} NEON Energy Drink. All rights reserved.
            </p>
            <p className="text-[#c8ff00] text-sm mt-2 flex items-center justify-center gap-2">
              <Heart className="h-4 w-4" />
              You were referred by <strong>{referrerName}</strong>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
