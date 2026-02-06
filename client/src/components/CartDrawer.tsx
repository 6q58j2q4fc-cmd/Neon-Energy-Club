import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Trash2, Zap, RefreshCw, AlertTriangle, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { toast } from "sonner";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen, autoshipEnabled, setAutoshipEnabled, autoshipFrequency, setAutoshipFrequency } = useCart();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [showAutoshipWarning, setShowAutoshipWarning] = useState(false);

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

  const handleAutoshipToggle = () => {
    if (autoshipEnabled) {
      // User is trying to turn OFF autoship - show warning
      setShowAutoshipWarning(true);
    } else {
      // User is turning ON autoship
      setAutoshipEnabled(true);
      toast.success("Auto-Ship enabled!", {
        description: "Your order will be automatically shipped each month.",
      });
    }
  };

  const confirmDisableAutoship = () => {
    setAutoshipEnabled(false);
    setShowAutoshipWarning(false);
    toast.warning("Auto-Ship disabled", {
      description: "Remember: Distributors need at least 2 cases on auto-ship per month to maintain active status.",
      duration: 8000,
    });
  };

  // Calculate autoship discount (5% off for autoship)
  const autoshipDiscount = autoshipEnabled ? totalPrice * 0.05 : 0;
  const finalTotal = totalPrice - autoshipDiscount;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0318]/98 backdrop-blur-xl border-l border-[#c8ff00]/30 z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="h-1 bg-gradient-to-r from-[#ff0080] via-[#c8ff00] to-[#00ffff]" />
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#c8ff00]/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#c8ff00]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{t("shop.title")}</h2>
                  <p className="text-sm text-white/50">{totalItems} {totalItems === 1 ? "item" : "items"}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-lg bg-white/5 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-white/30" />
                  </div>
                  <p className="text-white/50 mb-2">Your cart is empty</p>
                  <p className="text-sm text-white/30">Add some NEON energy to your life!</p>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/shop");
                    }}
                    className="mt-6 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffff]/20 flex items-center justify-center flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" loading="lazy" />
                          ) : (
                            <Zap className="w-8 h-8 text-[#c8ff00]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white truncate">{item.name}</h3>
                          {item.flavor && (
                            <p className="text-sm text-white/50 capitalize">{item.flavor}</p>
                          )}
                          <p className="text-[#c8ff00] font-bold mt-1">${item.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-8 h-8 rounded-lg bg-[#ff0080]/10 flex items-center justify-center hover:bg-[#ff0080]/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#ff0080]" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>
                        <p className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Auto-Ship Section */}
                  <div className={`rounded-xl p-4 border transition-all ${autoshipEnabled ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <RefreshCw className={`w-5 h-5 ${autoshipEnabled ? 'text-[#c8ff00]' : 'text-white/40'}`} />
                        <div>
                          <h4 className="font-bold text-white text-sm">Auto-Ship & Save 5%</h4>
                          <p className="text-xs text-white/40">Automatic monthly delivery</p>
                        </div>
                      </div>
                      {/* Toggle Switch */}
                      <button
                        onClick={handleAutoshipToggle}
                        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${autoshipEnabled ? 'bg-[#c8ff00]' : 'bg-white/20'}`}
                      >
                        <div className={`absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300 flex items-center justify-center ${autoshipEnabled ? 'left-7 bg-black' : 'left-0.5 bg-white/60'}`}>
                          {autoshipEnabled && <Check className="w-3.5 h-3.5 text-[#c8ff00]" />}
                        </div>
                      </button>
                    </div>

                    {autoshipEnabled && (
                      <div className="space-y-3">
                        {/* Frequency selector */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAutoshipFrequency("monthly")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${autoshipFrequency === "monthly" ? 'bg-[#c8ff00] text-black' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setAutoshipFrequency("biweekly")}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${autoshipFrequency === "biweekly" ? 'bg-[#c8ff00] text-black' : 'bg-white/10 text-white/50 hover:bg-white/20'}`}
                          >
                            Every 2 Weeks
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#c8ff00]">
                          <Check className="w-3.5 h-3.5" />
                          <span>You save ${autoshipDiscount.toFixed(2)} with Auto-Ship!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 space-y-3">
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-white/50 hover:text-[#ff0080] transition-colors"
                >
                  Clear Cart
                </button>
                {autoshipEnabled && autoshipDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Auto-Ship Discount (5%)</span>
                    <span className="text-[#c8ff00] font-bold">-${autoshipDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white/70">{t("shop.total")}</span>
                  <div className="text-right">
                    {autoshipEnabled && autoshipDiscount > 0 && (
                      <span className="text-sm text-white/30 line-through mr-2">${totalPrice.toFixed(2)}</span>
                    )}
                    <span className="text-2xl font-black text-[#c8ff00]">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("shop.checkout")}
                </Button>
                {autoshipEnabled && (
                  <p className="text-xs text-center text-[#c8ff00]/60">
                    <RefreshCw className="w-3 h-3 inline mr-1" />
                    Auto-Ship: Ships {autoshipFrequency === "monthly" ? "every month" : "every 2 weeks"}
                  </p>
                )}
                <p className="text-xs text-center text-white/30">Secure checkout powered by Stripe</p>
              </div>
            )}

            {/* Auto-Ship Warning Modal */}
            <AnimatePresence>
              {showAutoshipWarning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-10"
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-[#1a0a2e] border-2 border-[#ff0080]/50 rounded-2xl p-6 max-w-sm w-full"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-[#ff0080]/20 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-[#ff0080]" />
                      </div>
                      <h3 className="text-lg font-black text-white">Disable Auto-Ship?</h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <p className="text-white/70 text-sm leading-relaxed">
                        Are you sure you want to turn off Auto-Ship? Please be aware:
                      </p>
                      <div className="bg-[#ff0080]/10 border border-[#ff0080]/30 rounded-xl p-4">
                        <p className="text-[#ff0080] text-sm font-bold mb-2">
                          ⚠️ Distributor Active Status Warning
                        </p>
                        <p className="text-white/60 text-xs leading-relaxed">
                          All distributors are required to maintain <strong className="text-white">at least 2 cases on Auto-Ship per month</strong> to keep their active distributor status. Disabling Auto-Ship may result in loss of your active status, commission eligibility, and team bonuses.
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-white/60 text-xs leading-relaxed">
                          You will also lose your <strong className="text-[#c8ff00]">5% Auto-Ship discount</strong> on all orders.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => setShowAutoshipWarning(false)}
                        className="flex-1 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                      >
                        Keep Auto-Ship
                      </Button>
                      <Button
                        onClick={confirmDisableAutoship}
                        variant="outline"
                        className="flex-1 border-[#ff0080]/30 text-[#ff0080] hover:bg-[#ff0080]/10 font-bold"
                      >
                        Turn Off
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
