// Shared countdown configuration - Single source of truth for all countdown timers
// This ensures consistency across main site and all distributor replicated websites

// Fixed countdown: 95 days from now
export const COUNTDOWN_DAYS = 95;

// Calculate the target date based on 95 days from a fixed reference point
// Using a fixed date ensures all pages show the same countdown
export function getCountdownTargetDate(): Date {
  // Set to May 10, 2026 (95 days from Feb 4, 2026)
  return new Date('2026-05-10T00:00:00');
}

// Calculate time remaining from current time to target
export function getTimeRemaining(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const target = getCountdownTargetDate();
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds };
}

// Hook-friendly version that returns the same calculation
export function useCountdownValues() {
  return getTimeRemaining();
}
