/**
 * Performance optimization utilities
 */

/**
 * Debounce function to limit rapid function calls
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Request idle callback polyfill
 */
export const requestIdleCallback =
  typeof window !== "undefined" && "requestIdleCallback" in window
    ? window.requestIdleCallback
    : (cb: IdleRequestCallback) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 1);

/**
 * Cancel idle callback polyfill
 */
export const cancelIdleCallback =
  typeof window !== "undefined" && "cancelIdleCallback" in window
    ? window.cancelIdleCallback
    : (id: number) => clearTimeout(id);

/**
 * Defer non-critical work to idle time
 */
export function deferToIdle(callback: () => void, timeout = 2000): ReturnType<typeof requestIdleCallback> {
  return requestIdleCallback(callback, { timeout });
}

/**
 * Preconnect to external domains for faster resource loading
 */
export function preconnect(url: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "preconnect";
  link.href = url;
  link.crossOrigin = "anonymous";
  document.head.appendChild(link);
}

/**
 * Prefetch a resource for later use
 */
export function prefetch(url: string): void {
  if (typeof document === "undefined") return;
  
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;
  document.head.appendChild(link);
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if the device is low-end (based on hardware concurrency and memory)
 */
export function isLowEndDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  
  const cores = navigator.hardwareConcurrency || 4;
  // @ts-expect-error - deviceMemory is not in all browsers
  const memory = navigator.deviceMemory || 4;
  
  return cores <= 2 || memory <= 2;
}

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string): () => void {
  const start = performance.now();
  
  return () => {
    const end = performance.now();
    const duration = end - start;
    
    if (duration > 16) {
      console.warn(`[Performance] ${componentName} took ${duration.toFixed(2)}ms to render`);
    }
  };
}

/**
 * Create a memoized selector for expensive computations
 */
export function createSelector<T, R>(
  selector: (state: T) => R,
  equalityFn: (a: R, b: R) => boolean = Object.is
): (state: T) => R {
  let lastState: T | undefined;
  let lastResult: R | undefined;
  
  return (state: T) => {
    if (lastState !== undefined && lastResult !== undefined) {
      const newResult = selector(state);
      if (equalityFn(lastResult, newResult)) {
        return lastResult;
      }
      lastResult = newResult;
    } else {
      lastResult = selector(state);
    }
    lastState = state;
    return lastResult;
  };
}
