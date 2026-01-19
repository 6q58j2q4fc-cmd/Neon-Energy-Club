import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Play, Music, TrendingUp, ExternalLink, Zap, Menu, X } from "lucide-react";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";
import HamburgerHeader from "@/components/HamburgerHeader";

// Celebrity data with real YouTube video IDs
const celebrities = [
  {
    name: "Snoop Dogg",
    category: "Music Icon",
    feature: "Featured in 'Like Me' with Christina Milian",
    views: "5.7M+",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    youtubeId: "7I79wRRNcnY", // Christina Milian - Like Me ft. Snoop Dogg
  },
  {
    name: "Chris Brown",
    category: "R&B Superstar",
    feature: "NEON in 'Five More Hours' & 'Zero'",
    views: "350M+",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
    youtubeId: "j3CaHeakZF4", // Deorro x Chris Brown - Five More Hours
  },
  {
    name: "Christina Milian",
    category: "Pop Artist",
    feature: "Brand Ambassador & Music Videos",
    views: "78M+",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
    youtubeId: "5z5Mvyp1QHw", // Christina Milian - Dip It Low
  },
  {
    name: "Deorro",
    category: "EDM Producer",
    feature: "Five More Hours ft. Chris Brown",
    views: "350M+",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
    youtubeId: "hmwJ2GhYtKY", // Deorro, Chris Brown - Five More Hours (Online Version)
  },
];

// Featured music videos with embedded YouTube
const featuredVideos = [
  {
    title: "Five More Hours",
    artist: "Deorro x Chris Brown",
    description: "NEON Energy Drink prominently featured throughout this hit music video with over 350 million views.",
    views: "350M+",
    year: "2015",
    youtubeId: "j3CaHeakZF4",
  },
  {
    title: "Like Me",
    artist: "Christina Milian ft. Snoop Dogg",
    description: "Christina Milian and Snoop Dogg showcase NEON in this energetic collaboration.",
    views: "5.7M+",
    year: "2015",
    youtubeId: "7I79wRRNcnY",
  },
  {
    title: "Zero",
    artist: "Chris Brown",
    description: "Chris Brown's hit single featuring NEON Energy Drink product placement.",
    views: "69M+",
    year: "2015",
    youtubeId: "RSj0mPJsMy0",
  },
  {
    title: "Dip It Low",
    artist: "Christina Milian",
    description: "Classic hit from Christina Milian, a longtime NEON brand ambassador.",
    views: "78M+",
    year: "2004",
    youtubeId: "5z5Mvyp1QHw",
  },
];

