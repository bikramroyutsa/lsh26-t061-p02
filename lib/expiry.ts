/**
 * Parses a 'YYYY-MM-DD' string as a local Date object (local midnight).
 * This avoids UTC timezone offsets that can shift dates.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

let mockToday: Date | null = null;

/**
 * Overrides today's date for testing purposes. Pass null to reset.
 */
export function setMockToday(dateStr: string | null) {
  if (dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    mockToday = new Date(year, month - 1, day);
  } else {
    mockToday = null;
  }
}

/**
 * Returns a Date object representing today's local midnight.
 */
export function getTodayLocal(): Date {
  if (mockToday) {
    return new Date(mockToday.getTime());
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Calculates the number of full calendar days remaining between today and the expiry date.
 * If the expiry date is in the past, it returns a negative number.
 */
export function getDaysRemaining(expiryDateStr: string): number {
  if (!expiryDateStr) return 0;
  const expiry = parseLocalDate(expiryDateStr);
  const today = getTodayLocal();
  const diffTime = expiry.getTime() - today.getTime();
  // Using Math.round to safeguard against daylight saving shifts (e.g. 23 or 25 hours difference)
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Date object or YYYY-MM-DD string to a readable format: 'DD MMM YYYY' (e.g., '30 Aug 2026')
 */
export function formatLocalDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseLocalDate(dateStr);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
