import { useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';

interface UseHashNavigationOptions {
  offset?: number; // Offset from top for fixed headers
  behavior?: ScrollBehavior;
}

/**
 * Hook for URL hash navigation with smooth scrolling
 * Enables direct linking to page sections (e.g., /products#organic)
 */
export function useHashNavigation(options: UseHashNavigationOptions = {}) {
  const { offset = 100, behavior = 'smooth' } = options;
  const [location] = useLocation();

  // Scroll to element by ID
  const scrollToElement = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior,
      });
      
      // Add focus highlight animation
      element.classList.add('focus-highlight-animation');
      setTimeout(() => {
        element.classList.remove('focus-highlight-animation');
      }, 1000);
      
      return true;
    }
    return false;
  }, [offset, behavior]);

  // Handle hash navigation on page load and hash change
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the # symbol
    if (hash) {
      // Small delay to ensure DOM is ready
      const timeoutId = setTimeout(() => {
        scrollToElement(hash);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [location, scrollToElement]);

  // Listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        scrollToElement(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [scrollToElement]);

  // Navigate to a hash section
  const navigateToHash = useCallback((hash: string) => {
    // Update URL hash without full navigation
    window.history.pushState(null, '', `#${hash}`);
    scrollToElement(hash);
  }, [scrollToElement]);

  // Get shareable URL with hash
  const getShareableUrl = useCallback((hash: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#${hash}`;
  }, []);

  return {
    scrollToElement,
    navigateToHash,
    getShareableUrl,
  };
}

export default useHashNavigation;
