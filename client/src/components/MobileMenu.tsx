import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, MapPin, Users, Trophy, Building2, Store, DollarSign, Home, BookOpen, Star, Gem } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

const navItems = [
  { label: "HOME", path: "/", icon: Home },
  { label: "OUR STORY", path: "/about", icon: BookOpen },
  { label: "PRODUCTS", path: "/shop", icon: Store },
  { label: "CELEBRITY FANS", path: "/celebrities", icon: Star },
  { label: "FRANCHISE", path: "/franchise", icon: MapPin },
  { label: "VENDING", path: "/vending", icon: Building2 },
  { label: "NFT GALLERY", path: "/nft-gallery", icon: Gem },
];

export default function MobileMenu({ isOpen, onClose, onNavigate, currentPath = "/" }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = (path: string) => {
    onClose();
    // Navigate immediately for snappy response
    onNavigate(path);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-[100] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Menu panel - slides in from right */}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-sm z-[101] transform transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#0d0620] to-[#0a0318]" />
        
        {/* Simple grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200, 255, 0, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200, 255, 0, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#c8ff00]/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#c8ff00]" />
              </div>
              <span className="text-xl font-black text-[#c8ff00] tracking-wider">
                NEON
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-lg bg-[#ff0080]/20 border border-[#ff0080]/40 flex items-center justify-center active:scale-95 transition-transform"
            >
              <X className="w-5 h-5 text-[#ff0080]" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? "bg-[#c8ff00]/20 border border-[#c8ff00]/50"
                        : "bg-white/5 border border-white/10 active:bg-[#c8ff00]/10"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isActive ? "bg-[#c8ff00]/20" : "bg-white/5"
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? "text-[#c8ff00]" : "text-white/60"}`} />
                    </div>
                    <span className={`text-base font-bold tracking-wide ${
                      isActive ? "text-[#c8ff00]" : "text-white/80"
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#c8ff00]" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="p-4 border-t border-[#c8ff00]/20 space-y-2">
            <Button
              onClick={() => handleNavClick("/join")}
              className="w-full h-12 text-base font-bold bg-[#00ffff] text-black active:scale-98 transition-transform"
            >
              <Users className="w-4 h-4 mr-2" />
              JOIN NOW
            </Button>
            <Button
              onClick={() => handleNavClick("/crowdfund")}
              className="w-full h-12 text-base font-bold bg-[#ff0080] text-white active:scale-98 transition-transform"
            >
              <Trophy className="w-4 h-4 mr-2" />
              BACK THE RELAUNCH
            </Button>
          </div>

          {/* Bottom accent line */}
          <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
        </div>
      </div>
    </>
  );
}
