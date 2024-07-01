// src/app/layout.tsx or src/pages/_app.tsx

'use client';
import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import ReactGA from 'react-ga4';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ReactGA.send({ hitType: 'pageview', page: url });
    };

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_TRACKING_ID);
      router.events.on('routeChangeComplete', handleRouteChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };
  }, [router.events]);

  return (
    <>
      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
