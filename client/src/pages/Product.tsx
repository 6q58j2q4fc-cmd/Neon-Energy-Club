import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  ShoppingCart, 
  Zap, 
  Leaf, 
  Heart, 
  Shield, 
  Check,
  ArrowRight,
  Package,
  Truck,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Can3D from "@/components/Can3D";
import NavigationHeader from "@/components/NavigationHeader";

const packages = [
  {
    id: "single",
    name: "Single Can",
    description: "Try NEON for the first time",
    price: 3.99,
    originalPrice: 4.99,
    quantity: 1,
    savings: "20% OFF",
    popular: false,
  },
  {
    id: "4pack",
    name: "4-Pack",
    description: "Perfect for a week of energy",
    price: 14.99,
    originalPrice: 19.96,
    quantity: 4,
    savings: "25% OFF",
    popular: false,
  },
  {
    id: "12pack",
    name: "12-Pack",
    description: "Stock up and save big",
    price: 39.99,
    originalPrice: 59.88,
    quantity: 12,
    savings: "33% OFF",
    popular: true,
  },
  {
    id: "24pack",
    name: "24-Pack",
    description: "Best value for NEON fans",
    price: 69.99,
    originalPrice: 119.76,
    quantity: 24,
    savings: "42% OFF",
    popular: false,
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Clean Energy",
    description: "Natural caffeine from green tea and guarana for sustained energy without the crash",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    description: "Made with real fruit extracts and no artificial colors or preservatives",
  },
  {
    icon: Heart,
    title: "B-Vitamin Complex",
    description: "Packed with B3, B6, and B12 to support metabolism and brain function",
  },
  {
    icon: Shield,
    title: "Low Sugar",
    description: "Only 23g of sugar per can - 40% less than leading energy drinks",
  },
];

const preOrderInfo = [
  {
    icon: Package,
    title: "Early Bird Pricing",
    description: "Lock in special pre-launch pricing during our 90-day early bird period.",
  },
  {
    icon: Truck,
    title: "Shipping Timeline",
    description: "Orders ship once crowdfunding goals are met and production runs complete.",
  },
  {
    icon: RefreshCw,
    title: "Full Refund Guarantee",
    description: "If goals aren't met, you'll receive a complete refund. Zero risk.",
  },
];

