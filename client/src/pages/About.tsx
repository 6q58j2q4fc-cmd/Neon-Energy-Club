import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { useHashNavigation } from "@/hooks/useHashNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t, language } = useLanguage();
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Initialize hash navigation
  useHashNavigation({ offset: 120 });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a] text-white relative overflow-hidden">
      <SEO 
        title="Our Story - NEON Energy Drink"
        description="Discover the NEON Energy Drink story. From founding to global expansion across 48 states and 14 countries. Learn about our mission to revolutionize clean energy."
        image="/og-about.png"
        url="/about"
        keywords="NEON story, energy drink history, NEON founding, clean energy mission, natural energy drink brand"
      />
      {/* Avatar-Style Glowing Jungle Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#001a0d] via-[#002a15] to-[#001a0d]" />
        
        {/* Bioluminescent glow spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-[#00ffcc]/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#88ff00]/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#00ff44]/8 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '0.5s' }} />
        
        {/* Floating particles effect */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 20% 30%, rgba(0,255,136,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(136,255,0,0.03) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(0,255,200,0.02) 0%, transparent 60%)' }} />
        
        {/* Vine/foliage silhouettes at edges */}
        <div className="absolute top-0 left-0 w-64 h-full opacity-20" style={{ background: 'linear-gradient(to right, rgba(0,100,50,0.5), transparent)' }} />
        <div className="absolute top-0 right-0 w-64 h-full opacity-20" style={{ background: 'linear-gradient(to left, rgba(0,100,50,0.5), transparent)' }} />
      </div>
      <HamburgerHeader variant="vice" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumb items={breadcrumbConfigs.about} variant="vice" />
        </div>
      </div>

      {/* Hero Section - Vice City Style */}
      <section id="hero" className="pt-8 pb-16 px-4 relative z-10 scroll-focus-target">
        <div className={`container mx-auto max-w-4xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className="text-5xl md:text-7xl font-black mb-6 font-vice">
            OUR <span className="gradient-text-vice drop-shadow-[0_0_20px_rgba(255,0,128,0.5)]">STORY</span>
          </h2>
          <p className="text-xl text-white/70 leading-relaxed">
            A journey from the mountains of Oregon to the world
          </p>
        </div>
      </section>

      {/* Story Content - Vice City Style */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto max-w-4xl space-y-12">
          {/* Origin */}
          <div className={`space-y-4 hover-lift glass-card-vice rounded-xl p-8 ${isVisible ? 'animate-fade-in-up stagger-1' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold gradient-text-vice font-vice">The Beginning</h3>
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
          <div className={`space-y-4 hover-lift glass-card-vice rounded-xl p-8 ${isVisible ? 'animate-fade-in-up stagger-2' : 'opacity-0'}`}>
            <h3 className="text-3xl font-bold gradient-text-vice font-vice">
              Explosive Growth
            </h3>
            <p className="text-lg text-white/70 leading-relaxed">
              What started as a local Oregon brand quickly became a national and
              international phenomenon. NEON grew to 48 states in the US in its
              first year on the market and spread to 14 countries around the
              world within just 5 years. The brand became one of the fastest
              growing beverage brands in the past 100 years, rooted in a future
              forward and holistic beverage culture.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="stat-card text-center">
                <div className="text-5xl font-black text-[#00ffff] mb-2 vice-text-cyan font-vice">48</div>
                <div className="text-white/60">States in Year One</div>
              </div>
              <div className="stat-card text-center">
                <div className="text-5xl font-black text-[#ff0080] mb-2 vice-text-pink font-vice">14</div>
                <div className="text-white/60">Countries in 5 Years</div>
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

          {/* Founder Section - Dakota Rea */}
          <div id="founder" className={`space-y-6 hover-lift glass-card-vice rounded-xl p-8 ${isVisible ? 'animate-fade-in-up stagger-6' : 'opacity-0'}`}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* Founder Image */}
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-[#c8ff00] shadow-[0_0_30px_rgba(200,255,0,0.3)] flex-shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-[#c8ff00]/20 to-[#00ffcc]/20 flex items-center justify-center">
                  <span className="text-6xl md:text-8xl font-black text-[#c8ff00]">DR</span>
                </div>
              </div>
              
              {/* Founder Info */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-bold gradient-text-vice font-vice mb-2">Dakota Rea</h3>
                <p className="text-[#c8ff00] font-semibold text-lg mb-4">Founder & CEO, NEON Energy Drink</p>
                <p className="text-lg text-gray-300 leading-relaxed mb-4">
                  A Harvard Business School alumnus with a vision to revolutionize the energy beverage industry. 
                  Dakota founded NEON in 2013 with a mission to bring healthy, clean energy drinks to the mainstream market. 
                  His innovative approach and relentless drive have made NEON one of the fastest-growing beverage brands in history.
                </p>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-[#c8ff00]/20 text-[#c8ff00] rounded-full text-sm">Harvard MBA</span>
                  <span className="px-3 py-1 bg-[#00ffcc]/20 text-[#00ffcc] rounded-full text-sm">Serial Entrepreneur</span>
                  <span className="px-3 py-1 bg-[#ff0080]/20 text-[#ff0080] rounded-full text-sm">Beverage Innovator</span>
                </div>
              </div>
            </div>
          </div>

          {/* Neon Dreams Book Pre-Order */}
          <div id="book" className={`space-y-6 hover-lift rounded-xl overflow-hidden ${isVisible ? 'animate-fade-in-up stagger-7' : 'opacity-0'}`}>
            <div className="bg-gradient-to-r from-[#1a0a2e] via-[#2a1040] to-[#1a0a2e] p-8 border border-[#c8ff00]/30">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Book Cover */}
                <div className="w-48 md:w-56 flex-shrink-0">
                  <img 
                    src="/neon-dreams-book.jpg" 
                    alt="NEON Dreams Book Cover - Coming Soon by Dakota Rea"
                    className="w-full h-auto rounded-lg shadow-[0_0_40px_rgba(200,255,0,0.3)] border border-[#c8ff00]/50 hover:shadow-[0_0_60px_rgba(200,255,0,0.5)] transition-all duration-300"
                  />
                </div>
                
                {/* Book Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-block px-3 py-1 bg-[#ff0080]/20 text-[#ff0080] rounded-full text-sm font-semibold mb-4">
                    📚 PRE-ORDER NOW
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    <span className="text-[#c8ff00]">NEON DREAMS</span>
                  </h3>
                  <p className="text-xl text-white/80 mb-4">The Untold Story Behind the Energy Revolution</p>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Go behind the scenes of NEON Energy Drink's incredible journey. From a small startup in Bend, Oregon 
                    to a global phenomenon reaching 15% of the world's population. Dakota Rea shares the triumphs, 
                    challenges, and lessons learned building one of the fastest-growing beverage brands in history.
                  </p>
                  <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6">
                    <p className="text-green-400 font-semibold flex items-center gap-2">
                      <span className="text-2xl">🌳</span>
                      A portion of every book sold will be donated to the <a href="https://www.rainforesttrust.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-300 transition-colors">Rainforest Trust</a>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button 
                      onClick={() => window.open('/shop?product=neon-dreams-book', '_blank')}
                      className="bg-[#c8ff00] text-black px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#a8d600] transition-all shadow-[0_0_20px_rgba(200,255,0,0.3)] hover:shadow-[0_0_30px_rgba(200,255,0,0.5)]"
                    >
                      Pre-Order Now - $24.99
                    </button>
                    <button 
                      onClick={() => window.open('/shop?product=neon-dreams-audiobook', '_blank')}
                      className="bg-transparent border-2 border-[#c8ff00] text-[#c8ff00] px-8 py-3 rounded-lg font-bold text-lg hover:bg-[#c8ff00]/10 transition-all"
                    >
                      Audiobook - $19.99
                    </button>
                  </div>
                  <p className="text-white/50 text-sm mt-4">Expected Release: Summer 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 relative z-10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-16">
            Our <span className="text-[#c8ff00]">Journey</span>
          </h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#c8ff00] via-[#00ffcc] to-[#c8ff00] rounded-full" />
            
            {/* Timeline items */}
            {[
              { year: "2013", title: "Founded in Bend, Oregon", desc: "NEON Energy Drink is born in the microbrew mecca of Oregon", side: "left" },
              { year: "2014", title: "National Expansion", desc: "Expanded to 48 states in our first year on the market", side: "right" },
              { year: "2015", title: "Celebrity Partnerships", desc: "Featured in music videos by Snoop Dogg, Chris Brown & Christina Milian", side: "left" },
              { year: "2016", title: "Global Reach", desc: "Expanded to 14 countries across Europe and Asia", side: "right" },
              { year: "2018", title: "15% Global Exposure", desc: "Brand reached nearly 15% of the world's population", side: "left" },
              { year: "2020", title: "Asset Repurchase", desc: "Repurchased all assets during COVID-19 pandemic", side: "right" },
              { year: "2026", title: "Global Relaunch", desc: "Returning bigger and better with our legendary formula", side: "left" },
            ].map((item, i) => (
              <div key={i} className={`relative flex items-center mb-12 ${item.side === 'left' ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-5/12 ${item.side === 'left' ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className={`bg-black/60 backdrop-blur-sm border border-[#c8ff00]/30 rounded-xl p-6 hover:border-[#c8ff00]/60 transition-all ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="text-[#c8ff00] font-black text-2xl mb-2">{item.year}</div>
                    <h4 className="text-white font-bold text-lg mb-2">{item.title}</h4>
                    <p className="text-white/60 text-sm">{item.desc}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-[#c8ff00] rounded-full border-4 border-[#0a1a1a] shadow-[0_0_20px_rgba(200,255,0,0.5)]" />
                <div className="w-5/12" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-black/50 to-[#0a1a1a]">
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
      <Footer />
    </div>
  );
}
