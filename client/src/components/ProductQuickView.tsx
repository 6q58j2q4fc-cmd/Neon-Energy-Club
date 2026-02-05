import { useState } from "react";
import { X, ShoppingCart, Heart, Star, Zap, Leaf, Droplets, Shield, Sparkles, Battery, Flame, Award, Check, Plus, Minus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";
import { useLocation } from "wouter";

export interface ProductData {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  flavor: "original" | "pink";
  features: { icon: React.ElementType; text: string }[];
  badges: string[];
  rating: number;
  reviews: number;
  charityPartner?: {
    name: string;
    logo?: string;
    link: string;
  };
}

// Product data
export const products: ProductData[] = [
  {
    id: "neon-original-case",
    name: "NEON Original Case (24 Cans)",
    shortName: "NEON Original",
    tagline: "The \"Top Shelf\" Energy Drink",
    description: "Experience clean, sustained energy with our signature formula. Made with 24% real fruit juice, 100mg natural caffeine from green tea, and over 100% daily value of 6 essential B vitamins. Zero sugar, no taurine, and it glows under blacklight!",
    price: 59.99,
    image: "/neon-can-transparent-final.png",
    flavor: "original",
    features: [
      { icon: Battery, text: "100mg Natural Caffeine" },
      { icon: Droplets, text: "24% Real Fruit Juice" },
      { icon: Flame, text: "Only 100 Calories" },
      { icon: Zap, text: "6 B Vitamins" },
      { icon: Shield, text: "No Taurine" },
      { icon: Sparkles, text: "Glows in Blacklight!" }
    ],
    badges: ["Best Seller", "Zero Sugar"],
    rating: 4.9,
    reviews: 2847,
    charityPartner: {
      name: "Rainforest Trust",
      link: "https://www.rainforesttrust.org/"
    }
  },
  {
    id: "neon-pink-case",
    name: "NEON Pink Electric Pom Passion Case (24 Cans)",
    shortName: "NEON Pink",
    tagline: "Electric Pom Passion",
    description: "The first energy drink engineered for women's health. Featuring pomegranate and passion fruit flavors with cancer-fighting antioxidants. A portion of every sale supports Susan G. Komen® in the fight against breast cancer.",
    price: 64.99,
    image: "/neon-pink-can-rembg.png",
    flavor: "pink",
    features: [
      { icon: Heart, text: "Women's Health Formula" },
      { icon: Shield, text: "Cancer Fighting Ingredients" },
      { icon: Leaf, text: "Pomegranate & Passion Fruit" },
      { icon: Sparkles, text: "Antioxidant Rich" },
      { icon: Award, text: "Supports Susan G. Komen®" },
      { icon: Flame, text: "Fight Back - Every Day!" }
    ],
    badges: ["New", "For a Cause"],
    rating: 4.8,
    reviews: 2156,
    charityPartner: {
      name: "Susan G. Komen",
      link: "https://www.komen.org/"
    }
  }
];

interface ProductQuickViewProps {
  product: ProductData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const [, setLocation] = useLocation();

  if (!product) return null;

  const isOriginal = product.flavor === "original";
  const accentColor = isOriginal ? "#c8ff00" : "#ff0080";
  const accentColorLight = isOriginal ? "#c8ff00" : "#ff69b4";

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        type: "product",
        flavor: product.flavor,
        image: product.image,
      });
    }
    toast.success(`Added ${quantity} ${product.shortName} case${quantity > 1 ? 's' : ''} to cart!`, {
      description: "Click checkout to complete your order",
      action: {
        label: "Checkout",
        onClick: () => setLocation("/checkout"),
      },
    });
    onClose();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        type: "product",
        flavor: product.flavor,
        image: product.image,
      });
    }
    setLocation("/checkout");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black/95 border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{product.name} - Quick View</DialogTitle>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className={`relative md:w-1/2 p-8 flex items-center justify-center ${
            isOriginal 
              ? "bg-gradient-to-br from-[#c8ff00]/10 via-black to-black" 
              : "bg-gradient-to-br from-pink-500/10 via-black to-black"
          }`}>
            {/* Glow effect */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle at center, ${accentColor}40 0%, transparent 70%)`
              }}
            />
            
            {/* Product badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.badges.map((badge, i) => (
                <span 
                  key={i}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isOriginal 
                      ? "bg-[#c8ff00]/20 text-[#c8ff00] border border-[#c8ff00]/30" 
                      : "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Wishlist button */}
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isWishlisted 
                  ? "bg-[#ff0080]/20 border-2 border-[#ff0080]" 
                  : "bg-white/10 border border-white/20 hover:bg-white/20"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-[#ff0080] text-[#ff0080]" : "text-white/70"}`} />
            </button>

            {/* Product image */}
            <img 
              src={product.image} 
              alt={product.name}
              className="w-64 h-auto relative z-10 animate-float drop-shadow-2xl"
              style={{
                filter: `drop-shadow(0 20px 40px ${accentColor}50)`
              }}
            />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-8 flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h2 
                className="text-3xl font-black mb-2"
                style={{ color: accentColorLight }}
              >
                {product.shortName}
              </h2>
              <p className="text-white/50 text-lg">{product.tagline}</p>
              
              {/* Pre-order Notice */}
              <div 
                className="mt-3 px-4 py-2 rounded-xl border"
                style={{ 
                  backgroundColor: `${accentColor}10`, 
                  borderColor: `${accentColor}30` 
                }}
              >
                <p className="text-sm font-semibold" style={{ color: accentColor }}>PRE-ORDER NOW</p>
                <p className="text-white/60 text-xs">Ships after 90-day early bird period & crowdfunding goals met</p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">${product.price}</span>
                <span className="text-white/40">/ case of 24</span>
              </div>
              {product.charityPartner && (
                <a 
                  href={product.charityPartner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-2 text-sm hover:underline ${
                    isOriginal ? "text-green-400" : "text-pink-400"
                  }`}
                >
                  Supports {product.charityPartner.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Description */}
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}20` }}
                  >
                    <feature.icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
                  </div>
                  <span className="text-xs font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-white/50 text-sm">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-12 text-center text-white font-bold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
              <span className="text-white/40 text-sm ml-auto">
                Total: ${(product.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                className={`flex-1 py-6 rounded-xl font-bold text-base transition-all ${
                  isOriginal 
                    ? "bg-[#c8ff00] text-black hover:bg-[#d4ff33]" 
                    : "bg-pink-500 text-white hover:bg-pink-400"
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                variant="outline"
                className="flex-1 py-6 rounded-xl font-bold text-base border-2 border-white/20 text-white hover:bg-white/10"
              >
                Buy Now
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-white/10">
              {[
                { icon: Shield, text: "30-Day Guarantee" },
                { icon: Zap, text: "Fast Shipping" },
                { icon: Check, text: "Secure Checkout" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-white/40 text-xs">
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductQuickView;
