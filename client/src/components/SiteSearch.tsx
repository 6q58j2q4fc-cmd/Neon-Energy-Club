import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { Search, X, ArrowRight, FileText, HelpCircle, Package, Users, Zap, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Searchable content index
const searchableContent = [
  // Products
  { 
    id: 'product-original', 
    title: 'NEON Original', 
    description: 'Classic energy formula with natural caffeine and adaptogens',
    category: 'Products',
    path: '/products#original',
    icon: Package,
    keywords: ['energy drink', 'original', 'classic', 'caffeine', 'natural']
  },
  { 
    id: 'product-organic', 
    title: 'NEON Organic', 
    description: 'USDA certified organic energy with zero artificial ingredients',
    category: 'Products',
    path: '/products#organic',
    icon: Package,
    keywords: ['organic', 'usda', 'certified', 'natural', 'clean']
  },
  { 
    id: 'product-mixed', 
    title: 'NEON Mixed Case', 
    description: 'Try all flavors with our variety pack',
    category: 'Products',
    path: '/products#mixed',
    icon: Package,
    keywords: ['mixed', 'variety', 'pack', 'sampler', 'all flavors']
  },
  
  // Pages
  { 
    id: 'page-home', 
    title: 'Home', 
    description: 'NEON Energy Drink - Natural energy without the crash',
    category: 'Pages',
    path: '/',
    icon: Zap,
    keywords: ['home', 'main', 'landing']
  },
  { 
    id: 'page-products', 
    title: 'Products', 
    description: 'Browse our full lineup of natural energy drinks',
    category: 'Pages',
    path: '/products',
    icon: Package,
    keywords: ['products', 'shop', 'buy', 'drinks']
  },
  { 
    id: 'page-story', 
    title: 'Our Story', 
    description: 'Learn about the NEON journey and mission',
    category: 'Pages',
    path: '/story',
    icon: FileText,
    keywords: ['story', 'about', 'history', 'mission', 'team']
  },
  { 
    id: 'page-franchise', 
    title: 'Franchise Opportunities', 
    description: 'Start your own NEON distribution business',
    category: 'Pages',
    path: '/franchise',
    icon: Users,
    keywords: ['franchise', 'business', 'opportunity', 'distributor', 'partner']
  },
  { 
    id: 'page-vending', 
    title: 'Vending Machines', 
    description: 'AI-powered vending machine partnerships',
    category: 'Pages',
    path: '/vending',
    icon: Package,
    keywords: ['vending', 'machine', 'automated', 'passive income']
  },
  { 
    id: 'page-crowdfund', 
    title: 'Crowdfunding', 
    description: 'Support the NEON relaunch campaign',
    category: 'Pages',
    path: '/crowdfund',
    icon: Zap,
    keywords: ['crowdfund', 'invest', 'support', 'backer', 'campaign']
  },
  { 
    id: 'page-blog', 
    title: 'Blog', 
    description: 'News, updates, and health tips',
    category: 'Pages',
    path: '/blog',
    icon: FileText,
    keywords: ['blog', 'news', 'articles', 'updates']
  },
  
  // FAQ Items
  { 
    id: 'faq-caffeine', 
    title: 'How much caffeine is in NEON?', 
    description: '150mg of natural caffeine from green tea extract - equivalent to about 1.5 cups of coffee',
    category: 'FAQ',
    path: '/faq#caffeine',
    icon: HelpCircle,
    keywords: ['caffeine', 'energy', 'mg', 'coffee', 'green tea']
  },
  { 
    id: 'faq-sugar', 
    title: 'Is NEON sugar-free?', 
    description: 'Yes! NEON contains zero added sugar and is sweetened naturally',
    category: 'FAQ',
    path: '/faq#sugar',
    icon: HelpCircle,
    keywords: ['sugar', 'sweetener', 'calories', 'diet', 'zero']
  },
  { 
    id: 'faq-ingredients', 
    title: 'What are the ingredients?', 
    description: 'Natural caffeine, B-vitamins, adaptogens, and tropical fruit extracts',
    category: 'FAQ',
    path: '/faq#ingredients',
    icon: HelpCircle,
    keywords: ['ingredients', 'natural', 'vitamins', 'adaptogens', 'healthy']
  },
  { 
    id: 'faq-shipping', 
    title: 'How long does shipping take?', 
    description: 'Standard shipping takes 3-5 business days. Express options available.',
    category: 'FAQ',
    path: '/faq#shipping',
    icon: HelpCircle,
    keywords: ['shipping', 'delivery', 'days', 'express', 'tracking']
  },
  { 
    id: 'faq-distributor', 
    title: 'How do I become a distributor?', 
    description: 'Join our network and earn commissions selling NEON products',
    category: 'FAQ',
    path: '/faq#distributor',
    icon: HelpCircle,
    keywords: ['distributor', 'join', 'earn', 'commission', 'mlm', 'network']
  },
  { 
    id: 'faq-returns', 
    title: 'What is your return policy?', 
    description: '30-day satisfaction guarantee on all orders',
    category: 'FAQ',
    path: '/faq#returns',
    icon: HelpCircle,
    keywords: ['return', 'refund', 'guarantee', 'satisfaction', 'money back']
  },
  
  // Portals
  { 
    id: 'portal-customer', 
    title: 'Customer Portal', 
    description: 'Track orders, earn rewards, and manage your account',
    category: 'Account',
    path: '/customer-portal',
    icon: Users,
    keywords: ['customer', 'account', 'orders', 'rewards', 'profile']
  },
  { 
    id: 'portal-distributor', 
    title: 'Distributor Portal', 
    description: 'Manage your team, track commissions, and grow your business',
    category: 'Account',
    path: '/distributor-portal',
    icon: Users,
    keywords: ['distributor', 'dashboard', 'commissions', 'team', 'business']
  },
];

// Fuzzy search function
function fuzzySearch(query: string, items: typeof searchableContent) {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return [];
  
  const words = lowerQuery.split(/\s+/);
  
  return items
    .map(item => {
      let score = 0;
      const lowerTitle = item.title.toLowerCase();
      const lowerDesc = item.description.toLowerCase();
      const lowerKeywords = item.keywords.join(' ').toLowerCase();
      
      // Exact title match (highest priority)
      if (lowerTitle === lowerQuery) score += 100;
      // Title starts with query
      else if (lowerTitle.startsWith(lowerQuery)) score += 80;
      // Title contains query
      else if (lowerTitle.includes(lowerQuery)) score += 60;
      
      // Check each word
      words.forEach(word => {
        if (lowerTitle.includes(word)) score += 30;
        if (lowerDesc.includes(word)) score += 15;
        if (lowerKeywords.includes(word)) score += 20;
      });
      
      // Keyword exact match
      if (item.keywords.some(k => k.toLowerCase() === lowerQuery)) score += 50;
      
      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
}

interface SiteSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SiteSearch({ isOpen, onClose }: SiteSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof searchableContent>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  // Search on query change
  useEffect(() => {
    const searchResults = fuzzySearch(query, searchableContent);
    setResults(searchResults);
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateToResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  const navigateToResult = (result: typeof searchableContent[0]) => {
    setLocation(result.path);
    onClose();
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, typeof results>);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 bg-black/95 border-[#c8ff00]/30 backdrop-blur-xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#c8ff00]/20">
          <Search className="w-5 h-5 text-[#c8ff00]" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, FAQ, pages..."
            className="flex-1 border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 text-lg"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs text-white/40 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query && results.length === 0 && (
            <div className="px-4 py-12 text-center">
              <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">No results found for "{query}"</p>
              <p className="text-white/40 text-sm mt-2">Try different keywords or browse our pages</p>
            </div>
          )}

          {!query && (
            <div className="px-4 py-6">
              <p className="text-white/40 text-sm mb-4">Quick Links</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Products', path: '/products', icon: Package },
                  { label: 'FAQ', path: '/faq', icon: HelpCircle },
                  { label: 'Franchise', path: '/franchise', icon: Users },
                  { label: 'Crowdfund', path: '/crowdfund', icon: Zap },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => { setLocation(link.path); onClose(); }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 hover:bg-[#c8ff00]/10 border border-white/10 hover:border-[#c8ff00]/30 transition-all text-left"
                  >
                    <link.icon className="w-5 h-5 text-[#c8ff00]" />
                    <span className="text-white">{link.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="px-2 py-2">
              <p className="px-2 py-1 text-xs font-semibold text-[#c8ff00]/70 uppercase tracking-wider">
                {category}
              </p>
              {items.map((result, idx) => {
                const globalIndex = results.indexOf(result);
                const Icon = result.icon;
                return (
                  <button
                    key={result.id}
                    onClick={() => navigateToResult(result)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-left ${
                      globalIndex === selectedIndex
                        ? 'bg-[#c8ff00]/20 border border-[#c8ff00]/30'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      globalIndex === selectedIndex ? 'bg-[#c8ff00]/30' : 'bg-white/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${globalIndex === selectedIndex ? 'text-[#c8ff00]' : 'text-white/60'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${globalIndex === selectedIndex ? 'text-[#c8ff00]' : 'text-white'}`}>
                        {result.title}
                      </p>
                      <p className="text-sm text-white/50 truncate">{result.description}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${globalIndex === selectedIndex ? 'text-[#c8ff00]' : 'text-white/30'}`} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#c8ff00]/20 flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
              to select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded">esc</kbd>
            to close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for keyboard shortcut
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onOpen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onOpen]);
}

export default SiteSearch;
