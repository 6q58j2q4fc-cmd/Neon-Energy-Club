import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Play, Music, TrendingUp } from "lucide-react";

// Celebrity data
const celebrities = [
  {
    name: "Snoop Dogg",
    category: "Music Icon",
    feature: "Featured in Music Video",
    views: "120M+",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
  {
    name: "Chris Brown",
    category: "R&B Superstar",
    feature: "Music Video Appearance",
    views: "95M+",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400",
  },
  {
    name: "Christina Milian",
    category: "Pop Artist",
    feature: "Brand Ambassador",
    views: "78M+",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400",
  },
  {
    name: "David Cook",
    category: "American Idol Winner",
    feature: "NEON Tour Headliner",
    views: "45M+",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
  {
    name: "DJ Tiësto",
    category: "EDM Legend",
    feature: "Festival Partnership",
    views: "200M+",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400",
  },
  {
    name: "Steve Aoki",
    category: "DJ & Producer",
    feature: "Event Collaboration",
    views: "150M+",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
  },
];

const musicVideos = [
  {
    title: "Drop It Low",
    artist: "Snoop Dogg ft. Various Artists",
    views: "120M",
    year: "2014",
  },
  {
    title: "Turn Up The Music",
    artist: "Chris Brown",
    views: "95M",
    year: "2015",
  },
  {
    title: "Dip It Low",
    artist: "Christina Milian",
    views: "78M",
    year: "2016",
  },
  {
    title: "Light On",
    artist: "David Cook",
    views: "45M",
    year: "2013",
  },
];

export default function Celebrities() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
            <button onClick={() => setLocation("/")} className="text-gray-300 hover:text-[#c8ff00] transition-smooth">
              Home
            </button>
            <button onClick={() => setLocation("/about")} className="text-gray-300 hover:text-[#c8ff00] transition-smooth">
              Our Story
            </button>
            <button onClick={() => setLocation("/products")} className="text-gray-300 hover:text-[#c8ff00] transition-smooth">
              Products
            </button>
            <button onClick={() => setLocation("/celebrities")} className="text-[#c8ff00] font-semibold neon-text">
              Celebrity Fans
            </button>
            <button onClick={() => setLocation("/franchise")} className="text-gray-300 hover:text-[#c8ff00] transition-smooth">
              Franchise
            </button>
            {user && user.role === "admin" && (
              <Button variant="outline" className="border-[#c8ff00] text-[#c8ff00] hover:bg-[#c8ff00] hover:text-black transition-smooth neon-border" onClick={() => setLocation("/admin")}>
                Admin Dashboard
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 animated-bg">
        <div className={`container mx-auto max-w-6xl text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-[#c8ff00] neon-text">CELEBRITY</span> FANS
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            From A-list music videos to blockbuster events, NEON has been featured alongside 
            the world's biggest stars, reaching 15% of the global population.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-black to-[#0a0a0a] animated-bg">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-1">
              <Star className="w-12 h-12 text-[#c8ff00] mx-auto neon-glow" />
              <div className="text-5xl font-black text-[#c8ff00] neon-text">100+</div>
              <div className="text-gray-400">Celebrity Endorsements</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-2">
              <Play className="w-12 h-12 text-[#c8ff00] mx-auto neon-glow" />
              <div className="text-5xl font-black text-[#c8ff00] neon-text">50+</div>
              <div className="text-gray-400">Music Video Features</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-3">
              <Music className="w-12 h-12 text-[#c8ff00] mx-auto neon-glow" />
              <div className="text-5xl font-black text-[#c8ff00] neon-text">1B+</div>
              <div className="text-gray-400">Combined Video Views</div>
            </div>
            <div className="text-center space-y-2 hover-lift animate-fade-in-up stagger-4">
              <TrendingUp className="w-12 h-12 text-[#c8ff00] mx-auto neon-glow" />
              <div className="text-5xl font-black text-[#c8ff00] neon-text">15%</div>
              <div className="text-gray-400">Global Population Reached</div>
            </div>
          </div>
        </div>
      </section>

      {/* Celebrity Grid */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-7xl">
          <h3 className="text-4xl font-black text-center mb-12 animate-fade-in-up">
            FEATURED <span className="text-[#c8ff00] neon-text">CELEBRITIES</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {celebrities.map((celebrity, index) => (
              <Card
                key={celebrity.name}
                className={`bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift overflow-hidden group animate-fade-in-up stagger-${(index % 6) + 1}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={celebrity.image}
                    alt={celebrity.name}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-[#c8ff00] neon-glow" />
                      <span className="text-sm text-[#c8ff00] font-semibold">{celebrity.category}</span>
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-1">{celebrity.name}</h4>
                  </div>
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{celebrity.feature}</span>
                    <span className="text-[#c8ff00] font-bold">{celebrity.views} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Music Videos Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl font-black text-center mb-12 animate-fade-in-up">
            BLOCKBUSTER <span className="text-[#c8ff00] neon-text">MUSIC VIDEOS</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {musicVideos.map((video, index) => (
              <Card
                key={video.title}
                className={`bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift group animate-fade-in-up stagger-${(index % 4) + 1}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#c8ff00] to-[#a8d600] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:neon-pulse">
                      <Play className="w-10 h-10 text-black" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">{video.title}</h4>
                      <p className="text-gray-400 mb-2">{video.artist}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#c8ff00] font-semibold">{video.views} views</span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400">{video.year}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Notable Events */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl font-black text-center mb-12 animate-fade-in-up">
            MAJOR <span className="text-[#c8ff00] neon-text">EVENTS</span>
          </h3>
          <div className="space-y-6">
            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-1">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-[#c8ff00]/10 rounded-full flex items-center justify-center flex-shrink-0 neon-border">
                    <Music className="w-12 h-12 text-[#c8ff00] neon-glow" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-[#c8ff00] mb-2">David Cook's NEON Tour</h4>
                    <p className="text-gray-300 leading-relaxed">
                      American Idol winner David Cook partnered with NEON for his exclusive tour, 
                      bringing the energy drink to thousands of fans across the country.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-2">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-[#c8ff00]/10 rounded-full flex items-center justify-center flex-shrink-0 neon-border">
                    <Star className="w-12 h-12 text-[#c8ff00] neon-glow" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-[#c8ff00] mb-2">World's Top DJ Events</h4>
                    <p className="text-gray-300 leading-relaxed">
                      NEON has been featured at major EDM festivals and events with legendary DJs 
                      including Tiësto, Steve Aoki, and more, reaching millions of music fans worldwide.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0a0a0a] border-[#c8ff00]/30 neon-border hover-lift animate-fade-in-up stagger-3">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-[#c8ff00]/10 rounded-full flex items-center justify-center flex-shrink-0 neon-border">
                    <TrendingUp className="w-12 h-12 text-[#c8ff00] neon-glow" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-[#c8ff00] mb-2">Global Brand Exposure</h4>
                    <p className="text-gray-300 leading-relaxed">
                      Through strategic partnerships with A-list celebrities and appearances in some of 
                      the world's most-viewed music videos, NEON achieved brand exposure to nearly 15% 
                      of the world's population in just 5 years.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h3 className="text-4xl font-bold text-white">
            Join the <span className="text-[#c8ff00] neon-text">NEON</span> Movement
          </h3>
          <p className="text-lg text-gray-300">
            Be part of the energy drink that's loved by celebrities and fans worldwide.
          </p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-[#c8ff00] text-black px-8 py-6 rounded-lg font-bold text-xl hover:bg-[#a8d600] transition-smooth neon-pulse"
          >
            Support the Relaunch
          </Button>
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
