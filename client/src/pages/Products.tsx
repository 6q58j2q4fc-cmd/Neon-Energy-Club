import { Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Products() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen vice-bg text-white">
      {/* Header - Vice City Style */}
      <header className="border-b border-[#ff0080]/20 bg-[#1a0a2e]/90 backdrop-blur-xl fixed top-0 w-full z-50 transition-smooth">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold font-vice gradient-text-vice cursor-pointer drop-shadow-[0_0_10px_rgba(255,0,128,0.5)]"
            onClick={() => setLocation("/")}
          >
            NEON
          </h1>
          <nav className="flex gap-6 items-center">
            <button
              onClick={() => setLocation("/")}
              className="nav-btn"
            >
              Home
            </button>
            <button
              onClick={() => setLocation("/about")}
              className="nav-btn"
            >
              Our Story
            </button>
            <button
              onClick={() => setLocation("/products")}
              className="nav-btn active"
            >
              Products
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Vice City Style */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Vice City Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: 'url(/vice-city-bg.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0620] via-[#0d0620]/80 to-transparent" />
        
        {/* Vice City Gradient Orbs */}
        <div className="absolute -left-40 top-1/4 w-96 h-96 bg-gradient-to-br from-[#ff0080]/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -right-20 bottom-0 w-80 h-80 bg-gradient-to-tl from-[#00ffff]/12 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-[#9d4edd]/10 to-transparent blur-[80px] pointer-events-none" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 animated-grid opacity-30" />
        
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6 font-vice">
            THE <span className="gradient-text-vice drop-shadow-[0_0_20px_rgba(255,0,128,0.5)]">PRODUCTS</span>
          </h2>
          <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto">
            Two incredible flavors, both designed to give you energy that lasts
            without the crash. Finally, an energy drink that tastes good!
          </p>
        </div>
      </section>

      {/* Products Comparison - Vice City Style */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* NEON Original */}
            <div className={`glass-card-vice rounded-xl overflow-hidden hover-lift ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-[#b8e600]/15 via-[#00ffff]/05 to-transparent p-8 text-center relative overflow-hidden">
                {/* Vice City Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-[#b8e600]/15 to-[#00ffff]/08 rounded-full blur-[70px] pointer-events-none" />
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#b8e600] blur-[80px] opacity-60 rounded-full"></div>
                  <img
                    src="/neon-can-transparent.png"
                    alt="NEON Original"
                    className="w-48 h-auto mx-auto mb-6 animate-float relative z-10"
                    style={{ filter: 'drop-shadow(0 0 50px rgba(184, 230, 0, 0.7)) drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5))' }}
                  />
                </div>
                <h3 className="text-4xl font-black gradient-text-vice mb-2 font-vice">
                  NEON ORIGINAL
                </h3>
                <p className="text-gray-400 text-lg">
                  The "Top Shelf" Energy Drink
                </p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-[#c8ff00] mb-4">
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">
                        Originally launched in 2013
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">
                        All-natural fruit juice blend
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">
                        Popular in 14 countries
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">
                        Most popular of the two variants
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">Only 100 calories</span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-[#c8ff00] mt-0.5 flex-shrink-0 neon-glow" />
                      <span className="text-gray-300">
                        Glows Neon Green in blacklight
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/50 rounded-lg p-6 neon-border">
                  <h4 className="text-xl font-bold text-[#c8ff00] mb-4">
                    What's Inside
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 100mg natural caffeine from Green Tea</li>
                    <li>• Natural sugar from 24% fruit juice</li>
                    <li>• Over 100% of 6 B Vitamins</li>
                    <li>• Proprietary blend for antioxidant support</li>
                    <li>• Supports healthy metabolism</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-[#c8ff00] mb-4">
                    What's NOT Inside
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-400 transition-smooth hover:translate-x-2">
                      <X className="w-4 h-4" />
                      No Taurine
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 transition-smooth hover:translate-x-2">
                      <X className="w-4 h-4" />
                      No Guarana
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 transition-smooth hover:translate-x-2">
                      <X className="w-4 h-4" />
                      No Dairy
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 transition-smooth hover:translate-x-2">
                      <X className="w-4 h-4" />
                      No Gluten
                    </li>
                    <li className="flex items-center gap-2 text-gray-400 transition-smooth hover:translate-x-2">
                      <X className="w-4 h-4" />
                      Low Sodium
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* NEON Organic */}
            <div className={`glass-card-vice rounded-xl overflow-hidden hover-lift ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-orange-500/15 via-[#ff0080]/05 to-transparent p-8 text-center relative overflow-hidden">
                {/* Orange Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-orange-500/20 to-[#ff0080]/08 rounded-full blur-[70px] pointer-events-none" />
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-orange-500 blur-[80px] opacity-50 rounded-full"></div>
                  <img
                    src="/neon-organic-can.png"
                    alt="NEON Organic"
                    className="w-48 h-auto mx-auto mb-6 animate-float relative z-10"
                    style={{ filter: 'drop-shadow(0 0 30px rgba(255, 140, 0, 0.5)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))', animationDelay: '0.5s' }}
                  />
                </div>
                <h3 className="text-4xl font-black text-orange-400 mb-2 font-vice" style={{ textShadow: '0 0 20px rgba(255, 140, 0, 0.5)' }}>
                  NEON ORGANIC
                </h3>
                <p className="text-gray-400 text-lg">USDA Certified Organic</p>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-orange-400 mb-4">
                    Key Features
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Launched in 2017</span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Sold out within day of launch
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        USDA Certified Organic
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">Only 40 calories!</span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Glows Neon Orange in blacklight
                      </span>
                    </li>
                    <li className="flex items-start gap-3 transition-smooth hover:translate-x-2">
                      <Check className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">
                        Secret Tropical Flavor Blend
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="bg-black/50 rounded-lg p-6 border border-orange-500/20">
                  <h4 className="text-xl font-bold text-orange-400 mb-4">
                    What's Inside
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li>• 100mg natural caffeine from Green Tea</li>
                    <li>
                      • Naturally sweetened with fruit juice, cane syrup & stevia
                    </li>
                    <li>• 100% of RDI for 6 essential vitamins</li>
                    <li>• Proprietary blend for energy & antioxidants</li>
                    <li>• Supports healthy metabolism</li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-xl font-bold text-orange-400 mb-4">
                    Certifications
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      Organic
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      Vegan
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      Non-GMO
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      Dairy-free
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      Gluten-free
                    </li>
                    <li className="flex items-center gap-2 text-gray-300 transition-smooth hover:translate-x-2">
                      <Check className="w-4 h-4 text-orange-400" />
                      No artificial anything
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Common Benefits */}
      <section className="py-16 px-4 bg-gradient-to-b from-[#0a0a0a] to-black animated-bg">
        <div className="container mx-auto max-w-4xl">
          <h3 className="text-4xl font-bold text-center mb-12 animate-fade-in-up">
            Everything You <span className="text-[#c8ff00] neon-text">Need</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 hover-lift neon-border animate-fade-in-up stagger-1">
              <h4 className="text-xl font-bold text-[#c8ff00] mb-3">
                Energy that lasts, no crash!
              </h4>
              <p className="text-gray-400">
                Natural caffeine from green tea provides sustained energy without
                the jitters or crash.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 hover-lift neon-border animate-fade-in-up stagger-2">
              <h4 className="text-xl font-bold text-[#c8ff00] mb-3">
                Low calorie options
              </h4>
              <p className="text-gray-400">
                Choose 100 calories with Original or just 40 calories with
                Organic.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 hover-lift neon-border animate-fade-in-up stagger-3">
              <h4 className="text-xl font-bold text-[#c8ff00] mb-3">
                Vitamin-rich formula
              </h4>
              <p className="text-gray-400">
                Over 100% of your daily value for 6 essential B vitamins.
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 hover-lift neon-border animate-fade-in-up stagger-4">
              <h4 className="text-xl font-bold text-[#c8ff00] mb-3">
                And it glows!
              </h4>
              <p className="text-gray-400">
                A naturally occurring element from the Cinchona tree makes NEON
                glow under blacklight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h3 className="text-4xl font-bold text-white">
            Ready to <span className="text-[#c8ff00] neon-text">Pre-Order?</span>
          </h3>
          <p className="text-lg text-gray-300">
            Be among the first to experience the relaunch. Each case contains 24
            cans (8.4 fl oz each).
          </p>
          <button
            onClick={() => setLocation("/")}
            className="bg-[#c8ff00] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#a8d600] transition-smooth neon-pulse"
          >
            Pre-Order Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#c8ff00]/20">
        <div className="container mx-auto text-center text-gray-400">
          <p>&copy; 2025 NEON Energy Drink. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
