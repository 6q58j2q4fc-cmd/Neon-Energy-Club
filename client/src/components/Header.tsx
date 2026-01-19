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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? "bg-black/90 py-2" : "bg-transparent py-4"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => setLocation("/")} className="flex-shrink-0">
              <NeonLogo className="h-10 w-auto" />
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-3 py-2 text-sm font-semibold tracking-wide transition-colors ${
                    location === item.path
                      ? "text-[#b8e600]"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop CTA Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <Button
                onClick={() => setLocation("/join")}
                variant="outline"
                className="text-[#00ffff] border-[#00ffff]/50 hover:bg-[#00ffff]/10 font-bold"
              >
                JOIN NOW
              </Button>
              <Button
                onClick={() => setLocation("/crowdfund")}
                className="bg-[#ff0080] hover:bg-[#ff0080]/80 text-white font-bold"
              >
                BACK US
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 active:scale-95 transition-transform"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-[#b8e600]" />
              ) : (
                <Menu className="w-5 h-5 text-[#b8e600]" />
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
