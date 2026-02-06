import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { ShoppingBag, CreditCard, Lock, ArrowLeft, Zap, AlertCircle, Loader2, Truck, Tag, Check, X, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import PhoneInput from "@/components/PhoneInput";
import { getCountryFormConfig } from "@shared/countryFormConfig";

// Shipping options with prices
const SHIPPING_OPTIONS = [
  { id: "standard", name: "Standard Shipping", price: 8.99, days: "5-7 business days" },
  { id: "express", name: "Express Shipping", price: 14.99, days: "2-3 business days" },
  { id: "overnight", name: "Overnight Shipping", price: 29.99, days: "Next business day" },
];

// US States for shipping
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
  "Wisconsin", "Wyoming"
];

export default function Checkout() {
  const { t, language } = useLanguage();
  const { items, totalPrice, clearCart, autoshipEnabled, setAutoshipEnabled, autoshipFrequency, setAutoshipFrequency } = useCart();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("US");
  
  // Get country-specific form configuration
  const formConfig = getCountryFormConfig(country);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [couponCode, setCouponCode] = useState("");
  const [couponValidation, setCouponValidation] = useState<{
    valid: boolean;
    discountPercent?: number;
    error?: string;
    couponCode?: string;
  } | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nftDisclosureAccepted, setNftDisclosureAccepted] = useState(false);

  // Get distributor code from localStorage (set by cloned website visit)
  const getDistributorCode = (): string | undefined => {
    try {
      const referralData = localStorage.getItem('neon_referral');
      if (referralData) {
        const data = JSON.parse(referralData);
        // Check if referral is still valid (30 days)
        if (data.expiry && new Date(data.expiry) > new Date()) {
          return data.distributorCode;
        }
      }
    } catch (e) {
      console.error('Error reading referral data:', e);
    }
    return undefined;
  };

  // Calculate shipping cost
  const selectedShipping = SHIPPING_OPTIONS.find(opt => opt.id === shippingMethod) || SHIPPING_OPTIONS[0];
  const shippingCost = selectedShipping.price;

  // Calculate discount
  const discountPercent = couponValidation?.valid ? (couponValidation.discountPercent || 0) : 0;
  const discountAmount = (totalPrice * discountPercent) / 100;

  // Calculate autoship discount
  const autoshipDiscount = autoshipEnabled ? totalPrice * 0.05 : 0;

  // Calculate final total
  const finalTotal = totalPrice - discountAmount - autoshipDiscount + shippingCost;

  const { data: stripeConfig } = trpc.payment.isConfigured.useQuery();
  
  // Coupon validation query
  const validateCouponQuery = trpc.newsletter.validateCoupon.useQuery(
    { couponCode: couponCode.toUpperCase().trim() },
    { enabled: false }
  );

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

  // Validate coupon code
  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const result = await validateCouponQuery.refetch();
      if (result.data) {
        setCouponValidation(result.data);
        if (result.data.valid) {
          toast.success(`Coupon applied! ${result.data.discountPercent}% off`);
        } else {
          toast.error(result.data.error || "Invalid coupon code");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to validate coupon");
      setCouponValidation({ valid: false, error: "Failed to validate coupon" });
    }
    setIsValidatingCoupon(false);
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponValidation(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!addressLine1.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      toast.error("Please fill in your shipping address");
      return;
    }

    if (!nftDisclosureAccepted) {
      toast.error("Please accept the NFT Gift Program terms");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    
    const distributorCode = getDistributorCode();
    
    checkoutMutation.mutate({
      items: items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type || "product",
        flavor: item.flavor,
      })),
      name: name.trim(),
      email: email.trim(),
      distributorCode,
      shippingAddress: {
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country,
      },
      shippingMethod,
      shippingCost,
      couponCode: couponValidation?.valid ? couponValidation.couponCode : undefined,
      discountPercent: couponValidation?.valid ? couponValidation.discountPercent : undefined,
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
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#c8ff00]" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="space-y-2">
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    label="Phone Number"
                    defaultCountryCode={formConfig.phoneCode}
                    className=""
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#c8ff00]" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1" className="text-white">Address Line 1 *</Label>
                  <Input
                    id="addressLine1"
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2" className="text-white">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apt, Suite, Unit (optional)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-white">City *</Label>
                    <Input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Los Angeles"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-white">State *</Label>
                    <Select value={state} onValueChange={setState}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/20">
                        {US_STATES.map((st) => (
                          <SelectItem key={st} value={st} className="text-white hover:bg-white/10">
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-white">{formConfig.postalCodeLabel} *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder={formConfig.postalCodePlaceholder}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Country</Label>
                    <Input
                      type="text"
                      value={country}
                      disabled
                      className="bg-white/5 border-white/10 text-gray-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#c8ff00]" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                      shippingMethod === option.id
                        ? "border-[#c8ff00] bg-[#c8ff00]/10"
                        : "border-white/20 bg-white/5 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={shippingMethod === option.id}
                        onChange={(e) => setShippingMethod(e.target.value)}
                        className="w-4 h-4 text-[#c8ff00] bg-white/10 border-white/30 focus:ring-[#c8ff00]"
                      />
                      <div>
                        <p className="text-white font-medium">{option.name}</p>
                        <p className="text-sm text-gray-400">{option.days}</p>
                      </div>
                    </div>
                    <span className="text-[#c8ff00] font-bold">${option.price.toFixed(2)}</span>
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
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
                
                {/* Coupon Code */}
                <div className="pt-4 border-t border-white/20">
                  <Label className="text-white mb-2 block">Coupon Code</Label>
                  {couponValidation?.valid ? (
                    <div className="flex items-center justify-between p-3 bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-[#c8ff00]" />
                        <span className="text-[#c8ff00] font-medium">{couponValidation.couponCode}</span>
                        <span className="text-gray-400">({couponValidation.discountPercent}% off)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter coupon code"
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 uppercase"
                      />
                      <Button
                        type="button"
                        onClick={handleValidateCoupon}
                        disabled={isValidatingCoupon || !couponCode.trim()}
                        className="bg-[#c8ff00]/20 text-[#c8ff00] hover:bg-[#c8ff00]/30 border border-[#c8ff00]/50"
                      >
                        {isValidatingCoupon ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Tag className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}
                  {couponValidation && !couponValidation.valid && (
                    <p className="text-red-400 text-sm mt-2">{couponValidation.error}</p>
                  )}
                </div>

                {/* Auto-Ship Status */}
                <div className="pt-4 border-t border-white/20">
                  <div className={`rounded-xl p-4 border transition-all ${autoshipEnabled ? 'bg-[#c8ff00]/10 border-[#c8ff00]/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${autoshipEnabled ? 'text-[#c8ff00]' : 'text-white/40'}`} />
                        <span className={`text-sm font-bold ${autoshipEnabled ? 'text-[#c8ff00]' : 'text-white/50'}`}>
                          Auto-Ship {autoshipEnabled ? 'ON' : 'OFF'} — {autoshipEnabled ? 'Save 5%' : 'No discount'}
                        </span>
                      </div>
                      <button
                        onClick={() => setAutoshipEnabled(!autoshipEnabled)}
                        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${autoshipEnabled ? 'bg-[#c8ff00]' : 'bg-white/20'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${autoshipEnabled ? 'left-6 bg-black' : 'left-0.5 bg-white/60'}`} />
                      </button>
                    </div>
                    {autoshipEnabled && (
                      <p className="text-xs text-[#c8ff00]/60 mt-2">Ships {autoshipFrequency === 'monthly' ? 'every month' : 'every 2 weeks'} automatically</p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="pt-4 border-t border-white/20 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Subtotal</span>
                    <span className="text-white">${totalPrice.toFixed(2)}</span>
                  </div>
                  {autoshipDiscount > 0 && (
                    <div className="flex justify-between items-center text-[#c8ff00]">
                      <span>Auto-Ship Discount (5%)</span>
                      <span>-${autoshipDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-[#c8ff00]">
                      <span>Coupon Discount ({discountPercent}%)</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Shipping ({selectedShipping.name})</span>
                    <span className="text-white">${shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl pt-4 border-t border-white/20">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-[#c8ff00] font-black">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#c8ff00]" />
                  Secure Payment
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

                <div className="bg-white/5 rounded-lg p-4 border border-white/10 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Lock className="w-4 h-4" />
                    <span>Your payment info is secured with Stripe</span>
                  </div>
                </div>

                {/* NFT Gift Program Disclosure Acceptance */}
                <div className="bg-[#c8ff00]/5 rounded-lg p-4 border border-[#c8ff00]/20 mb-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="nft-disclosure"
                      checked={nftDisclosureAccepted}
                      onChange={(e) => setNftDisclosureAccepted(e.target.checked)}
                      className="mt-1 w-5 h-5 rounded border-[#c8ff00]/50 bg-white/10 text-[#c8ff00] focus:ring-[#c8ff00] focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="nft-disclosure" className="text-sm text-gray-300 cursor-pointer">
                      <span className="font-semibold text-[#c8ff00]">NFT Gift Program:</span>{" "}
                      I acknowledge that my purchase includes a complimentary NFT gift (not a purchase of securities). 
                      I have read and agree to the{" "}
                      <a 
                        href="/nft-disclosure" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#c8ff00] hover:underline font-medium"
                      >
                        NFT Gift Program Disclosure
                      </a>
                      , including all SEC disclaimers, risk disclosures, and minting conditions.
                    </label>
                  </div>
                </div>

                <form onSubmit={handleCheckout}>
                  <Button
                    type="submit"
                    disabled={isProcessing || !stripeConfig?.configured || !nftDisclosureAccepted}
                    className="w-full bg-[#c8ff00] text-black hover:bg-[#a8d600] font-bold py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        Pay ${finalTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