export default function Celebrities() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const navItems = [
    { label: "HOME", path: "/" },
    { label: "STORY", path: "/about" },
    { label: "PRODUCTS", path: "/shop" },
    { label: "CELEBRITIES", path: "/celebrities" },
    { label: "FRANCHISE", path: "/franchise" },
  ];

  return (
    <div className="min-h-screen vice-bg text-white">
      <SEO 
        title="Celebrity Fans - NEON Energy Drink"
        description="See NEON Energy Drink featured in music videos by Snoop Dogg, Chris Brown, Christina Milian, and more. Watch the actual videos featuring NEON."
        keywords="NEON energy drink celebrities, Chris Brown NEON, Snoop Dogg energy drink, Christina Milian NEON, music video product placement"
        url="/celebrities"
      />

      <HamburgerHeader variant="vice" />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 animated-grid opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#b8e600]/10 rounded-full blur-[100px]" />
        
        {/* Subtle Background Glow */}
        <div className="absolute -left-40 top-1/3 w-80 h-80 bg-[#b8e600]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 bottom-0 w-60 h-60 bg-[#9d4edd]/4 rounded-full blur-[80px] pointer-events-none" />
        
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="badge-neon mb-4 inline-block">AS SEEN IN MUSIC VIDEOS</span>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-[#b8e600]">CELEBRITY</span> FANS
          </h1>
          <p className="text-xl text-white/60 leading-relaxed max-w-3xl mx-auto">
            From A-list music videos to blockbuster events, NEON has been featured alongside 
            the world's biggest stars. Watch the actual videos below.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Star, value: "100+", label: "Celebrity Endorsements" },
              { icon: Play, value: "500M+", label: "Combined Video Views" },
              { icon: Music, value: "50+", label: "Music Video Features" },
              { icon: TrendingUp, value: "15%", label: "Global Population Reached" },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 text-center hover-lift">
                <stat.icon className="w-10 h-10 text-[#b8e600] mx-auto mb-4" />
                <div className="text-4xl font-black text-[#b8e600] mb-1">{stat.value}</div>
                <div className="text-white/50 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Music Videos with YouTube Embeds */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="badge-neon mb-4 inline-block">WATCH NOW</span>
            <h2 className="text-4xl font-black">
              FEATURED <span className="text-[#b8e600]">MUSIC VIDEOS</span>
            </h2>
            <p className="text-white/60 mt-4 max-w-2xl mx-auto">
              Click to play the actual music videos featuring NEON Energy Drink
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {featuredVideos.map((video, index) => (
              <div
                key={video.youtubeId}
                className="glass-card rounded-2xl overflow-hidden hover-lift group"
              >
                {/* Video Embed */}
                <div className="relative aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
                    title={`${video.title} - ${video.artist}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Video Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{video.title}</h3>
                      <p className="text-[#b8e600] font-semibold mb-2">{video.artist}</p>
                      <p className="text-white/60 text-sm">{video.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                    <span className="text-[#b8e600] font-bold">{video.views} views</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white/50">{video.year}</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-2 text-white/60 hover:text-[#b8e600] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Open in YouTube</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebrity Grid */}
      <section className="py-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#b8e600]/5 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black">
              CELEBRITY <span className="text-[#b8e600]">AMBASSADORS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {celebrities.map((celebrity, index) => (
              <Card
                key={celebrity.name}
                className="bg-black/50 border-[#b8e600]/20 hover:border-[#b8e600]/50 overflow-hidden group transition-all duration-300 hover-lift"
              >
                {/* Thumbnail with Play Button */}
                <div className="relative aspect-video bg-black cursor-pointer" onClick={() => setActiveVideo(activeVideo === celebrity.youtubeId ? null : celebrity.youtubeId)}>
                  {activeVideo === celebrity.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${celebrity.youtubeId}?autoplay=1&rel=0`}
                      title={celebrity.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                    />
                  ) : (
                    <>
                      <img
                        src={`https://img.youtube.com/vi/${celebrity.youtubeId}/hqdefault.jpg`}
                        alt={celebrity.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-[#b8e600] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                          <Play className="w-8 h-8 text-black ml-1" fill="black" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-[#b8e600]" />
                    <span className="text-xs text-[#b8e600] font-semibold">{celebrity.category}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{celebrity.name}</h4>
                  <p className="text-white/50 text-sm mt-1">{celebrity.feature}</p>
                  <p className="text-[#b8e600] font-semibold text-sm mt-2">{celebrity.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notable Events */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black">
              MAJOR <span className="text-[#b8e600]">EVENTS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-[#b8e600]/20 hover-lift">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-[#b8e600]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Music className="w-10 h-10 text-[#b8e600]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#b8e600] mb-2">Five More Hours World Tour</h4>
                    <p className="text-white/60 leading-relaxed">
                      Deorro and Chris Brown's massive hit "Five More Hours" prominently featured NEON Energy Drink, 
                      reaching over 350 million views on YouTube and introducing NEON to a global audience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-[#b8e600]/20 hover-lift">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 bg-[#b8e600]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-10 h-10 text-[#b8e600]" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#b8e600] mb-2">Christina Milian Partnership</h4>
                    <p className="text-white/60 leading-relaxed">
                      Pop star Christina Milian became a brand ambassador for NEON, featuring the drink 
                      in multiple music videos including her collaboration with Snoop Dogg.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#b8e600]/10 to-transparent" />
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            JOIN THE <span className="text-[#b8e600]">MOVEMENT</span>
          </h2>
          <p className="text-xl text-white/60 mb-8">
            Be part of the NEON relaunch and join celebrities who love clean energy.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setLocation("/crowdfund")}
              className="btn-primary-shiny text-black font-bold px-8 h-14 text-lg rounded-xl"
            >
              BACK THE RELAUNCH
            </Button>
            <Button
              onClick={() => setLocation("/franchise")}
              variant="outline"
              className="btn-shiny text-[#b8e600] font-bold px-8 h-14 text-lg rounded-xl"
            >
              BECOME A PARTNER
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#b8e600] to-[#8fb800] flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black font-vice text-[#b8e600]">NEON®</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 NEON Energy Drink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
