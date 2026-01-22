import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { ShoppingBag, CreditCard, Lock, ArrowLeft, Zap, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: stripeConfig } = trpc.payment.isConfigured.useQuery();
  const checkoutMutation = trpc.payment.createPreorderCheckout.useMutation({
    onSuccess: (data) => {
      // Open Stripe checkout in new tab
      window.open(data.url, "_blank");
      toast.success("Redirecting to secure checkout...", {
        description: "Complete your payment in the new tab",
      });
      // Clear cart after successful redirect
      setTimeout(() => {
        clearCart();
      }, 1000);
    },
    onError: (error) => {
      toast.error("Checkout failed", {
        description: error.message,
      });
      setIsProcessing(false);
    },
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    
    checkoutMutation.mutate({
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        flavor: item.flavor,
      })),
      name: name.trim(),
      email: email.trim(),
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
        <HamburgerHeader />
        <div className="container mx-auto px-4 py-32 text-center">
          <ShoppingBag className="w-20 h-20 text-[#c8ff00]/30 mx-auto mb-6" />
          <h1 className="text-4xl font-black text-white mb-4">Your Cart is Empty</h1>
          <p className="text-xl text-gray-400 mb-8">Add some NEON energy to your life!</p>
          <Link href="/shop">
            <Button className="bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold px-8 py-6 text-lg">
              <Zap className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
      <HamburgerHeader />
      
      <div className="container mx-auto px-4 py-12">
        <Link href="/shop" className="inline-flex items-center text-[#c8ff00] hover:text-[#a8d600] mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>

        <h1 className="text-4xl font-black text-white mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#c8ff00]" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-white/10">
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    {item.flavor && (
                      <p className="text-sm text-gray-400 capitalize">{item.flavor}</p>
                    )}
                    <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-[#c8ff00] font-bold">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t border-white/20">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white font-bold">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-2">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center text-xl mt-4 pt-4 border-t border-white/20">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-[#c8ff00] font-black">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#c8ff00]" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!stripeConfig?.configured ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-yellow-500 font-medium">Payment System Setup Required</p>
                      <p className="text-yellow-500/70 text-sm mt-1">
                        Stripe payment processing is being configured. Please check back soon or contact support.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lock className="w-4 h-4" />
                    <span>Your payment info is secured with Stripe</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing || !stripeConfig?.configured}
                  className="w-full h-14 bg-[#c8ff00] text-black hover:bg-[#a8d600] font-black text-lg disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay ${totalPrice.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
