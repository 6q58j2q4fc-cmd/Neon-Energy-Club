import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Zap, MapPin, Users, Trophy, Building2, Store, DollarSign, Home, BookOpen, Star } from "lucide-react";

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
  { label: "COMP PLAN", path: "/compensation", icon: DollarSign },
];

export default function MobileMenu({ isOpen, onClose, onNavigate, currentPath = "/" }: MobileMenuProps) {
  const handleNavClick = (path: string) => {
    onClose();
    setTimeout(() => onNavigate(path), 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Full-screen backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
            onClick={onClose}
          />

          {/* Full-screen menu panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[101] flex flex-col"
          >
            {/* Vice City gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#0d0620] to-[#0a0318]" />
            
            {/* Animated neon grid background */}
            <div className="absolute inset-0 opacity-20">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(200, 255, 0, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(200, 255, 0, 0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '50px 50px',
                  animation: 'gridMove 20s linear infinite',
                }}
              />
            </div>

            {/* Neon glow orbs */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-[#ff0080]/30 to-transparent rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-[#00ffff]/30 to-transparent rounded-full blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[#c8ff00]/10 to-transparent rounded-full blur-[150px]" />

            {/* Header with close button */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#c8ff00]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffff]/10 flex items-center justify-center border border-[#c8ff00]/30">
                  <Zap className="w-5 h-5 text-[#c8ff00]" />
                </div>
                <span className="text-2xl font-black text-[#c8ff00] tracking-wider" style={{ fontFamily: "'Orbitron', sans-serif" }}>
                  NEON
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-12 h-12 rounded-xl bg-[#ff0080]/20 border border-[#ff0080]/40 flex items-center justify-center hover:bg-[#ff0080]/30 transition-colors"
              >
                <X className="w-6 h-6 text-[#ff0080]" />
              </motion.button>
            </div>

            {/* Navigation items */}
            <nav className="relative z-10 flex-1 overflow-y-auto py-8 px-6">
              <div className="space-y-3">
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;
                  
                  return (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                        isActive
                          ? "bg-gradient-to-r from-[#c8ff00]/20 to-[#c8ff00]/5 border-2 border-[#c8ff00]/50 shadow-[0_0_30px_rgba(200,255,0,0.2)]"
                          : "bg-white/5 border border-white/10 hover:bg-[#c8ff00]/10 hover:border-[#c8ff00]/30"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        isActive
                          ? "bg-[#c8ff00]/20 shadow-[0_0_15px_rgba(200,255,0,0.3)]"
                          : "bg-white/5 group-hover:bg-[#c8ff00]/10"
                      }`}>
                        <Icon className={`w-6 h-6 transition-colors ${
                          isActive ? "text-[#c8ff00]" : "text-white/60 group-hover:text-[#c8ff00]"
                        }`} />
                      </div>
                      <span className={`text-lg font-bold tracking-wide transition-colors ${
                        isActive ? "text-[#c8ff00]" : "text-white/80 group-hover:text-white"
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="ml-auto w-2 h-2 rounded-full bg-[#c8ff00] shadow-[0_0_10px_#c8ff00]"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </nav>

            {/* CTA Buttons */}
            <div className="relative z-10 p-6 border-t border-[#c8ff00]/20 space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  onClick={() => handleNavClick("/join")}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#00ffff] to-[#00e5ff] text-black hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all"
                >
                  <Users className="w-5 h-5 mr-2" />
                  JOIN NOW
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => handleNavClick("/crowdfund")}
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#ff0080] to-[#ff1493] text-white hover:shadow-[0_0_30px_rgba(255,0,128,0.5)] transition-all"
                >
                  <Trophy className="w-5 h-5 mr-2" />
                  BACK THE RELAUNCH
                </Button>
              </motion.div>
            </div>

            {/* Decorative bottom neon line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
