import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingBag, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen } = useCart();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const handleCheckout = () => {
    setIsOpen(false);
    setLocation("/checkout");
  };

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
                  <p className="text-sm text-white/50">{totalItems} {totalItems === 1 ? t("shop.quantity") : t("shop.quantity")}</p>
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
                  <p className="text-white/50 mb-2">{t("shop.freeShipping") || "Your cart is empty"}</p>
                  <p className="text-sm text-white/30">Add some NEON energy to your life!</p>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      setLocation("/shop");
                    }}
                    className="mt-6 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {t("common.viewMore") || "Browse Products"}
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
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/10 p-4 space-y-4">
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-white/50 hover:text-[#ff0080] transition-colors"
                >
                  {t("common.delete") || "Clear Cart"}
                </button>
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white/70">{t("shop.total")}</span>
                  <span className="text-2xl font-black text-[#c8ff00]">${totalPrice.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full h-14 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t("shop.checkout")}
                </Button>
                <p className="text-xs text-center text-white/30">Secure checkout powered by Stripe</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
