/**
 * Date/Timestamp Helper Utilities for Drizzle ORM
 * 
 * Drizzle's `timestamp({ mode: 'string' })` returns MySqlTimestampString,
 * which is incompatible with comparison operators (gt, lt, gte, lte) that expect Date.
 * 
 * These helpers provide type-safe conversions between Date and ISO string formats.
 */

/**
 * Convert Date object or string to database timestamp format (ISO string)
 * @param date - Date object, ISO string, or null/undefined
 * @returns ISO string or null
 */
export const toDbTimestamp = (
  date: Date | string | null | undefined
): string | null => {
  if (!date) return null;
  if (typeof date === 'string') return date;
  return date.toISOString();
};

/**
 * Convert database timestamp (ISO string) to Date object
 * @param timestamp - ISO string from database or null
 * @returns Date object or null
 */
export const fromDbTimestamp = (timestamp: string | null): Date | null => {
  return timestamp ? new Date(timestamp) : null;
};

/**
 * Get current timestamp as ISO string for database insertion
 * @returns Current timestamp as ISO string
 */
export const nowAsDbTimestamp = (): string => new Date().toISOString();

/**
 * Add days to a timestamp and return as ISO string
 * @param timestamp - Starting timestamp (Date or ISO string)
 * @param days - Number of days to add
 * @returns New timestamp as ISO string
 */
export const addDaysToTimestamp = (
  timestamp: Date | string,
  days: number
): string => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

/**
 * Check if a timestamp is in the past
 * @param timestamp - Timestamp to check (Date or ISO string)
 * @returns true if timestamp is before now
 */
export const isTimestampPast = (timestamp: Date | string): boolean => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.getTime() < Date.now();
};

/**
 * Check if a timestamp is in the future
 * @param timestamp - Timestamp to check (Date or ISO string)
 * @returns true if timestamp is after now
 */
export const isTimestampFuture = (timestamp: Date | string): boolean => {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  return date.getTime() > Date.now();
};
