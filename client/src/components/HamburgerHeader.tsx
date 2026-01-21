import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Zap, Home, BookOpen, Store, Star, MapPin, Building2, Gem, Users, Trophy, 
  Search, X, User, Package, LogOut, ChevronDown, Settings, ShoppingBag, TrendingUp, ShoppingCart
} from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCart } from "@/contexts/CartContext";

const navItems = [
  { label: "HOME", path: "/", icon: Home },
  { label: "OUR STORY", path: "/about", icon: BookOpen },
  { label: "PRODUCTS", path: "/products", icon: Store },
  { label: "CELEBRITY FANS", path: "/celebrities", icon: Star },
  { label: "FRANCHISE", path: "/franchise", icon: MapPin },
  { label: "VENDING", path: "/vending", icon: Building2 },
  { label: "NFT GALLERY", path: "/nft-gallery", icon: Gem },
  { label: "LEADERBOARD", path: "/leaderboard", icon: Trophy },
  { label: "INVESTORS", path: "/investors", icon: TrendingUp },
];

// Product data with variants, pricing, and availability
const products = [
  { 
    title: "NEON Original", 
    path: "/products", 
    keywords: ["original", "green", "classic", "100 calories", "energy", "drink"],
    category: "product",
    price: "$2.99",
    description: "100 calories, classic energy formula",
    availability: "Pre-Order",
    variants: ["8.4 fl oz", "12-pack", "24-pack"]
  },
  { 
    title: "NEON Organic", 
    path: "/products", 
    keywords: ["organic", "usda", "40 calories", "orange", "natural", "healthy"],
    category: "product",
    price: "$3.49",
    description: "40 calories, USDA certified organic",
    availability: "Pre-Order",
    variants: ["8.4 fl oz", "12-pack", "24-pack"]
  },
  {
    title: "Starter Pack (12 cans)",
    path: "/shop",
    keywords: ["starter", "pack", "12", "case", "buy", "purchase"],
    category: "product",
    price: "$29.99",
    description: "12 cans of NEON energy drink",
    availability: "Pre-Order"
  },
  {
    title: "Full Case (24 cans)",
    path: "/shop",
    keywords: ["case", "24", "bulk", "wholesale", "buy", "purchase"],
    category: "product",
    price: "$49.99",
    description: "24 cans of NEON energy drink",
    availability: "Pre-Order"
  },
];

const searchablePages = [
  { title: "Home", path: "/", keywords: ["home", "main", "start"], category: "page" },
  { title: "Our Story", path: "/about", keywords: ["about", "story", "history", "founder", "brand"], category: "page" },
  { title: "Products", path: "/products", keywords: ["products", "drinks", "energy", "original", "organic", "flavors"], category: "page" },
  { title: "Celebrity Fans", path: "/celebrities", keywords: ["celebrities", "famous", "stars", "snoop", "chris brown", "ambassadors"], category: "page" },
  { title: "Franchise", path: "/franchise", keywords: ["franchise", "territory", "business", "license", "opportunity"], category: "page" },
  { title: "Vending", path: "/vending", keywords: ["vending", "machines", "ai", "locations", "smart"], category: "page" },
  { title: "NFT Gallery", path: "/nft-gallery", keywords: ["nft", "crypto", "blockchain", "collectibles", "digital"], category: "page" },
  { title: "Shop", path: "/shop", keywords: ["shop", "buy", "purchase", "order", "distributor", "store"], category: "page" },
  { title: "Crowdfund", path: "/crowdfund", keywords: ["crowdfund", "invest", "back", "support", "relaunch", "campaign"], category: "page" },
  { title: "FAQ", path: "/faq", keywords: ["faq", "questions", "help", "support", "contact", "answers"], category: "page" },
  { title: "Join Now", path: "/join", keywords: ["join", "signup", "register", "account", "become"], category: "page" },
  { title: "Profile", path: "/profile", keywords: ["profile", "account", "settings", "user", "my"], category: "page" },
  { title: "My Orders", path: "/orders", keywords: ["orders", "purchases", "history", "tracking", "my"], category: "page" },
  { title: "Privacy Policy", path: "/privacy", keywords: ["privacy", "policy", "data", "legal"], category: "page" },
  { title: "Terms & Conditions", path: "/terms", keywords: ["terms", "conditions", "legal", "agreement"], category: "page" },
  { title: "Investors", path: "/investors", keywords: ["invest", "investors", "funding", "equity", "capital", "opportunity"], category: "page" },
  { title: "Leaderboard", path: "/leaderboard", keywords: ["leaderboard", "ranking", "top", "referrals", "points"], category: "page" },
  { title: "Blog", path: "/blog", keywords: ["blog", "news", "articles", "posts", "updates"], category: "page" },
  { title: "Policies & Procedures", path: "/policies", keywords: ["policies", "procedures", "rules", "guidelines"], category: "page" },
  { title: "Leaderboard", path: "/leaderboard", keywords: ["leaderboard", "referral", "ranking", "top", "champions", "rewards"], category: "page" },
];

interface HamburgerHeaderProps {
  variant?: "default" | "vice" | "dark";
}

