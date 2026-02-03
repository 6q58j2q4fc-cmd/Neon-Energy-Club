import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useCountdown, LAUNCH_DATE } from "@/hooks/useCountdown";
import { Zap, Heart, ShoppingCart, Star, CheckCircle, ArrowRight, Ribbon, Sparkles } from "lucide-react";

export default function NeonPink() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const countdown = useCountdown(LAUNCH_DATE);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const ingredients = [
    { name: "Green Tea Extract", amount: "120mg", benefit: "Natural caffeine for clean energy" },
    { name: "Acai Berry Extract", amount: "200mg", benefit: "Antioxidant powerhouse" },
    { name: "Pomegranate", amount: "150mg", benefit: "Heart health support" },
    { name: "B-Vitamins Complex", amount: "100% DV", benefit: "Energy metabolism support" },
    { name: "Biotin", amount: "300mcg", benefit: "Hair, skin & nail support" },
    { name: "Collagen Peptides", amount: "500mg", benefit: "Beauty from within" },
  ];

  const nutritionFacts = {
    servingSize: "12 fl oz (355ml)",
    calories: 15,
    totalFat: "0g",
    sodium: "30mg",
    totalCarbs: "4g",
    sugars: "0g",
    protein: "1g",
    caffeine: "120mg",
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <SEO 
        title="NEON Pink - Breast Cancer Awareness Edition"
        description="NEON Pink supports breast cancer awareness. 120mg natural caffeine with beauty-boosting ingredients."
        image="/neon-pink-can.png"
        url="/neon-pink"
      />
      
      <div className="fixed inset-0 bg-gradient-to-b from-[#1a0a14] via-[#2d1020]/90 to-[#1a0a14] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#ff69b4]/10 rounded-full blur-[120px]" />
      </div>
      
      <HamburgerHeader variant="vice" />

      <section className="pt-28 pb-16 px-4 relative">
        <div className={`container mx-auto max-w-6xl ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-pink-500/20 border border-pink-500/40 mb-4">
              <Ribbon className="w-5 h-5 text-pink-400" />
              <span className="text-pink-400 font-black text-xl tracking-wide">WHY WAIT FOR OCTOBER?</span>
              <Ribbon className="w-5 h-5 text-pink-400" />
            </div>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Support breast cancer awareness year-round. Every can of NEON Pink contributes to the fight.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative flex justify-center">
              <div className="absolute inset-0 bg-pink-500/20 rounded-full blur-[100px]" />
              <img 
                src="/neon-pink-can.png" 
                alt="NEON Pink Energy Drink" 
                className="relative z-10 w-64 md:w-80 h-auto drop-shadow-[0_0_60px_rgba(255,105,180,0.5)] animate-float"
              />
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/20 border border-pink-500/30">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400 font-semibold text-sm">BREAST CANCER AWARENESS</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black">
                <span className="text-pink-400 drop-shadow-[0_0_30px_rgba(255,105,180,0.5)]">NEON</span> PINK
              </h1>
              
              <p className="text-xl text-white/80 leading-relaxed">
                Beauty meets energy. 120mg of natural caffeine combined with beauty-boosting ingredients 
                like collagen and biotin. A portion of every sale supports breast cancer research.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, label: "120mg Natural Caffeine" },
                  { icon: Sparkles, label: "Beauty Boosting" },
                  { icon: Heart, label: "Supports Research" },
                  { icon: Star, label: "Zero Sugar" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-black/30 rounded-xl p-3 border border-pink-500/20">
                    <item.icon className="w-5 h-5 text-pink-400" />
                    <span className="text-white/90 text-sm">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-black/40 rounded-2xl p-4 border border-pink-500/20">
                <p className="text-white/60 text-sm mb-2">Official Launch In:</p>
                <div className="flex gap-4">
                  {[
                    { value: countdown.days, label: "Days" },
                    { value: countdown.hours, label: "Hours" },
                    { value: countdown.minutes, label: "Min" },
                    { value: countdown.seconds, label: "Sec" },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="text-2xl md:text-3xl font-black text-pink-400">{item.value}</div>
                      <div className="text-white/50 text-xs">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation("/preorder")}
                  className="bg-pink-500 hover:bg-pink-400 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(255,105,180,0.3)]"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Pre-Order Now
                </Button>
                <Button 
                  onClick={() => setLocation("/shop")}
                  variant="outline"
                  className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10 font-bold text-lg px-8 py-6 rounded-xl"
                >
                  View All Products
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-pink-900/40 to-pink-800/40 rounded-2xl p-8 border border-pink-500/30 text-center">
            <Ribbon className="w-12 h-12 text-pink-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-white mb-4">Proud Partner of Susan G. Komen</h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              A portion of every NEON Pink sale goes directly to Susan G. Komen to support breast cancer 
              research, education, and patient support programs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white text-black rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-black border-b-8 border-pink-500 pb-2 mb-4">Nutrition Facts</h2>
              <p className="text-sm border-b border-gray-300 pb-2 mb-2">Serving Size {nutritionFacts.servingSize}</p>
              
              <div className="border-b-8 border-pink-500 py-2">
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
              
              <div className="flex justify-between border-b-4 border-pink-500 py-2 font-bold">
                <span>Caffeine</span>
                <span>{nutritionFacts.caffeine}</span>
              </div>
              
              <p className="text-xs mt-4 text-gray-600">
                *The % Daily Value tells you how much a nutrient in a serving of food contributes to a daily diet.
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-black text-pink-400">Key Ingredients</h2>
              <div className="space-y-4">
                {ingredients.map((ingredient, i) => (
                  <div key={i} className="bg-black/40 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{ingredient.name}</span>
                          <span className="text-pink-400 text-sm font-semibold">{ingredient.amount}</span>
                        </div>
                        <p className="text-white/60 text-sm mt-1">{ingredient.benefit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                <p className="text-white/80 text-sm">
                  <span className="text-pink-400 font-bold">Beauty + Energy:</span> Formulated with collagen and biotin 
                  to support healthy hair, skin, and nails while delivering clean, sustained energy.
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
