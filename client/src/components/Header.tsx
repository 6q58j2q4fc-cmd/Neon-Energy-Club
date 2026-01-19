import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import NeonLogo from "./NeonLogo";
import MobileMenu from "./MobileMenu";

const navItems = [
  { label: "HOME", path: "/" },
  { label: "STORY", path: "/about" },
  { label: "PRODUCTS", path: "/products" },
  { label: "CELEBRITIES", path: "/celebrities" },
  { label: "FRANCHISE", path: "/franchise" },
  { label: "VENDING", path: "/vending" },
  { label: "NFTs", path: "/nft-gallery" },
];

export default function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-gradient-to-r from-[#0a1a1a]/95 via-[#0d2818]/90 to-[#0a1a1a]/95 backdrop-blur-md py-2 shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
            : "bg-gradient-to-b from-[#0a1a1a]/80 to-transparent py-4"
        }`}
      >
        {/* Subtle neon accent line at bottom when scrolled */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c8ff00]/30 to-transparent" />
        )}
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => setLocation("/")} className="flex-shrink-0 group">
              <NeonLogo className="h-10 w-auto transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(200,255,0,0.5)]" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-3 py-2 text-sm font-semibold tracking-wide transition-all duration-200 relative ${
                    location === item.path
                      ? "text-[#c8ff00] drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]"
                      : "text-white/70 hover:text-[#c8ff00]"
                  }`}
                >
                  {item.label}
                  {location === item.path && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#c8ff00] rounded-full shadow-[0_0_8px_rgba(200,255,0,0.8)]" />
                  )}
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                onClick={() => setLocation("/join")}
                variant="outline"
                className="text-[#00ffff] border-[#00ffff]/50 hover:bg-[#00ffff]/10 hover:border-[#00ffff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] font-bold transition-all duration-200"
              >
                JOIN NOW
              </Button>
              <Button
                onClick={() => setLocation("/crowdfund")}
                className="bg-[#ff0080] hover:bg-[#ff0080]/90 hover:shadow-[0_0_20px_rgba(255,0,128,0.4)] text-white font-bold transition-all duration-200"
              >
                BACK US
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-[#0d2818]/50 border border-[#c8ff00]/20 active:scale-95 transition-all hover:border-[#c8ff00]/40 hover:bg-[#0d2818]/70"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#c8ff00]" />
              ) : (
                <Menu className="w-5 h-5 text-[#c8ff00]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={setLocation}
        currentPath={location}
      />
    </>
  );
}
