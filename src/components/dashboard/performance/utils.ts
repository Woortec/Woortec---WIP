// Utility functions for ads performance component

/**
 * Get item from localStorage with expiry
 */
export function getItemWithExpiry(key: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const itemStr = localStorage.getItem(key);
  if (!itemStr) {
    return null;
  }
  try {
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (error) {
    console.error('Error parsing item from localStorage', error);
    return null;
  }
}

/**
 * Set item in localStorage with expiry
 */
export function setItemWithExpiry(key: string, value: string, expiry: number): void {
  if (typeof window === 'undefined') return;
  
  const now = new Date();
  const item = { value, expiry: now.getTime() + expiry };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Format numbers with currency, fallback to N/A
 */
export function formatValue(value: any, currency: string = '', fallback: string = 'N/A'): string {
  if (value === null || value === undefined || isNaN(parseFloat(value))) {
    return fallback;
  }
  return `${Math.round(parseFloat(value)).toLocaleString()} ${currency}`.trim();
}

/**
 * Format numbers without currency (for metrics like impressions, reach), fallback to N/A
 */
export function formatMetric(value: any, fallback: string = 'N/A'): string {
  if (value === null || value === undefined || isNaN(parseFloat(value))) {
    return fallback;
  }
  return Math.round(parseFloat(value)).toLocaleString();
}

/**
 * Get color based on value comparison
 */
export function getColor(value: number, threshold: number, isHigherBetter: boolean = true): string {
  if (isHigherBetter) {
    return value >= threshold ? '#E8F5E8' : '#FFEFEF';
  } else {
    return value <= threshold ? '#E8F5E8' : '#FFEFEF';
  }
}