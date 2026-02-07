import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Zap, MapPin, Users, Trophy, Building2, Store, Home, BookOpen, Star, Gem, Heart, User, LogOut, Crown, Settings, Gift, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import LanguageSwitcher from "./LanguageSwitcher";

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

const portalItems = [
  { 
    label: "Customer Portal", 
    path: "/customer-portal", 
    icon: Heart, 
    color: "#c8ff00",
    description: "3-for-Free rewards, referrals"
  },
  { 
    label: "Distributor Portal", 
    path: "/portal", 
    icon: Users, 
    color: "#00ffff",
    description: "Team building, commissions"
  },
  { 
    label: "Franchise Portal", 
    path: "/franchise/dashboard", 
    icon: Building2, 
    color: "#ff0080",
    description: "Territory & vending management"
  },
];

export default function MobileMenu({ isOpen, onClose, onNavigate, currentPath = "/" }: MobileMenuProps) {
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.reload(),
  });

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

  const handleLogin = () => {
    onClose();
    window.location.href = '/login';
  };

  const handleLogout = () => {
    onClose();
    logoutMutation.mutate();
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
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg bg-[#ff0080]/20 border border-[#ff0080]/40 flex items-center justify-center active:scale-95 transition-transform"
              >
                <X className="w-5 h-5 text-[#ff0080]" />
              </button>
            </div>
          </div>

          {/* User Info - if logged in */}
          {user && (
            <div className="px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c8ff00]/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#c8ff00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name || 'User'}</p>
                  <p className="text-xs text-white/50 truncate">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded bg-[#ff0080]/20 text-[#ff0080] text-[10px] font-bold">ADMIN</span>
                )}
              </div>
            </div>
          )}

          {/* Prominent Login Button - Only when not logged in */}
          {!user && (
            <div className="px-3 pt-4 pb-2">
              <button
                onClick={handleLogin}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00ffff] to-[#c8ff00] text-[#0a1a1a] font-bold text-base tracking-wide rounded-xl hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
              >
                <User className="w-5 h-5" />
                LOGIN TO YOUR ACCOUNT
              </button>
            </div>
          )}

          {/* Navigation - scrollable */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {/* Portal Access Section - Only when logged in */}
            {user && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 mb-2">Your Portals</p>
                <div className="space-y-1">
                  {portalItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPath === item.path;
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavClick(item.path)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                          isActive
                            ? "bg-white/10 border border-white/20"
                            : "bg-transparent hover:bg-white/5 active:bg-white/10"
                        }`}
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold text-white block">{item.label}</span>
                          <span className="text-[10px] text-white/50">{item.description}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </button>
                    );
                  })}
                  
                  {/* Admin Panel - Only for admins */}
                  {user.role === 'admin' && (
                    <button
                      onClick={() => handleNavClick("/admin")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                        currentPath.startsWith('/admin')
                          ? "bg-[#ff0080]/20 border border-[#ff0080]/40"
                          : "bg-transparent hover:bg-[#ff0080]/10 active:bg-[#ff0080]/20"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#ff0080]/20">
                        <Crown className="w-4 h-4 text-[#ff0080]" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="text-sm font-semibold text-[#ff0080] block">Admin Panel</span>
                        <span className="text-[10px] text-white/50">Full system control</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#ff0080]/50" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Login Options - Only when not logged in */}
            {!user && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 mb-2">Sign In As</p>
                <div className="space-y-1">
                  {portalItems.map((item) => {
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.path}
                        onClick={handleLogin}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 bg-transparent hover:bg-white/5 active:bg-white/10"
                      >
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-sm font-semibold text-white block">{item.label.replace(' Portal', '')}</span>
                          <span className="text-[10px] text-white/50">{item.description}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Main Navigation */}
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider px-3 mb-2">Navigation</p>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 ${
                      isActive
                        ? "bg-[#c8ff00]/20 border border-[#c8ff00]/50"
                        : "bg-white/5 border border-white/10 active:bg-[#c8ff00]/10"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
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

            {/* Quick Links - when logged in */}
            {user && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="space-y-1">
                  <button
                    onClick={() => handleNavClick("/orders")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Gift className="w-4 h-4" />
                    <span className="text-sm">My Orders</span>
                  </button>
                  <button
                    onClick={() => handleNavClick("/profile")}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Profile & Settings</span>
                  </button>
                </div>
              </div>
            )}
          </nav>

          {/* CTA Buttons - fixed at bottom */}
          <div className="p-3 border-t border-[#c8ff00]/30 bg-black/50 space-y-2">
            {user ? (
              <>
                <Button
                  onClick={() => handleNavClick("/crowdfund")}
                  className="w-full h-11 text-sm font-bold bg-[#ff0080] hover:bg-[#ff0080]/90 text-white"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  BACK THE RELAUNCH
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full h-11 text-sm font-bold border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleLogin}
                  className="w-full h-11 text-sm font-bold bg-[#c8ff00] hover:bg-[#c8ff00]/90 text-black"
                >
                  <User className="w-4 h-4 mr-2" />
                  SIGN IN
                </Button>
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
