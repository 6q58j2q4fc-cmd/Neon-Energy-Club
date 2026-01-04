import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function About() {
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
              className="text-[#c8ff00] font-semibold neon-text"
            >
              Our Story
            </button>
            <button
              onClick={() => setLocation("/products")}
              className="text-gray-300 hover:text-[#c8ff00] transition-smooth"
            >
              Products
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-black via-[#0a0a0a] to-black animated-bg">
        <div className={`container mx-auto max-w-4xl text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6">
            OUR <span className="text-[#c8ff00] neon-text">STORY</span>
          </h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            A journey from the mountains of Oregon to the world
          </p>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-16 px-4 animated-bg">
        <div className="container mx-auto max-w-4xl space-y-12">
          {/* Origin */}
          <div className={`space-y-4 hover-lift neon-border rounded-lg p-8 bg-black/50 ${isVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold text-[#c8ff00]">The Beginning</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Originally founded in 2013 in the beautiful mountain city and
              microbrew mecca of Bend, Oregon, NEON Energy Drink emerged from a
              vision to revolutionize the energy beverage industry. Founded by
              Harvard Business School alumnus Dakota Rea, NEON was born with a
              clear purpose: improving the drinking health of the next
              generation by bringing popular healthy energy drink choices to the
              mainstream market.
            </p>
          </div>

          {/* Growth */}
          <div className={`space-y-4 hover-lift neon-border rounded-lg p-8 bg-black/50 ${isVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold text-[#c8ff00]">
              Explosive Growth
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              What started as a local Oregon brand quickly became a national and
              international phenomenon. NEON grew to 48 states in the US in its
              first year on the market and spread to 14 countries around the
              world within just 5 years. The brand became one of the fastest
              growing beverage brands in the past 100 years, rooted in a future
              forward and holistic beverage culture.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 text-center hover-lift neon-border">
                <div className="text-5xl font-black text-[#c8ff00] mb-2 neon-text">48</div>
                <div className="text-gray-400">States in Year One</div>
              </div>
              <div className="bg-[#0a0a0a] border border-[#c8ff00]/20 rounded-lg p-6 text-center hover-lift neon-border">
                <div className="text-5xl font-black text-[#c8ff00] mb-2 neon-text">14</div>
                <div className="text-gray-400">Countries in 5 Years</div>
              </div>
            </div>
          </div>

          {/* Celebrity Exposure */}
          <div className={`space-y-4 hover-lift neon-border rounded-lg p-8 bg-black/50 ${isVisible ? 'animate-fade-in-up stagger-3' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold text-[#c8ff00]">
              Cultural Impact
            </h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              From events with the world's top DJs to being featured in music
              videos by Snoop Dog, Chris Brown, and Christina Milian, to
              American Idol winner David Cook's "NEON Tour," NEON Energy Drink
              appeared in some of the world's most viewed music videos and
              events, reaching brand exposure to nearly 15% of the world's
              population in only 5 years.
            </p>
          </div>

          {/* Relaunch */}
          <div className={`space-y-4 hover-lift neon-border rounded-lg p-8 bg-black/50 ${isVisible ? 'animate-fade-in-up stagger-4' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold text-[#c8ff00]">The Relaunch</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              After repurchasing all of the assets from prior partners during
              the COVID-19 pandemic, we are now conducting a global relaunch of
              our brand to our large US and EU subscriber base. The energy is
              back, and we're ready to light up the world once again with the
              legendary taste and energy boost that defined a generation.
            </p>
          </div>

          {/* Mission */}
          <div className={`bg-gradient-to-r from-[#c8ff00]/10 to-transparent border-l-4 border-[#c8ff00] p-8 rounded-r-lg neon-border ${isVisible ? 'animate-fade-in-up stagger-5' : 'opacity-0'}`}>
            <h3 className="text-2xl font-bold text-[#c8ff00] mb-4">
              Our Mission
            </h3>
            <p className="text-xl text-gray-200 italic leading-relaxed">
              "Improving the drinking health of the next generation by bringing
              popular healthy energy drink choices to the mainstream market."
            </p>
            <p className="text-gray-400 mt-4">— Dakota Rea, Founder</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black to-[#0a0a0a] animated-bg">
        <div className="container mx-auto max-w-2xl text-center space-y-6">
          <h3 className="text-4xl font-bold text-white">
            Be Part of the <span className="text-[#c8ff00] neon-text">Relaunch</span>
          </h3>
          <p className="text-lg text-gray-300">
            Join us as we bring back the energy drink that changed everything.
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
