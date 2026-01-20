import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#0a1a1a] to-[#050d0d] border-t border-[#c8ff00]/10 overflow-hidden">
      {/* Tropical Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#0d2818]/50 to-transparent rounded-full blur-[80px]" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#ff0080]/10 to-transparent rounded-full blur-[60px]" />
        <div className="absolute top-0 left-1/3 w-32 h-32 bg-[#c8ff00]/5 rounded-full blur-[40px]" />
      </div>
      
      {/* Firefly accents */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-[#c8ff00] rounded-full opacity-40"
            style={{ 
              left: `${15 + i * 20}%`, 
              top: `${30 + (i % 3) * 20}%`,
              boxShadow: '0 0 6px 2px rgba(200, 255, 0, 0.4)',
              animation: `firefly-glow ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.7}s`
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#c8ff00] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(200,255,0,0.4)]">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black text-[#c8ff00] drop-shadow-[0_0_10px_rgba(200,255,0,0.3)]">NEON</span>
            </div>
            <p className="text-white/60 text-sm">
              Clean energy. Natural ingredients. Zero compromise.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#c8ff00] font-bold mb-4 text-sm tracking-wider">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Products</Link></li>
              <li><Link href="/franchise" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Franchise</Link></li>
              <li><Link href="/vending" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Vending</Link></li>
              <li><Link href="/crowdfund" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Back Us</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#c8ff00] font-bold mb-4 text-sm tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Our Story</Link></li>
              <li><Link href="/compensation" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Compensation Plan</Link></li>
              <li><Link href="/join" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Join Now</Link></li>
              <li><Link href="/nft-gallery" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">NFT Gallery</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[#c8ff00] font-bold mb-4 text-sm tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/policies" className="text-white/60 hover:text-[#c8ff00] text-sm transition-colors">Policies & Procedures</Link></li>
            </ul>
          </div>
        </div>

        {/* Partner Logos & Certifications */}
        <div className="border-t border-[#c8ff00]/10 pt-6 mb-6">
          <div className="flex flex-col items-center gap-6">
            {/* Disney Partnership */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-[#00ffff] text-xs font-semibold tracking-wider">AS SEEN ON</p>
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#1a1a2e]/80 to-[#16213e]/80 px-6 py-3 rounded-xl border border-[#00ffff]/30">
                <span className="text-2xl font-black bg-gradient-to-r from-[#00ffff] via-[#c8ff00] to-[#ff0080] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
                  Disney®
                </span>
              </div>
              <p className="text-[#c8ff00] text-xs font-bold mt-1">NEON Energy Drink® — Official Advertising Partner of Disney Campaign Manager</p>
            </div>
            
            {/* Certifications Row */}
            <div className="flex flex-wrap justify-center items-center gap-6">
              {/* Rainforest Alliance */}
              <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                <div className="w-8 h-8 rounded-full bg-[#00a651] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[#00a651] text-xs font-bold">RAINFOREST ALLIANCE</p>
                  <p className="text-white/50 text-[10px]">Certified Supporter</p>
                </div>
              </div>
              
              {/* Non-GMO */}
              <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                <div className="w-8 h-8 rounded-full bg-[#f5a623] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">NON</span>
                </div>
                <div>
                  <p className="text-[#f5a623] text-xs font-bold">NON-GMO</p>
                  <p className="text-white/50 text-[10px]">Verified</p>
                </div>
              </div>
              
              {/* Vegan */}
              <div className="flex items-center gap-2 bg-[#0d2818]/50 px-4 py-2 rounded-lg border border-[#c8ff00]/20">
                <div className="w-8 h-8 rounded-full bg-[#c8ff00] flex items-center justify-center">
                  <span className="text-black text-xs font-bold">V</span>
                </div>
                <div>
                  <p className="text-[#c8ff00] text-xs font-bold">100% VEGAN</p>
                  <p className="text-white/50 text-[10px]">Plant-Based</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#c8ff00]/10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-white/50 text-sm text-center md:text-left">
              © 2026 Neon Corporation. All Rights Reserved. Property of Neon Corporation.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a 
                href="https://twitter.com/neonenergy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#c8ff00] transition-colors hover:drop-shadow-[0_0_8px_rgba(200,255,0,0.5)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com/neonenergy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#ff0080] transition-colors hover:drop-shadow-[0_0_8px_rgba(255,0,128,0.5)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com/neonenergy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/50 hover:text-[#00ffff] transition-colors hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Trademark Statement */}
          <div className="mt-6 pt-4 border-t border-[#c8ff00]/5">
            <p className="text-white/30 text-[10px] text-center leading-relaxed">
              Disney® is a registered trademark of The Walt Disney Company. NEON Energy Drink® is a registered trademark of Neon Corporation. 
              All other trademarks, service marks, and logos are the property of their respective owners. 
              Use of third-party trademarks does not imply endorsement or affiliation unless expressly stated.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
