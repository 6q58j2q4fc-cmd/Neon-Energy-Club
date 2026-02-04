import { useState } from "react";
import { useLocation } from "wouter";
import { Search as SearchIcon, ArrowLeft, Package, Users, Building2, FileText, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const searchCategories = [
  { id: "products", label: "Products", icon: Package, color: "#c8ff00" },
  { id: "distributors", label: "Distributors", icon: Users, color: "#00ffff" },
  { id: "franchise", label: "Franchise", icon: Building2, color: "#ff0080" },
  { id: "pages", label: "Pages", icon: FileText, color: "#8b5cf6" },
  { id: "shop", label: "Shop", icon: ShoppingBag, color: "#f59e0b" },
];

const quickLinks = [
  { label: "NEON Energy Drink", path: "/products" },
  { label: "Become a Distributor", path: "/join" },
  { label: "Franchise Opportunities", path: "/franchise" },
  { label: "Vending Machines", path: "/vending" },
  { label: "Compensation Plan", path: "/compensation" },
  { label: "NFT Gallery", path: "/nft-gallery" },
  { label: "Celebrity Ambassadors", path: "/celebrities" },
  { label: "About NEON", path: "/about" },
  { label: "Shop", path: "/shop" },
  { label: "Crowdfunding", path: "/crowdfund" },
];

export default function Search() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredLinks = quickLinks.filter(link =>
    link.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1a1a] via-[#0d2818] to-[#0a1a1a]">
      <Header />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white/60 hover:text-[#c8ff00] transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>

          {/* Search Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
              Search <span className="text-[#c8ff00]">NEON</span>
            </h1>
            <p className="text-white/60 text-lg">
              Find products, distributors, franchise info, and more
            </p>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#c8ff00]" />
            <Input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-14 pr-4 py-6 text-xl bg-black/50 border-2 border-[#c8ff00]/30 focus:border-[#c8ff00] rounded-2xl text-white placeholder:text-white/40"
              autoFocus
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            {searchCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? "border-[#c8ff00] bg-[#c8ff00]/20 text-[#c8ff00]"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                <cat.icon className="w-4 h-4" style={{ color: cat.color }} />
                <span className="font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Quick Links / Search Results */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white/80 mb-4">
              {query ? "Search Results" : "Quick Links"}
            </h2>
            
            {filteredLinks.length > 0 ? (
              <div className="grid gap-3">
                {filteredLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => setLocation(link.path)}
                    className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-xl hover:border-[#c8ff00]/50 hover:bg-[#c8ff00]/5 transition-all duration-200 group"
                  >
                    <span className="text-white font-semibold group-hover:text-[#c8ff00] transition-colors">
                      {link.label}
                    </span>
                    <ArrowLeft className="w-5 h-5 text-white/40 group-hover:text-[#c8ff00] rotate-180 transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
                <p className="text-white/50 text-lg">No results found for "{query}"</p>
                <p className="text-white/30 mt-2">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Popular Searches */}
          {!query && (
            <div className="mt-12 pt-8 border-t border-white/10">
              <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">
                Popular Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {["Energy Drink", "Distributor", "Franchise", "Vending", "NFT", "Compensation"].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/60 hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