export default function HamburgerHeader({ variant = "default" }: HamburgerHeaderProps) {
  const [location, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (menuOpen || searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, searchOpen]);

  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    setSearchOpen(false);
    setTimeout(() => {
      setLocation(path);
    }, 50);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setUserMenuOpen(false);
    window.location.href = "/";
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  // Filter search results - combine products and pages
  const searchResults = searchQuery.trim() 
    ? [
        // Search products first
        ...products.filter(product => 
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
        // Then search pages
        ...searchablePages.filter(page => 
          page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          page.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      ].slice(0, 8)
    : [];

  // Style variants
  const headerStyles = {
    default: `${scrolled ? "bg-black/95" : "bg-black/80"} border-b border-[#c8ff00]/20`,
    vice: `${scrolled ? "bg-[#0d2818]/95" : "bg-[#0d2818]/90"} border-b border-[#ff0080]/20`,
    dark: `${scrolled ? "bg-black/95" : "bg-black/90"} border-b border-white/10`,
  };

  const logoStyles = {
    default: "text-white",
    vice: "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]",
    dark: "text-white",
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
          <div className="flex items-center justify-between gap-3">
            {/* Logo */}
            <button 
              onClick={() => setLocation("/")} 
              className="flex items-center flex-shrink-0 group"
            >
              <Zap className="w-6 h-6 text-[#c8ff00] group-hover:text-[#d4ff33] transition-colors" />
              <div className="flex flex-col items-center mx-2">
                <span className={`text-2xl font-bold tracking-[0.2em] ${logoStyles[variant]}`}>
                  NEON
                </span>
                <div className="w-full h-[2px] bg-gradient-to-r from-[#c8ff00] to-[#00ffff] mt-0.5" />
              </div>
            </button>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="w-5 h-5" style={{ color: accentColor[variant] }} />
              </button>

              {/* Shopping Cart Button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-200"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-5 h-5" style={{ color: accentColor[variant] }} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ff0080] text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* User Account Button with Full Portal Access */}
              <ProfileDropdown accentColor={accentColor[variant]} />

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
        </div>
      </header>

      {/* Search Overlay */}
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          searchOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSearchOpen(false)}
      />

      {/* Search Modal */}
      <div
        className={`fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[70] transition-all duration-300 ${
          searchOpen 
            ? "opacity-100 translate-y-0 pointer-events-auto" 
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-[#0a0318]/98 backdrop-blur-xl rounded-2xl border border-[#c8ff00]/30 shadow-2xl shadow-black/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
          
          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, pages..."
                className="w-full h-14 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#c8ff00]/50 focus:bg-white/10 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="hidden sm:inline-flex h-6 px-2 items-center justify-center rounded bg-white/10 text-xs text-white/50 font-mono">
                  ESC
                </kbd>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="border-t border-white/10">
              {searchResults.length > 0 ? (
                <div className="p-2 max-h-80 overflow-y-auto">
                  {searchResults.map((result, index) => {
                    const isProduct = result.category === "product";
                    const productResult = result as typeof products[0];
                    return (
                      <button
                        key={`${result.path}-${index}`}
                        onClick={() => handleNavClick(result.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-[#c8ff00]/10 transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isProduct 
                            ? "bg-[#c8ff00]/20 group-hover:bg-[#c8ff00]/30" 
                            : "bg-white/10 group-hover:bg-[#c8ff00]/20"
                        }`}>
                          {isProduct ? (
                            <Store className="w-4 h-4 text-[#c8ff00]" />
                          ) : (
                            <Search className="w-4 h-4 text-white/60 group-hover:text-[#c8ff00]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white group-hover:text-[#c8ff00] transition-colors">
                              {result.title}
                            </p>
                            {isProduct && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[#c8ff00]/20 text-[#c8ff00]">
                                Product
                              </span>
                            )}
                          </div>
                          {isProduct ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-[#c8ff00] font-bold">{productResult.price}</span>
                              <span className="text-xs text-white/40">•</span>
                              <span className="text-xs text-white/40">{productResult.description}</span>
                              {productResult.availability && (
                                <>
                                  <span className="text-xs text-white/40">•</span>
                                  <span className="text-xs text-[#ff0080]">{productResult.availability}</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-white/40">{result.path}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-white/40">No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}

          {/* Quick Links when no search */}
          {!searchQuery && (
            <div className="border-t border-white/10 p-4">
              <p className="text-xs text-white/40 mb-3 px-2">QUICK LINKS</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick("/products")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#c8ff00]/10 transition-all text-left"
                >
                  <Store className="w-4 h-4 text-[#c8ff00]" />
                  <span className="text-sm text-white/80">Products</span>
                </button>
                <button
                  onClick={() => handleNavClick("/shop")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#c8ff00]/10 transition-all text-left"
                >
                  <ShoppingBag className="w-4 h-4 text-[#c8ff00]" />
                  <span className="text-sm text-white/80">Shop</span>
                </button>
                <button
                  onClick={() => handleNavClick("/crowdfund")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#ff0080]/10 transition-all text-left"
                >
                  <Trophy className="w-4 h-4 text-[#ff0080]" />
                  <span className="text-sm text-white/80">Crowdfund</span>
                </button>
                <button
                  onClick={() => handleNavClick("/nft-gallery")}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-[#00ffff]/10 transition-all text-left"
                >
                  <Gem className="w-4 h-4 text-[#00ffff]" />
                  <span className="text-sm text-white/80">NFT Gallery</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
                  className="flex-1 h-12 text-sm font-bold bg-[#c8ff00] hover:bg-[#d4ff33] text-black rounded-xl shadow-lg shadow-[#c8ff00]/30"
                >
                  <Users className="w-4 h-4 mr-2" />
                  JOIN NOW
                </Button>
                <Button
                  onClick={() => handleNavClick("/crowdfund")}
                  className="flex-1 h-12 text-sm font-bold bg-[#c8ff00] hover:bg-[#d4ff33] text-black rounded-xl shadow-lg shadow-[#c8ff00]/30"
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
