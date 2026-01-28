import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  Menu, X, Home, Users, DollarSign, TrendingUp, 
  Settings, Award, ShoppingCart, BarChart3, 
  Globe, BookOpen, Gift, Truck, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string | number;
}

interface MobileNavProps {
  items: NavItem[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  title?: string;
}

export default function MobileNav({ items, activeTab, onTabChange, title }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const handleItemClick = (item: NavItem) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.onClick) {
      item.onClick();
    } else if (onTabChange) {
      onTabChange(item.label.toLowerCase().replace(/\s+/g, "-"));
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            className="h-10 w-10"
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <h1 className="font-bold text-lg">{title || "NEON Energy"}</h1>
          
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[280px] bg-background border-r shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {user?.name?.[0] || "N"}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user?.name || "Guest"}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role || "Not logged in"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
                <div className="p-2">
                  {items.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.label.toLowerCase().replace(/\s+/g, "-");
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors",
                          "hover:bg-muted/50 active:bg-muted",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn(
                            "h-5 w-5",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "font-medium",
                            isActive && "text-primary"
                          )}>
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                              {item.badge}
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Separator className="my-2" />

                {/* Quick Actions */}
                <div className="p-2">
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Actions
                  </p>
                  <Link href="/">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Home className="h-5 w-5 text-muted-foreground" />
                      <span>Back to Home</span>
                    </button>
                  </Link>
                  <Link href="/preferences">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <span>Preferences</span>
                    </button>
                  </Link>
                </div>
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-16" />
    </>
  );
}

// Mobile-optimized tab bar for bottom navigation
interface MobileTabBarProps {
  tabs: { icon: React.ElementType; label: string; value: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileTabBar({ tabs, activeTab, onTabChange }: MobileTabBarProps) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.slice(0, 5).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5",
                isActive && "text-primary"
              )} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Pull-to-refresh component
interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only trigger if at top of scroll
    if (window.scrollY === 0) {
      const touch = e.touches[0];
      // Store initial touch position
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  };

  return (
    <div onTouchStart={handleTouchStart}>
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}
