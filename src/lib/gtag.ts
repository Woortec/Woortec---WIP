// src/lib/gtag.ts

// 1. Tell TS about the gtag() and dataLayer globals
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// 2. Your GA measurement ID from .env.local
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID!;

// 3. Pageview helper
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    debug_mode: window.location.hostname === 'localhost'
  });
};

// 4. Custom event helper
export interface EventParams {
  [key: string]: any;
}
export const event = (action: string, params: EventParams = {}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', action, params);
};

// 5. This export ensures this file is treated as a module
export {};
