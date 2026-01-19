import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Zap, Calendar, Eye, ArrowRight, Clock, Tag, Search, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { SEO } from "@/components/SEO";
import { useState } from "react";

const categories = [
  { value: "all", label: "All Posts" },
  { value: "product", label: "Product" },
  { value: "health", label: "Health & Wellness" },
  { value: "business", label: "Business" },
  { value: "franchise", label: "Franchise" },
  { value: "distributor", label: "Distributor" },
  { value: "news", label: "News" },
  { value: "lifestyle", label: "Lifestyle" },
];

export default function Blog() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const blogPosts = trpc.blog.list.useQuery({ 
    category: selectedCategory === "all" ? undefined : selectedCategory,
    limit: 20 
  });

  const filteredPosts = blogPosts.data?.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const navItems = [
    { label: "HOME", path: "/" },
    { label: "STORY", path: "/about" },
    { label: "PRODUCTS", path: "/shop" },
    { label: "FRANCHISE", path: "/franchise" },
    { label: "BLOG", path: "/blog" },
  ];

  return (
    <div className="min-h-screen vice-bg text-white">
      <SEO 
        title="Blog - NEON Energy Drink"
        description="Stay updated with the latest news, health tips, business insights, and success stories from the NEON Energy Drink community."
        keywords="NEON blog, energy drink news, health tips, franchise success, distributor stories, natural energy"
        url="/blog"
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setLocation("/")}>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c8ff00] to-[#a8e000] flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black font-vice text-[#c8ff00]">NEON®</span>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    item.path === "/blog" 
                      ? "text-[#c8ff00] bg-[#c8ff00]/10" 
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => setLocation("/crowdfund")}
                className="btn-primary-shiny text-black font-bold px-6 h-10 rounded-lg"
              >
                BACK US
              </Button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/80"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 fixed top-[72px] left-0 right-0 z-40"
            >
              <nav className="container mx-auto px-6 py-4 flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      setLocation(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="py-3 px-4 text-left text-white/80 hover:text-[#c8ff00] hover:bg-white/5 rounded-lg transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        <div className="absolute inset-0 animated-grid opacity-20" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="badge-neon mb-4 inline-block">NEON BLOG</span>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="text-white">INSIGHTS &</span>
              <br />
              <span className="text-[#c8ff00]">INSPIRATION</span>
            </h1>
            <p className="text-white/60 text-lg">
              Stay updated with the latest news, health tips, business insights, 
              and success stories from the NEON community.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter */}
      <section className="pb-8">
        <div className="container mx-auto px-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#c8ff00]/50 focus:outline-none transition-all"
                />
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? "bg-[#c8ff00] text-black"
                        : "bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {blogPosts.isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-white/5" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-white/10 rounded w-1/3" />
                    <div className="h-6 bg-white/10 rounded w-full" />
                    <div className="h-4 bg-white/10 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  onClick={() => setLocation(`/blog/${post.slug}`)}
                  className="glass-card rounded-2xl overflow-hidden cursor-pointer hover-lift group"
                >
                  {/* Featured Image */}
                  <div className="h-48 bg-gradient-to-br from-[#c8ff00]/20 to-[#9d4edd]/20 relative overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Zap className="w-16 h-16 text-[#c8ff00]/30" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="badge-neon text-[10px]">
                        {post.category.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-xs text-white/50 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "Draft"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.views || 0} views
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-[#c8ff00] transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-white/60 text-sm line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center text-[#c8ff00] text-sm font-medium group-hover:gap-2 transition-all">
                      Read More
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-[#c8ff00]/10 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-10 h-10 text-[#c8ff00]/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
              <p className="text-white/60 mb-6">
                Check back soon for exciting content about NEON Energy Drink!
              </p>
              <Button
                onClick={() => setLocation("/")}
                className="btn-primary-shiny text-black font-bold"
              >
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="glass-card-neon rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-black text-white mb-4">
              NEVER MISS AN <span className="text-[#c8ff00]">UPDATE</span>
            </h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Subscribe to our newsletter and get the latest NEON news, exclusive offers, 
              and insider tips delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#c8ff00]/50 focus:outline-none"
              />
              <Button className="btn-primary-shiny text-black font-bold px-8">
                SUBSCRIBE
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#c8ff00] to-[#a8e000] flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-[#c8ff00]">NEON®</span>
            </div>
            <p className="text-white/40 text-sm">
              © 2026 NEON Energy Drink. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
