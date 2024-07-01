// pages/redirect.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function RedirectPage(): void {
  const router = useRouter();

  useEffect(() => {
    // Push the initial pageview event to GTM
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GTM-NXB5KPF3', {
        page_path: window.location.pathname,
      });
    }

    // Perform the redirect
    router.push('/dashboard');
  }, [router]);

}
