import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  ShoppingBag,
  Gem,
  Users,
  Building2,
  MapPin,
  Trophy,
  Gift,
  TrendingUp,
  CreditCard,
  BarChart3,
  Crown,
  Store,
  Truck,
  Shield,
  UserPlus,
  Heart,
  Zap,
  Star,
} from "lucide-react";

interface ProfileDropdownProps {
  accentColor?: string;
}

export default function ProfileDropdown({ accentColor = "#c8ff00" }: ProfileDropdownProps) {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { user, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  // Check if user is a distributor
  const { data: distributorData } = trpc.distributor.me.useQuery(undefined, {
    enabled: !!user,
  });

  // Check if user has franchise/territory applications
  const { data: franchiseData } = trpc.franchise.list.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });

  // For non-admins, we'll check via a different method
  const { data: territoryApplications } = trpc.territory.listApplications.useQuery(undefined, {
    enabled: !!user && user.role === 'admin',
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSection(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setActiveSection(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  const handleNavClick = (path: string) => {
    setIsOpen(false);
    setActiveSection(null);
    setLocation(path);
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    setIsOpen(false);
    window.location.href = "/";
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  // Determine user type badges
  const isDistributor = !!distributorData;
  // For franchise owner status, we'd need a user-specific query - for now check if they're admin with territories
  const isFranchiseOwner = false; // Will be determined by user's territory ownership
  const hasPendingApplication = false; // Will be determined by user's applications
  const isAdmin = user?.role === 'admin';

  // Get distributor rank if applicable
  const distributorRank = distributorData?.rank || 'starter';

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/20 animate-pulse" />
    );
  }

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-10 px-4 flex items-center gap-2 rounded-xl bg-[#c8ff00]/20 border border-[#c8ff00]/50 hover:bg-[#c8ff00]/30 transition-all duration-200"
        >
          <User className="w-4 h-4 text-[#c8ff00]" />
          <span className="text-sm font-bold text-[#c8ff00] hidden sm:inline">Login</span>
          <ChevronDown className={`w-4 h-4 text-[#c8ff00] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Login Options Dropdown */}
        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-72 bg-[#0a0318]/98 backdrop-blur-xl rounded-xl border border-[#c8ff00]/30 shadow-2xl shadow-black/50 overflow-hidden z-50">
            <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
            
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Welcome to NEON</h3>
              <p className="text-sm text-white/60">Choose how you'd like to sign in</p>
            </div>

            {/* Login Options */}
            <div className="p-3 space-y-2">
              {/* Customer Login */}
              <button
                onClick={handleLogin}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#c8ff00]/10 to-transparent border border-[#c8ff00]/30 hover:border-[#c8ff00]/50 hover:bg-[#c8ff00]/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center group-hover:bg-[#c8ff00]/30 transition-all">
                  <Heart className="w-5 h-5 text-[#c8ff00]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white group-hover:text-[#c8ff00] transition-colors">Customer</div>
                  <div className="text-xs text-white/50">Shop, earn rewards, refer friends</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-[#c8ff00] transition-colors" />
              </button>

              {/* Distributor Login */}
              <button
                onClick={handleLogin}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#00ffff]/10 to-transparent border border-[#00ffff]/30 hover:border-[#00ffff]/50 hover:bg-[#00ffff]/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#00ffff]/20 flex items-center justify-center group-hover:bg-[#00ffff]/30 transition-all">
                  <Users className="w-5 h-5 text-[#00ffff]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white group-hover:text-[#00ffff] transition-colors">Distributor</div>
                  <div className="text-xs text-white/50">Build your team, earn commissions</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-[#00ffff] transition-colors" />
              </button>

              {/* Franchise/Vending Owner Login */}
              <button
                onClick={handleLogin}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#ff0080]/10 to-transparent border border-[#ff0080]/30 hover:border-[#ff0080]/50 hover:bg-[#ff0080]/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-[#ff0080]/20 flex items-center justify-center group-hover:bg-[#ff0080]/30 transition-all">
                  <Building2 className="w-5 h-5 text-[#ff0080]" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-bold text-white group-hover:text-[#ff0080] transition-colors">Franchise Owner</div>
                  <div className="text-xs text-white/50">Manage territory & vending machines</div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-[#ff0080] transition-colors" />
              </button>
            </div>

            {/* Sign Up CTA */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <p className="text-xs text-white/50 text-center mb-2">New to NEON?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavClick("/join")}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#c8ff00] text-black font-bold text-sm hover:bg-[#d4ff33] transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  Join Now
                </button>
                <button
                  onClick={() => handleNavClick("/franchise")}
                  className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#ff0080] text-white font-bold text-sm hover:bg-[#ff3399] transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  Franchise
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Logged in user dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 h-10 px-3 rounded-xl transition-all duration-200 ${
          isOpen
            ? "bg-[#c8ff00]/20 border-2 border-[#c8ff00]"
            : "bg-white/5 border border-white/20 hover:bg-white/10 hover:border-white/30"
        }`}
      >
        <div className="w-7 h-7 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
          <User className="w-4 h-4 text-[#c8ff00]" />
        </div>
        <span className="text-sm font-bold text-white hidden sm:inline max-w-[100px] truncate">
          {user.name?.split(' ')[0] || 'User'}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#c8ff00] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* User Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-[#0a0318]/98 backdrop-blur-xl rounded-xl border border-[#c8ff00]/30 shadow-2xl shadow-black/50 overflow-hidden z-50">
          <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
          
          {/* User Info Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffff]/20 flex items-center justify-center">
                <User className="w-6 h-6 text-[#c8ff00]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">{user.name || "User"}</p>
                <p className="text-xs text-white/50 truncate">{user.email}</p>
                {/* Role Badges */}
                <div className="flex flex-wrap gap-1 mt-1">
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-[#ff0080]/20 text-[#ff0080] text-[10px] font-bold">
                      ADMIN
                    </span>
                  )}
                  {isDistributor && (
                    <span className="px-2 py-0.5 rounded-full bg-[#00ffff]/20 text-[#00ffff] text-[10px] font-bold uppercase">
                      {distributorRank}
                    </span>
                  )}
                  {isFranchiseOwner && (
                    <span className="px-2 py-0.5 rounded-full bg-[#c8ff00]/20 text-[#c8ff00] text-[10px] font-bold">
                      FRANCHISE
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2 border-b border-white/10">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => handleNavClick("/customer-portal")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#c8ff00]/10 transition-all group"
              >
                <Gift className="w-5 h-5 text-[#c8ff00] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-white/60 group-hover:text-white">Rewards</span>
              </button>
              <button
                onClick={() => handleNavClick("/orders")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#c8ff00]/10 transition-all group"
              >
                <ShoppingBag className="w-5 h-5 text-[#c8ff00] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-white/60 group-hover:text-white">Orders</span>
              </button>
              <button
                onClick={() => handleNavClick("/nft-gallery")}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#00ffff]/10 transition-all group"
              >
                <Gem className="w-5 h-5 text-[#00ffff] group-hover:scale-110 transition-transform" />
                <span className="text-[10px] text-white/60 group-hover:text-white">NFTs</span>
              </button>
            </div>
          </div>

          {/* Portal Links */}
          <div className="p-2 max-h-[300px] overflow-y-auto">
            {/* Customer Section */}
            <div className="mb-2">
              <button
                onClick={() => setActiveSection(activeSection === 'customer' ? null : 'customer')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#c8ff00]" />
                  <span className="text-sm font-semibold text-white">Customer Portal</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${activeSection === 'customer' ? 'rotate-90' : ''}`} />
              </button>
              {activeSection === 'customer' && (
                <div className="ml-6 mt-1 space-y-1">
                  <button onClick={() => handleNavClick("/customer-portal")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#c8ff00]/10 transition-all text-sm">
                    <Gift className="w-4 h-4" /> 3-for-Free Rewards
                  </button>
                  <button onClick={() => handleNavClick("/orders")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#c8ff00]/10 transition-all text-sm">
                    <ShoppingBag className="w-4 h-4" /> My Orders
                  </button>
                  <button onClick={() => handleNavClick("/leaderboard")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#c8ff00]/10 transition-all text-sm">
                    <Trophy className="w-4 h-4" /> Leaderboard
                  </button>
                </div>
              )}
            </div>

            {/* Distributor Section */}
            <div className="mb-2">
              <button
                onClick={() => setActiveSection(activeSection === 'distributor' ? null : 'distributor')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#00ffff]" />
                  <span className="text-sm font-semibold text-white">Distributor Portal</span>
                  {!isDistributor && (
                    <span className="px-1.5 py-0.5 rounded bg-[#00ffff]/20 text-[#00ffff] text-[10px]">JOIN</span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${activeSection === 'distributor' ? 'rotate-90' : ''}`} />
              </button>
              {activeSection === 'distributor' && (
                <div className="ml-6 mt-1 space-y-1">
                  {isDistributor ? (
                    <>
                      <button onClick={() => handleNavClick("/portal")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <BarChart3 className="w-4 h-4" /> Dashboard
                      </button>
                      <button onClick={() => handleNavClick("/portal?tab=team")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <Users className="w-4 h-4" /> My Team
                      </button>
                      <button onClick={() => handleNavClick("/portal?tab=commissions")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <CreditCard className="w-4 h-4" /> Commissions
                      </button>
                      <button onClick={() => handleNavClick("/portal?tab=autoship")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <Truck className="w-4 h-4" /> Autoship
                      </button>
                      <button onClick={() => handleNavClick("/compensation")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <TrendingUp className="w-4 h-4" /> Comp Plan
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleNavClick("/join")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#00ffff] hover:bg-[#00ffff]/10 transition-all text-sm font-semibold">
                        <UserPlus className="w-4 h-4" /> Become a Distributor
                      </button>
                      <button onClick={() => handleNavClick("/compensation")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#00ffff]/10 transition-all text-sm">
                        <TrendingUp className="w-4 h-4" /> View Comp Plan
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Franchise/Vending Section */}
            <div className="mb-2">
              <button
                onClick={() => setActiveSection(activeSection === 'franchise' ? null : 'franchise')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#ff0080]" />
                  <span className="text-sm font-semibold text-white">Franchise Portal</span>
                  {hasPendingApplication && (
                    <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px]">PENDING</span>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${activeSection === 'franchise' ? 'rotate-90' : ''}`} />
              </button>
              {activeSection === 'franchise' && (
                <div className="ml-6 mt-1 space-y-1">
                  {isFranchiseOwner ? (
                    <>
                      <button onClick={() => handleNavClick("/franchise/dashboard")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                        <BarChart3 className="w-4 h-4" /> Dashboard
                      </button>
                      <button onClick={() => handleNavClick("/franchise/territories")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                        <MapPin className="w-4 h-4" /> My Territories
                      </button>
                      <button onClick={() => handleNavClick("/franchise/vending")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                        <Store className="w-4 h-4" /> Vending Machines
                      </button>
                      <button onClick={() => handleNavClick("/franchise/earnings")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                        <CreditCard className="w-4 h-4" /> Earnings
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleNavClick("/franchise")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#ff0080] hover:bg-[#ff0080]/10 transition-all text-sm font-semibold">
                        <MapPin className="w-4 h-4" /> Explore Territories
                      </button>
                      <button onClick={() => handleNavClick("/vending")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                        <Store className="w-4 h-4" /> Vending Opportunity
                      </button>
                      {hasPendingApplication && (
                        <button onClick={() => handleNavClick("/franchise/applications")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-yellow-400 hover:bg-yellow-500/10 transition-all text-sm">
                          <Zap className="w-4 h-4" /> View Application
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Admin Section - Only for admins */}
            {isAdmin && (
              <div className="mb-2">
                <button
                  onClick={() => setActiveSection(activeSection === 'admin' ? null : 'admin')}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#ff0080]" />
                    <span className="text-sm font-semibold text-white">Admin Panel</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-white/40 transition-transform ${activeSection === 'admin' ? 'rotate-90' : ''}`} />
                </button>
                {activeSection === 'admin' && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button onClick={() => handleNavClick("/admin")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                      <BarChart3 className="w-4 h-4" /> Dashboard
                    </button>
                    <button onClick={() => handleNavClick("/admin/users")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                      <Users className="w-4 h-4" /> Users
                    </button>
                    <button onClick={() => handleNavClick("/admin/distributors")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                      <Crown className="w-4 h-4" /> Distributors
                    </button>
                    <button onClick={() => handleNavClick("/admin/territories")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                      <MapPin className="w-4 h-4" /> Territories
                    </button>
                    <button onClick={() => handleNavClick("/admin/mlm")} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-[#ff0080]/10 transition-all text-sm">
                      <TrendingUp className="w-4 h-4" /> MLM Panel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Profile & Settings */}
            <div className="border-t border-white/10 pt-2 mt-2">
              <button
                onClick={() => handleNavClick("/profile")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Profile & Settings</span>
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#ff0080] hover:bg-[#ff0080]/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
