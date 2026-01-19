import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, MapPin, Users, Trophy, Building2, Store, Home, BookOpen, Star, Gem } from "lucide-react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

const navItems = [
  { label: "HOME", path: "/", icon: Home },
  { label: "OUR STORY", path: "/about", icon: BookOpen },
  { label: "PRODUCTS", path: "/products", icon: Store },
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
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const handleNavClick = (path: string) => {
    onClose();
    // Small delay to allow menu to close smoothly
    setTimeout(() => {
      onNavigate(path);
    }, 50);
  };

  return (
    <>
      {/* Backdrop - always rendered but visibility controlled */}
      <div
        className={`fixed inset-0 bg-black/90 z-[100] transition-opacity duration-200 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Menu panel - fixed position, no transform to avoid rendering issues */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-[320px] z-[101] transition-all duration-200 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        {/* Solid background - no transparency */}
        <div className="absolute inset-0 bg-[#0a0318]" />
        
        {/* Simple accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />

        {/* Content */}
        <div className="relative h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#c8ff00]/30 bg-black/50">
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

          {/* Navigation - scrollable */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                      isActive
                        ? "bg-[#c8ff00]/20 border border-[#c8ff00]/50"
                        : "bg-white/5 border border-white/10 active:bg-[#c8ff00]/10"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-[#c8ff00]/30" : "bg-white/10"
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#c8ff00]" : "text-white/70"}`} />
                    </div>
                    <span className={`text-sm font-bold tracking-wide ${
                      isActive ? "text-[#c8ff00]" : "text-white/90"
                    }`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#c8ff00] flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* CTA Buttons - fixed at bottom */}
          <div className="p-3 border-t border-[#c8ff00]/30 bg-black/50 space-y-2">
            <Button
              onClick={() => handleNavClick("/join")}
              className="w-full h-11 text-sm font-bold bg-[#00ffff] hover:bg-[#00ffff]/90 text-black"
            >
              <Users className="w-4 h-4 mr-2" />
              JOIN NOW
            </Button>
            <Button
              onClick={() => handleNavClick("/crowdfund")}
              className="w-full h-11 text-sm font-bold bg-[#ff0080] hover:bg-[#ff0080]/90 text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              BACK THE RELAUNCH
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
