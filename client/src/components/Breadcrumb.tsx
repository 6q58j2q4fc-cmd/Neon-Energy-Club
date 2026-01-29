import { Link, useLocation } from 'wouter';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  variant?: 'default' | 'vice' | 'dark';
}

/**
 * Breadcrumb navigation component
 * Helps users understand their location and navigate back easily
 */
export function Breadcrumb({ 
  items, 
  className = '', 
  showHome = true,
  variant = 'default' 
}: BreadcrumbProps) {
  const [location] = useLocation();

  // Style variants
  const variantStyles = {
    default: {
      container: 'bg-black/30 backdrop-blur-sm border border-white/10',
      text: 'text-white/60 hover:text-white',
      active: 'text-[#c8ff00]',
      separator: 'text-white/30',
      home: 'text-[#c8ff00]',
    },
    vice: {
      container: 'bg-[#0d2818]/50 backdrop-blur-sm border border-[#c8ff00]/20',
      text: 'text-white/60 hover:text-[#c8ff00]',
      active: 'text-[#c8ff00]',
      separator: 'text-[#c8ff00]/30',
      home: 'text-[#c8ff00]',
    },
    dark: {
      container: 'bg-black/50 backdrop-blur-sm border border-white/10',
      text: 'text-white/60 hover:text-white',
      active: 'text-white',
      separator: 'text-white/20',
      home: 'text-white',
    },
  };

  const styles = variantStyles[variant];

  // Build full breadcrumb list with home
  const allItems: BreadcrumbItem[] = showHome 
    ? [{ label: 'Home', href: '/', icon: <Home className="w-4 h-4" /> }, ...items]
    : items;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`inline-flex items-center px-4 py-2 rounded-full ${styles.container} ${className}`}
    >
      <ol className="flex items-center gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isHome = index === 0 && showHome;
          
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className={`w-4 h-4 ${styles.separator}`} />
              )}
              
              {item.href && !isLast ? (
                <Link 
                  href={item.href}
                  className={`flex items-center gap-1.5 transition-colors ${isHome ? styles.home : styles.text}`}
                >
                  {item.icon}
                  <span className={isHome ? 'sr-only sm:not-sr-only' : ''}>{item.label}</span>
                </Link>
              ) : (
                <span 
                  className={`flex items-center gap-1.5 ${isLast ? styles.active : styles.text} font-medium`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Pre-defined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  products: [
    { label: 'Products' }
  ],
  productsOriginal: [
    { label: 'Products', href: '/products' },
    { label: 'NEON Original' }
  ],
  productsOrganic: [
    { label: 'Products', href: '/products' },
    { label: 'NEON Organic' }
  ],
  franchise: [
    { label: 'Franchise' }
  ],
  franchiseApply: [
    { label: 'Franchise', href: '/franchise' },
    { label: 'Apply' }
  ],
  vending: [
    { label: 'Vending' }
  ],
  vendingApply: [
    { label: 'Vending', href: '/vending' },
    { label: 'Apply' }
  ],
  about: [
    { label: 'Our Story' }
  ],
  faq: [
    { label: 'FAQ' }
  ],
  blog: [
    { label: 'Blog' }
  ],
  blogPost: (title: string) => [
    { label: 'Blog', href: '/blog' },
    { label: title }
  ],
  crowdfund: [
    { label: 'Crowdfund' }
  ],
  shop: [
    { label: 'Shop' }
  ],
  checkout: [
    { label: 'Shop', href: '/shop' },
    { label: 'Checkout' }
  ],
  celebrities: [
    { label: 'Celebrity Fans' }
  ],
  nftGallery: [
    { label: 'NFT Gallery' }
  ],
  investors: [
    { label: 'Investors' }
  ],
  leaderboard: [
    { label: 'Leaderboard' }
  ],
  join: [
    { label: 'Join Now' }
  ],
  profile: [
    { label: 'Profile' }
  ],
  orders: [
    { label: 'My Orders' }
  ],
  portal: [
    { label: 'Portal' }
  ],
  distributorPortal: [
    { label: 'Distributor Portal' }
  ],
  customerPortal: [
    { label: 'Customer Portal' }
  ],
  franchisePortal: [
    { label: 'Franchise Portal' }
  ],
  policies: [
    { label: 'Policies' }
  ],
  privacy: [
    { label: 'Privacy Policy' }
  ],
  terms: [
    { label: 'Terms & Conditions' }
  ],
};

export default Breadcrumb;
