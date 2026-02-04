import { useState, useEffect } from "react";

// Centralized launch date - 95 days from Feb 4, 2026 = May 10, 2026 at midnight EST
// This is the single source of truth for ALL countdown timers across the site
export const LAUNCH_DATE = new Date("2026-05-10T00:00:00-05:00");

export interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDate: Date = LAUNCH_DATE): CountdownTime {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(targetDate: Date): CountdownTime {
  const now = new Date();
  const difference = targetDate.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
    };
  }

  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
  };
}

// Format countdown for display
export function formatCountdown(time: CountdownTime): string {
  if (time.isExpired) {
    return "LAUNCHED!";
  }
  return `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
}

export default useCountdown;
