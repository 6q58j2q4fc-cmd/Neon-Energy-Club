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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-[#c8ff00]/20 bg-black/80 backdrop-blur-md fixed top-0 w-full z-50 transition-smooth">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1
            className="text-2xl font-bold text-[#c8ff00] neon-text cursor-pointer"
            onClick={() => setLocation("/")}
          >
            NEON
          </h1>
          <nav className="flex gap-6 items-center">
            <button
              onClick={() => setLocation("/")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Home
            </button>
            <button
              onClick={() => setLocation("/about")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Our Story
            </button>
            <button
              onClick={() => setLocation("/products")}
              className="text-[#c8ff00] font-semibold neon-text"
            >
              Products
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 animated-bg relative overflow-hidden">
        {/* Decorative Splashes */}
        <img 
          src="/images/green-splash-1.png" 
          alt="" 
          className="absolute -left-20 top-1/4 w-64 h-auto opacity-30 pointer-events-none"
        />
        <img 
          src="/images/green-splash-2.png" 
          alt="" 
          className="absolute -right-10 bottom-0 w-48 h-auto opacity-20 pointer-events-none"
        />
        <img 
          src="/images/water-splash.png" 
          alt="" 
          className="absolute right-1/4 top-10 w-32 h-auto opacity-15 pointer-events-none"
        />
        
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            THE <span className="text-[#c8ff00] neon-text">PRODUCTS</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Two incredible flavors, both designed to give you energy that lasts
            without the crash. Finally, an energy drink that tastes good!
          </p>
        </div>
      </section>

      {/* Products Comparison */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* NEON Original */}
            <div className={`bg-[#0a0a0a] border border-[#c8ff00]/30 rounded-xl overflow-hidden hover-lift neon-border ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-[#c8ff00]/20 to-transparent p-8 text-center relative overflow-hidden">
                {/* Background Splash */}
                <img 
                  src="/images/energy-splash.png" 
                  alt="" 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-auto opacity-40 pointer-events-none"
                />
                
                {/* Floating Fruit */}
                <img 
                  src="/images/lime-splash.jpg" 
                  alt="Fresh lime" 
                  className="absolute -left-4 top-1/3 w-16 h-16 object-cover rounded-full border-2 border-[#c8ff00]/30 shadow-lg animate-float-slow"
                  style={{ animationDelay: "0.3s" }}
                />
                
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-[#c8ff00] blur-[80px] opacity-40 rounded-full"></div>
                  <img
                    src="/neon-can.png"
                    alt="NEON Original"
                    className="w-48 h-auto mx-auto mb-6 drop-shadow-2xl neon-glow animate-float relative z-10"
                  />
                </div>
                <h3 className="text-4xl font-black text-[#c8ff00] mb-2 neon-text">
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
            <div className={`bg-[#0a0a0a] border border-orange-500/30 rounded-xl overflow-hidden hover-lift neon-border ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="bg-gradient-to-b from-orange-500/20 to-transparent p-8 text-center">
                <div className="w-48 h-64 mx-auto mb-6 bg-gradient-to-b from-orange-400/20 to-transparent rounded-lg flex items-center justify-center hover-glow">
                  <div className="text-6xl font-black text-orange-400">
                    NEON
                    <div className="text-2xl font-normal">ORGANIC</div>
                  </div>
                </div>
                <h3 className="text-4xl font-black text-orange-400 mb-2">
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
