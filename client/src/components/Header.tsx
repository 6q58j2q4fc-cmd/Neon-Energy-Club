import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, ShoppingCart, User, Users, Building2, Heart, MapPin, Settings, LogOut, Crown, Gift, BarChart3, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import NeonLogo from "./NeonLogo";
import MobileMenu from "./MobileMenu";
import { trpc } from "@/lib/trpc";
import { useCart } from "@/contexts/CartContext";
import LanguageSwitcher from "./LanguageSwitcher";

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
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { user, isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => window.location.reload(),
  });

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
              {/* Language Switcher */}
              <LanguageSwitcher />
              {/* Shopping Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-[#0d2818]/70 border-2 border-[#c8ff00]/40 hover:border-[#c8ff00]/60 hover:bg-[#0d2818]/90 transition-all duration-200 shadow-[0_0_10px_rgba(200,255,0,0.2)]"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-7 h-7 text-[#c8ff00] stroke-[2.5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff0080] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              {/* Login/Account Dropdown - All User Types */}
              {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-[#c8ff00] border-[#c8ff00]/50 hover:bg-[#c8ff00]/10 hover:border-[#c8ff00] font-bold transition-all duration-200"
                      >
                        <User className="w-4 h-4 mr-2" />
                        {user.name?.split(' ')[0] || 'Account'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-[#0a1a1a] border-[#c8ff00]/30">
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-[#c8ff00]/20">
                        <p className="text-sm font-bold text-white">{user.name || 'User'}</p>
                        <p className="text-xs text-white/50">{user.email}</p>
                      </div>
                      
                      {/* Customer Portal */}
                      <DropdownMenuItem 
                        onClick={() => setLocation("/customer-portal")}
                        className="text-white hover:text-[#c8ff00] hover:bg-[#c8ff00]/10 cursor-pointer"
                      >
                        <Heart className="w-4 h-4 mr-2 text-[#c8ff00]" />
                        Customer Portal
                        <span className="ml-auto text-[10px] text-[#c8ff00]/70">3-for-Free</span>
                      </DropdownMenuItem>
                      
                      {/* Distributor Portal */}
                      <DropdownMenuItem 
                        onClick={() => setLocation("/portal")}
                        className="text-white hover:text-[#00ffff] hover:bg-[#00ffff]/10 cursor-pointer"
                      >
                        <Users className="w-4 h-4 mr-2 text-[#00ffff]" />
                        Distributor Portal
                        <span className="ml-auto text-[10px] text-[#00ffff]/70">MLM</span>
                      </DropdownMenuItem>
                      
                      {/* Franchise/Vending Portal */}
                      <DropdownMenuItem 
                        onClick={() => setLocation("/franchise/dashboard")}
                        className="text-white hover:text-[#ff0080] hover:bg-[#ff0080]/10 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 mr-2 text-[#ff0080]" />
                        Franchise Portal
                        <span className="ml-auto text-[10px] text-[#ff0080]/70">Territory</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-[#c8ff00]/20" />
                      
                      {/* Quick Links */}
                      <DropdownMenuItem 
                        onClick={() => setLocation("/orders")}
                        className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        My Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLocation("/track-order")}
                        className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
                      >
                        <Package className="w-4 h-4 mr-2" />
                        Track Order
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => setLocation("/profile")}
                        className="text-white/70 hover:text-white hover:bg-white/5 cursor-pointer"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Profile & Settings
                      </DropdownMenuItem>
                      
                      {/* Admin Link - Only for admins */}
                      {user.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator className="bg-[#ff0080]/20" />
                          <DropdownMenuItem 
                            onClick={() => setLocation("/admin")}
                            className="text-[#ff0080] hover:bg-[#ff0080]/10 cursor-pointer"
                          >
                            <Crown className="w-4 h-4 mr-2" />
                            Admin Panel
                          </DropdownMenuItem>
                        </>
                      )}
                      
                      <DropdownMenuSeparator className="bg-[#c8ff00]/20" />
                      <DropdownMenuItem 
                        onClick={() => logoutMutation.mutate()}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="text-[#00ffff] border-[#00ffff]/50 hover:bg-[#00ffff]/10 hover:border-[#00ffff] hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] font-bold transition-all duration-200"
                      >
                        <User className="w-4 h-4 mr-2" />
                        LOGIN
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 bg-[#0a1a1a] border-[#c8ff00]/30">
                      {/* Login Header */}
                      <div className="px-3 py-2 border-b border-[#c8ff00]/20">
                        <p className="text-sm font-bold text-white">Welcome to NEON</p>
                        <p className="text-xs text-white/50">Choose how you'd like to sign in</p>
                      </div>
                      
                      {/* Customer Login */}
                      <DropdownMenuItem 
                        onClick={() => window.location.href = getLoginUrl()}
                        className="text-white hover:text-[#c8ff00] hover:bg-[#c8ff00]/10 cursor-pointer py-3"
                      >
                        <Heart className="w-4 h-4 mr-2 text-[#c8ff00]" />
                        <div className="flex flex-col">
                          <span className="font-semibold">Customer</span>
                          <span className="text-[10px] text-white/50">Shop, earn rewards, refer friends</span>
                        </div>
                      </DropdownMenuItem>
                      
                      {/* Distributor Login */}
                      <DropdownMenuItem 
                        onClick={() => window.location.href = getLoginUrl()}
                        className="text-white hover:text-[#00ffff] hover:bg-[#00ffff]/10 cursor-pointer py-3"
                      >
                        <Users className="w-4 h-4 mr-2 text-[#00ffff]" />
                        <div className="flex flex-col">
                          <span className="font-semibold">Distributor</span>
                          <span className="text-[10px] text-white/50">Build your team, earn commissions</span>
                        </div>
                      </DropdownMenuItem>
                      
                      {/* Franchise Owner Login */}
                      <DropdownMenuItem 
                        onClick={() => window.location.href = getLoginUrl()}
                        className="text-white hover:text-[#ff0080] hover:bg-[#ff0080]/10 cursor-pointer py-3"
                      >
                        <Building2 className="w-4 h-4 mr-2 text-[#ff0080]" />
                        <div className="flex flex-col">
                          <span className="font-semibold">Franchise Owner</span>
                          <span className="text-[10px] text-white/50">Manage territory & vending machines</span>
                        </div>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator className="bg-[#c8ff00]/20" />
                      
                      {/* Sign Up Options */}
                      <div className="p-2 space-y-1">
                        <DropdownMenuItem 
                          onClick={() => setLocation("/join")}
                          className="text-[#c8ff00] hover:bg-[#c8ff00]/10 cursor-pointer font-semibold justify-center"
                        >
                          Create Account
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => setLocation("/franchise")}
                          className="text-[#ff0080] hover:bg-[#ff0080]/10 cursor-pointer font-semibold justify-center"
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          Explore Franchise
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}
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

            {/* Mobile Cart & Menu Buttons */}
            <div className="lg:hidden flex items-center gap-2">
              {/* Mobile Shopping Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-[#0d2818]/70 border-2 border-[#c8ff00]/40 hover:border-[#c8ff00]/60 hover:bg-[#0d2818]/90 transition-all duration-200 shadow-[0_0_10px_rgba(200,255,0,0.2)]"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-7 h-7 text-[#c8ff00] stroke-[2.5]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff0080] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
              {/* Mobile Menu Button */}
              <button
                className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#0d2818]/70 border-2 border-[#c8ff00]/40 active:scale-95 transition-all hover:border-[#c8ff00]/60 hover:bg-[#0d2818]/90 shadow-[0_0_10px_rgba(200,255,0,0.2)]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-7 h-7 text-[#c8ff00] stroke-[2.5]" />
                ) : (
                  <Menu className="w-7 h-7 text-[#c8ff00] stroke-[2.5]" />
                )}
              </button>
            </div>
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