export default function Product() {
  const [selectedPackage, setSelectedPackage] = useState("12pack");

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

  return (
    <div className="min-h-screen bg-black text-white">
      <NavigationHeader />
      
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/5 to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 3D Can */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Can3D />
            </motion.div>
            
            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <Badge className="bg-[#c8ff00] text-black mb-4">PRE-ORDER NOW</Badge>
                <h1 className="text-5xl font-black mb-2">
                  <span className="text-[#c8ff00]">NEON</span> Energy Drink
                </h1>
                <p className="text-xl text-white/70">
                  Clean energy for a cleaner world. Powered by nature.
                </p>
              </div>
              
              {/* Pre-order Notice */}
              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl px-4 py-3">
                <p className="text-[#c8ff00] font-semibold">PRE-ORDER NOW</p>
                <p className="text-white/60 text-sm">Ships after 90-day early bird period & crowdfunding goals met</p>
              </div>
              
              {/* Key Benefits */}
              <div className="grid grid-cols-2 gap-3">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-white/80"
                  >
                    <benefit.icon className="w-4 h-4 text-[#c8ff00]" />
                    <span>{benefit.title}</span>
                  </div>
                ))}
              </div>
              
              {/* Package Selection */}
              <div className="space-y-3">
                <h3 className="font-semibold">Select Package:</h3>
                <div className="grid grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                        selectedPackage === pkg.id
                          ? "border-[#c8ff00] bg-[#c8ff00]/10"
                          : "border-white/20 hover:border-white/40"
                      }`}
                    >
                      {pkg.popular && (
                        <Badge className="absolute -top-2 -right-2 bg-[#c8ff00] text-black text-xs">
                          BEST VALUE
                        </Badge>
                      )}
                      <p className="font-bold">{pkg.name}</p>
                      <p className="text-xs text-white/60">{pkg.description}</p>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-[#c8ff00]">
                          ${pkg.price.toFixed(2)}
                        </span>
                        <span className="text-sm text-white/40 line-through">
                          ${pkg.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <Badge variant="outline" className="mt-2 text-xs border-[#c8ff00]/50 text-[#c8ff00]">
                        {pkg.savings}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="space-y-3">
                <Link href={`/pre-order?package=${selectedPackage}`}>
                  <Button
                    size="lg"
                    className="w-full bg-[#c8ff00] text-black hover:bg-[#d4ff33] font-bold text-lg h-14"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Pre-Order Now - ${selectedPkg?.price.toFixed(2)}
                  </Button>
                </Link>
                <p className="text-center text-sm text-white/50">
                  <Check className="w-4 h-4 inline mr-1" />
                  Free shipping on orders over $50
                </p>
              </div>
              
              {/* Trust Badges */}
              <div className="flex justify-center gap-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Package className="w-5 h-5" />
                  <span>Secure Packaging</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <Truck className="w-5 h-5" />
                  <span>Fast Shipping</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/60">
                  <RefreshCw className="w-5 h-5" />
                  <span>30-Day Guarantee</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">
              Why Choose <span className="text-[#c8ff00]">NEON</span>?
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              We believe energy drinks should fuel your body without compromising your health or the planet.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 h-full hover:border-[#c8ff00]/50 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#c8ff00]/10 flex items-center justify-center">
                      <benefit.icon className="w-8 h-8 text-[#c8ff00]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white">{benefit.title}</h3>
                    <p className="text-white/60">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Nutrition Facts Section */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-black mb-6">
                <span className="text-[#c8ff00]">Nutrition</span> Facts
              </h2>
              <p className="text-white/70 mb-8">
                Every can of NEON is packed with vitamins and natural energy boosters 
                to keep you going throughout the day.
              </p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Serving Size</span>
                  <span className="font-bold">1 can (250ml)</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Calories</span>
                  <span className="font-bold">100</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Total Sugars</span>
                  <span className="font-bold">23g</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Caffeine</span>
                  <span className="font-bold">80mg</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Vitamin B6</span>
                  <span className="font-bold text-[#c8ff00]">29% DV</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Vitamin B12</span>
                  <span className="font-bold text-[#c8ff00]">83% DV</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white/80">Niacin (B3)</span>
                  <span className="font-bold text-[#c8ff00]">149% DV</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-[#c8ff00]/20 to-transparent p-8 flex items-center justify-center">
                <img
                  src="/neon-can-label.png"
                  alt="NEON Can Label"
                  className="max-w-full max-h-full object-contain rounded-2xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Pre-Order Info Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-black mb-4">
              How <span className="text-[#c8ff00]">Pre-Orders</span> Work
            </h2>
            <p className="text-white/60">
              Join our early bird campaign and be first to experience NEON
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {preOrderInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/5 border-white/10 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#c8ff00]/10 flex items-center justify-center mb-4">
                      <info.icon className="w-6 h-6 text-[#c8ff00]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{info.title}</h3>
                    <p className="text-white/60">{info.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 text-center"
          >
            <p className="text-white/40 text-sm max-w-2xl mx-auto">
              All pre-orders are expected to begin shipping once the 90-day early bird pre-launch period concludes 
              and crowdfunding goals have been reached, due to standard production run minimum order quantities.
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-t from-[#c8ff00]/10 to-black">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black mb-4">
              Ready to Experience <span className="text-[#c8ff00]">NEON</span>?
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Pre-order now and be among the first to taste the future of energy drinks.
            </p>
            <Link href="/pre-order">
              <Button
                size="lg"
                className="bg-[#c8ff00] text-black hover:bg-[#d4ff33] font-bold text-lg px-12 h-14"
              >
                Pre-Order Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
