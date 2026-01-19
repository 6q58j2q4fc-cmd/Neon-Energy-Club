import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, Zap, Home, BookOpen, Store, Star, MapPin, Building2, Gem, Users, Trophy, ChevronDown } from "lucide-react";

const navItems = [
  { label: "HOME", path: "/", icon: Home },
  { label: "OUR STORY", path: "/about", icon: BookOpen },
  { label: "PRODUCTS", path: "/products", icon: Store },
  { label: "CELEBRITY FANS", path: "/celebrities", icon: Star },
  { label: "FRANCHISE", path: "/franchise", icon: MapPin },
  { label: "VENDING", path: "/vending", icon: Building2 },
  { label: "NFT GALLERY", path: "/nft-gallery", icon: Gem },
];

interface HamburgerHeaderProps {
  variant?: "default" | "vice" | "dark";
}

export default function HamburgerHeader({ variant = "default" }: HamburgerHeaderProps) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    setTimeout(() => {
      setLocation(path);
    }, 50);
  };

  // Style variants
  const headerStyles = {
    default: `${scrolled ? "bg-black/95" : "bg-black/80"} border-b border-[#c8ff00]/20`,
    vice: `${scrolled ? "bg-[#1a0a2e]/95" : "bg-[#1a0a2e]/90"} border-b border-[#ff0080]/20`,
    dark: `${scrolled ? "bg-black/95" : "bg-black/90"} border-b border-white/10`,
  };

  const logoStyles = {
    default: "text-[#c8ff00]",
    vice: "gradient-text-vice font-vice drop-shadow-[0_0_10px_rgba(255,0,128,0.5)]",
    dark: "text-[#c8ff00]",
  };

  const accentColor = {
    default: "#c8ff00",
    vice: "#ff0080",
    dark: "#c8ff00",
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl transition-all duration-300 ${headerStyles[variant]}`}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button 
              onClick={() => setLocation("/")} 
              className="flex items-center gap-2 flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#c8ff00]" />
              </div>
              <span className={`text-2xl font-bold tracking-wider ${logoStyles[variant]}`}>
                NEON
              </span>
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 ${
                menuOpen 
                  ? "bg-[#ff0080]/20 border-2 border-[#ff0080]" 
                  : "bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
              }`}
              aria-label="Toggle menu"
            >
              <div className="relative w-6 h-6">
                <span className={`absolute left-0 top-1 w-6 h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? "rotate-45 translate-y-1.5" : ""
                }`} style={{ backgroundColor: menuOpen ? "#ff0080" : accentColor[variant] }} />
                <span className={`absolute left-0 top-3 w-6 h-0.5 transition-all duration-300 ${
                  menuOpen ? "opacity-0 scale-0" : "opacity-100"
                }`} style={{ backgroundColor: accentColor[variant] }} />
                <span className={`absolute left-0 top-5 w-6 h-0.5 bg-current transition-all duration-300 ${
                  menuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`} style={{ backgroundColor: menuOpen ? "#ff0080" : accentColor[variant] }} />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Dropdown Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Dropdown Menu Panel */}
      <div
        className={`fixed top-[68px] left-0 right-0 z-50 transition-all duration-300 ease-out ${
          menuOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="bg-[#0a0318]/98 backdrop-blur-xl rounded-2xl border border-[#c8ff00]/30 shadow-2xl shadow-black/50 overflow-hidden">
            {/* Accent gradient line at top */}
            <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
            
            {/* Navigation Grid */}
            <nav className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location === item.path;
                  
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-[#c8ff00]/20 border border-[#c8ff00]/50"
                          : "bg-white/5 border border-white/10 hover:bg-[#c8ff00]/10 hover:border-[#c8ff00]/30"
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isActive 
                          ? "bg-[#c8ff00]/30" 
                          : "bg-white/10 group-hover:bg-[#c8ff00]/20"
                      }`}>
                        <Icon className={`w-5 h-5 transition-colors ${
                          isActive ? "text-[#c8ff00]" : "text-white/70 group-hover:text-[#c8ff00]"
                        }`} />
                      </div>
                      <span className={`text-xs font-bold tracking-wide text-center transition-colors ${
                        isActive ? "text-[#c8ff00]" : "text-white/80 group-hover:text-white"
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </nav>

            {/* CTA Section */}
            <div className="p-4 pt-0">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => handleNavClick("/join")}
                  className="flex-1 h-12 text-sm font-bold bg-[#00ffff] hover:bg-[#00ffff]/90 text-black rounded-xl"
                >
                  <Users className="w-4 h-4 mr-2" />
                  JOIN NOW
                </Button>
                <Button
                  onClick={() => handleNavClick("/crowdfund")}
                  className="flex-1 h-12 text-sm font-bold bg-[#ff0080] hover:bg-[#ff0080]/90 text-white rounded-xl"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  BACK THE RELAUNCH
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
