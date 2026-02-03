import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useCountdown, LAUNCH_DATE } from "@/hooks/useCountdown";
import { Zap, Leaf, Heart, ShoppingCart, Star, CheckCircle, ArrowRight } from "lucide-react";

export default function NeonOriginal() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const countdown = useCountdown(LAUNCH_DATE);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const ingredients = [
    { name: "Green Tea Extract", amount: "150mg", benefit: "Natural caffeine for sustained energy" },
    { name: "Guarana", amount: "100mg", benefit: "Long-lasting alertness" },
    { name: "B-Vitamins Complex", amount: "100% DV", benefit: "Energy metabolism support" },
    { name: "Taurine", amount: "1000mg", benefit: "Mental focus enhancement" },
    { name: "Ginseng Extract", amount: "50mg", benefit: "Adaptogenic stress support" },
    { name: "L-Carnitine", amount: "500mg", benefit: "Fat metabolism & endurance" },
  ];

  const nutritionFacts = {
    servingSize: "12 fl oz (355ml)",
    calories: 10,
    totalFat: "0g",
    sodium: "35mg",
    totalCarbs: "3g",
    sugars: "0g",
    protein: "0g",
    caffeine: "150mg",
  };

  return (
    <div className="min-h-screen text-white product-bg-vibrant relative overflow-hidden">
      <SEO 
        title="NEON Original - Premium Energy Drink"
        description="NEON Original delivers sustained energy with 150mg natural caffeine from green tea. Zero sugar, 100% natural ingredients."
        image="/neon-original-can.png"
        url="/neon-original"
      />
      
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1a1a] via-[#0d2818]/90 to-[#0a1a1a] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c8ff00]/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c8ff00]/5 rounded-full blur-[120px]" />
      </div>
      
      <HamburgerHeader variant="vice" />

      <section className="pt-28 pb-16 px-4 relative">
        <div className={`container mx-auto max-w-6xl ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-[#c8ff00]/20 rounded-full blur-[100px]" />
              <img 
                src="/neon-original-can.png" 
                alt="NEON Original Energy Drink" 
                className="relative z-10 w-64 md:w-80 h-auto drop-shadow-[0_0_60px_rgba(200,255,0,0.5)] animate-float"
              />
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30">
                <Zap className="w-4 h-4 text-[#c8ff00]" />
                <span className="text-[#c8ff00] font-semibold text-sm">FLAGSHIP FORMULA</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black">
                <span className="text-[#c8ff00] drop-shadow-[0_0_30px_rgba(200,255,0,0.5)]">NEON</span> ORIGINAL
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed">
                The original formula that started it all. 150mg of natural caffeine from green tea 
                delivers sustained energy without the crash. Zero sugar, zero compromise.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: "150mg Natural Caffeine" },
                  { icon: Leaf, label: "100% Plant-Based" },
                  { icon: Heart, label: "Zero Sugar" },
                  { icon: Star, label: "No Artificial Colors" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 rounded-xl p-3 border border-white/10">
                    <item.icon className="w-5 h-5 text-[#c8ff00]" />
                    <span className="text-white/90 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-black/40 rounded-2xl p-4 border border-[#c8ff00]/20">
                <p className="text-white/60 text-sm mb-2">Official Launch In:</p>
                <div className="flex gap-4">
                  {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hours" },
                    { value: countdown.minutes, label: "Min" },
                    { value: countdown.seconds, label: "Sec" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-black text-[#c8ff00]">{item.value}</div>
                      <div className="text-white/50 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation("/preorder")}
                  className="bg-[#c8ff00] hover:bg-[#d9ff33] text-black font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(200,255,0,0.3)]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Pre-Order Now
                </Button>
                <Button 
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="border-[#c8ff00]/50 text-[#c8ff00] hover:bg-[#c8ff00]/10 font-bold text-lg px-8 py-6 rounded-xl"
                >
                  View All Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-black border-b-8 border-black pb-2 mb-4">Nutrition Facts</h2>
              <p className="text-sm border-b border-gray-300 pb-2 mb-2">Serving Size {nutritionFacts.servingSize}</p>
              
              <div className="border-b-8 border-black py-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Calories</span>
                  <span>{nutritionFacts.calories}</span>
                </div>
              </div>
              
              <div className="text-right text-sm font-bold border-b border-gray-300 py-1">% Daily Value*</div>
              
              {[
                { label: "Total Fat", value: nutritionFacts.totalFat, dv: "0%" },
                { label: "Sodium", value: nutritionFacts.sodium, dv: "1%" },
                { label: "Total Carbohydrate", value: nutritionFacts.totalCarbs, dv: "1%" },
                { label: "Total Sugars", value: nutritionFacts.sugars, dv: "" },
                { label: "Protein", value: nutritionFacts.protein, dv: "" },
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b border-gray-300 py-1">
                  <span className={item.label.startsWith("Total S") ? "pl-4" : "font-bold"}>{item.label} {item.value}</span>
                  <span className="font-bold">{item.dv}</span>
                </div>
              ))}
              
              <div className="flex justify-between border-b-4 border-black py-2 font-bold">
                <span>Caffeine</span>
                <span>{nutritionFacts.caffeine}</span>
              </div>
              
              <p className="text-xs mt-4 text-gray-600">
                *The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-black text-[#c8ff00]">Key Ingredients</h2>
              <div className="space-y-4">
                {ingredients.map((ingredient, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-4 border border-[#c8ff00]/20 hover:border-[#c8ff00]/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#c8ff00] mt-1 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ingredient.name}</span>
                          <span className="text-[#c8ff00] text-sm font-semibold">{ingredient.amount}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">{ingredient.benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-[#c8ff00]/10 border border-[#c8ff00]/30 rounded-xl p-4">
                <p className="text-white/80 text-sm">
                  <span className="text-[#c8ff00] font-bold">100% Natural:</span> No artificial colors, flavors, or sweeteners. 
                  Vegan, gluten-free, and non-GMO verified.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
