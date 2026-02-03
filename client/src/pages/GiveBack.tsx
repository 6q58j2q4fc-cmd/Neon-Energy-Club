import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import HamburgerHeader from "@/components/HamburgerHeader";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Breadcrumb, breadcrumbConfigs } from "@/components/Breadcrumb";
import { 
  Heart, 
  Leaf, 
  Award, 
  Shield, 
  ExternalLink, 
  TreePine, 
  Users, 
  Globe, 
  Star,
  Target,
  Sparkles,
  ShoppingCart,
  Ribbon
} from "lucide-react";

export default function GiveBack() {
  const [, setLocation] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen text-white product-bg-vibrant relative overflow-hidden">
      <SEO 
        title="Give Back - NEON Energy Drink"
        description="NEON Energy Drink is committed to giving back. Learn about our partnerships with Rainforest Trust and Susan G. Komen Foundation to protect the planet and fight breast cancer."
        image="/og-giveback.png"
        url="/give-back"
        keywords="NEON charity, Rainforest Trust, Susan G. Komen, breast cancer awareness, rainforest conservation, give back, charity partnership"
      />
      
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#0a1a1a] via-[#0d2818]/90 to-[#0a1a1a] pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c8ff00]/5 rounded-full blur-[200px]" />
      </div>
      
      <HamburgerHeader variant="vice" />

      {/* Breadcrumb */}
      <div className="pt-24 pb-4 px-4 relative z-20">
        <div className="container mx-auto max-w-6xl">
          <Breadcrumb 
            items={[
              { label: "Home", href: "/" },
              { label: "Give Back", href: "/give-back" }
            ]} 
            variant="vice" 
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4 relative overflow-hidden">
        <div className={`container mx-auto max-w-6xl text-center relative z-10 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30 mb-6">
            <Heart className="w-4 h-4 text-[#c8ff00]" />
            <span className="text-[#c8ff00] font-semibold text-sm">MAKING A DIFFERENCE</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="text-[#c8ff00] drop-shadow-[0_0_30px_rgba(200,255,0,0.5)]">GIVE</span> BACK
          </h1>
          <p className="text-xl text-white/70 leading-relaxed max-w-3xl mx-auto mb-8">
            At NEON, we believe energy should power more than just your day. Every can you buy or sell 
            contributes to causes that matter—protecting our planet and fighting for women's health.
          </p>
          
          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
            {[
              { icon: TreePine, value: "50M+", label: "Acres Protected" },
              { icon: Globe, value: "100%", label: "Donations to Cause" },
              { icon: Users, value: "1M+", label: "Lives Impacted" },
              { icon: Star, value: "4-Star", label: "Charity Rating" }
            ].map((stat, i) => (
              <div key={i} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-center">
                <stat.icon className="w-8 h-8 text-[#c8ff00] mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rainforest Trust Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/30 via-black/40 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Emblem and Visual */}
            <div className={`text-center ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-green-500/30 rounded-full blur-[60px]" />
                <img 
                  src="/rainforest-trust-emblem.png" 
                  alt="Rainforest Trust Conservation Circle Member" 
                  className="w-64 h-64 mx-auto object-contain relative z-10 drop-shadow-[0_0_40px_rgba(0,255,100,0.4)]"
                />
              </div>
              
              {/* NEON Original Can */}
              <div className="mt-8">
                <img 
                  src="/neon-original-can.png" 
                  alt="NEON Original" 
                  className="w-32 h-auto mx-auto animate-float"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(200,255,0,0.5))' }}
                />
                <p className="text-[#c8ff00] font-bold mt-2">NEON Original</p>
                <p className="text-white/60 text-sm">Every can supports conservation</p>
              </div>
            </div>
            
            {/* Right - Content */}
            <div className={`space-y-6 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600/20 border border-green-500/30">
                <Leaf className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">CONSERVATION CIRCLE MEMBER</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white">
                <span className="text-green-400 drop-shadow-[0_0_20px_rgba(0,255,100,0.5)]">Rainforest Trust</span>
              </h2>
              
              <p className="text-xl text-white/80 leading-relaxed">
                Protecting the world's most threatened tropical forests and the species that call them home.
              </p>
              
              <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-green-400">Why Rainforest Trust?</h3>
                <p className="text-white/80 leading-relaxed">
                  Rainforest Trust is one of the most efficient and transparent conservation organizations in the world. 
                  With a remarkable <span className="text-green-400 font-bold">100% of donations going directly to conservation</span>, 
                  they've protected over 50 million acres of critical rainforest habitat.
                </p>
                <p className="text-white/80 leading-relaxed">
                  Their 4-star Charity Navigator rating and commitment to transparency make them a rare gem 
                  in the nonprofit world—a charity where you know your contribution creates genuine, lasting impact.
                </p>
              </div>
              
              <blockquote className="border-l-4 border-green-500 pl-6 py-4 bg-green-900/20 rounded-r-xl">
                <p className="text-white/90 italic text-lg">
                  "At NEON, we believe in giving back to the jungle that bears our fruits. Every can of NEON Original 
                  you buy or sell makes a real difference."
                </p>
                <footer className="text-green-400 text-sm mt-3 font-semibold">— NEON Energy Drink</footer>
              </blockquote>
              
              {/* Impact Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 border border-green-500/20 rounded-xl p-4 text-center">
                  <Award className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">4-Star</div>
                  <div className="text-white/60 text-xs">Charity Navigator</div>
                </div>
                <div className="bg-black/40 border border-green-500/20 rounded-xl p-4 text-center">
                  <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">100%</div>
                  <div className="text-white/60 text-xs">To Conservation</div>
                </div>
                <div className="bg-black/40 border border-green-500/20 rounded-xl p-4 text-center">
                  <TreePine className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">50M+</div>
                  <div className="text-white/60 text-xs">Acres Protected</div>
                </div>
              </div>
              
              <a 
                href="https://www.rainforesttrust.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,255,100,0.3)]"
              >
                Visit Rainforest Trust
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Conservation Work Gallery */}
          <div className="mt-20">
            <h3 className="text-3xl font-black text-center mb-4">
              <span className="text-green-400">Conservation</span> in Action
            </h3>
            <p className="text-white/70 text-center mb-10 max-w-2xl mx-auto">
              See the real impact of rainforest conservation efforts—protecting wildlife, preserving ecosystems, and restoring habitats.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Jaguar Protection */}
              <div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-black/40">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/axVmkbUINpGPfCak.jpg" 
                  alt="Jaguar - Protected Species" 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">Wildlife Protection</h4>
                  <p className="text-white/70 text-sm">Protecting endangered species like jaguars in their natural habitat</p>
                </div>
              </div>
              
              {/* Parrot Conservation */}
              <div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-black/40">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/UhzQaDsFYePBHZrb.jpg" 
                  alt="Macaws - Rainforest Birds" 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">Biodiversity Preservation</h4>
                  <p className="text-white/70 text-sm">Safeguarding diverse species including colorful macaws and parrots</p>
                </div>
              </div>
              
              {/* Tree Planting */}
              <div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-black/40">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/XAMWWLwVFvxQmEyQ.jpg" 
                  alt="Tree Planting - Reforestation" 
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">Reforestation Efforts</h4>
                  <p className="text-white/70 text-sm">Planting new trees to restore degraded rainforest areas</p>
                </div>
              </div>
            </div>
            
            {/* Second Row */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Amazon River Aerial */}
              <div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-black/40">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/sKFcrYqaMSSswzEN.jpg" 
                  alt="Amazon River - Aerial View" 
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">Amazon River Basin</h4>
                  <p className="text-white/70 text-sm">Protecting the world's largest tropical rainforest and its vital waterways</p>
                </div>
              </div>
              
              {/* Rainforest Canopy */}
              <div className="group relative overflow-hidden rounded-2xl border border-green-500/20 bg-black/40">
                <img 
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663234433834/PlUtbjWhUfWSLAUN.jpg" 
                  alt="Rainforest Canopy - Aerial" 
                  className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h4 className="text-xl font-bold text-white mb-2">Rainforest Preservation</h4>
                  <p className="text-white/70 text-sm">Over 50 million acres of critical rainforest habitat protected worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Susan G. Komen Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-900/30 via-black/40 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className={`space-y-6 order-2 lg:order-1 ${isVisible ? 'animate-slide-in-left' : 'opacity-0'}`}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-600/20 border border-pink-500/30">
                <Ribbon className="w-4 h-4 text-pink-400" />
                <span className="text-pink-400 font-semibold text-sm">FIGHTING BREAST CANCER</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-black text-white">
                <span className="text-pink-400 drop-shadow-[0_0_20px_rgba(255,0,128,0.5)]">Susan G. Komen®</span>
              </h2>
              
              <p className="text-xl text-white/80 leading-relaxed">
                The world's leading breast cancer organization, funding groundbreaking research and support programs.
              </p>
              
              <div className="bg-pink-900/30 border border-pink-500/30 rounded-2xl p-6 space-y-4">
                <h3 className="text-xl font-bold text-pink-400">Why Susan G. Komen?</h3>
                <p className="text-white/80 leading-relaxed">
                  Susan G. Komen has invested more than <span className="text-pink-400 font-bold">$3.6 billion</span> in 
                  groundbreaking research, community health outreach, advocacy, and programs in more than 60 countries.
                </p>
                <p className="text-white/80 leading-relaxed">
                  Their mission is to save lives by meeting the most critical needs in our communities and investing 
                  in breakthrough research to prevent and cure breast cancer.
                </p>
              </div>
              
              <blockquote className="border-l-4 border-pink-500 pl-6 py-4 bg-pink-900/20 rounded-r-xl">
                <p className="text-white/90 italic text-lg">
                  "NEON Pink™ was created to empower women and support the fight against breast cancer—not just in October, 
                  but every single day. A portion of every sale goes directly to Susan G. Komen."
                </p>
                <footer className="text-pink-400 text-sm mt-3 font-semibold">— NEON Energy Drink</footer>
              </blockquote>
              
              {/* Impact Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4 text-center">
                  <Target className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">$3.6B+</div>
                  <div className="text-white/60 text-xs">Invested</div>
                </div>
                <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4 text-center">
                  <Globe className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">60+</div>
                  <div className="text-white/60 text-xs">Countries</div>
                </div>
                <div className="bg-black/40 border border-pink-500/20 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">Millions</div>
                  <div className="text-white/60 text-xs">Lives Saved</div>
                </div>
              </div>
              
              <a 
                href="https://www.komen.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,0,128,0.3)]"
              >
                Visit Susan G. Komen
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
            
            {/* Right - Emblem and Visual */}
            <div className={`text-center order-1 lg:order-2 ${isVisible ? 'animate-slide-in-right' : 'opacity-0'}`}>
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-pink-500/30 rounded-full blur-[60px]" />
                <img 
                  src="/susan-g-komen-logo.jpeg" 
                  alt="Susan G. Komen More Than Pink Walk" 
                  className="w-72 mx-auto object-contain relative z-10 rounded-xl shadow-2xl"
                />
              </div>
              
              {/* NEON Pink Can */}
              <div className="mt-8">
                <img 
                  src="/neon-pink-can-nobg.png" 
                  alt="NEON Pink" 
                  className="w-32 h-auto mx-auto animate-float"
                  style={{ filter: 'drop-shadow(0 0 30px rgba(255,0,128,0.5))', animationDelay: '0.5s' }}
                />
                <p className="text-pink-400 font-bold mt-2">NEON Pink™</p>
                <p className="text-white/60 text-sm">Every can fights breast cancer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#c8ff00]/5 to-transparent" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c8ff00]/20 border border-[#c8ff00]/30 mb-6">
              <Sparkles className="w-4 h-4 text-[#c8ff00]" />
              <span className="text-[#c8ff00] font-semibold text-sm">COMMUNITY VOICES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              What Our <span className="text-[#c8ff00] drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">Community</span> Says
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Real stories from people who love NEON and the causes we support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I switched to NEON because I love that my energy drink actually helps protect the rainforest. It's the small choices that add up!",
                name: "Sarah M.",
                title: "Environmental Activist",
                color: "green"
              },
              {
                quote: "As a breast cancer survivor, NEON Pink means so much to me. It's amazing to see a company that fights for women's health every day, not just in October.",
                name: "Jennifer L.",
                title: "Breast Cancer Survivor",
                color: "pink"
              },
              {
                quote: "I became a NEON distributor because I wanted to build a business that gives back. Every sale I make supports causes I believe in.",
                name: "Marcus T.",
                title: "NEON Distributor",
                color: "yellow"
              }
            ].map((testimonial, i) => (
              <div 
                key={i} 
                className={`bg-black/40 backdrop-blur-sm border rounded-2xl p-6 ${
                  testimonial.color === 'green' ? 'border-green-500/30' :
                  testimonial.color === 'pink' ? 'border-pink-500/30' :
                  'border-[#c8ff00]/30'
                }`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star 
                      key={j} 
                      className={`w-4 h-4 ${
                        testimonial.color === 'green' ? 'fill-green-400 text-green-400' :
                        testimonial.color === 'pink' ? 'fill-pink-400 text-pink-400' :
                        'fill-[#c8ff00] text-[#c8ff00]'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-white/80 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className={`font-bold ${
                    testimonial.color === 'green' ? 'text-green-400' :
                    testimonial.color === 'pink' ? 'text-pink-400' :
                    'text-[#c8ff00]'
                  }`}>{testimonial.name}</p>
                  <p className="text-white/50 text-sm">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#c8ff00]/10 to-transparent" />
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to <span className="text-[#c8ff00] drop-shadow-[0_0_20px_rgba(200,255,0,0.5)]">Make a Difference?</span>
          </h2>
          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            Every NEON you drink powers more than just your day—it powers real change in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setLocation("/products")}
              className="bg-[#c8ff00] text-black px-10 py-6 rounded-xl font-bold text-lg hover:bg-[#a8d600] transition-all hover:scale-105 shadow-[0_0_40px_rgba(200,255,0,0.4)]"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shop NEON Products
            </Button>
            <Button
              onClick={() => setLocation("/join")}
              variant="outline"
              className="border-[#c8ff00] text-[#c8ff00] px-10 py-6 rounded-xl font-bold text-lg hover:bg-[#c8ff00]/10 transition-all"
            >
              Become a Distributor
            </Button>
          </div>
          <p className="text-sm text-white/40 mt-6">
            Join thousands who've made the switch to energy that gives back.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
