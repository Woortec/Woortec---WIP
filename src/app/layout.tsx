'use client'

import * as React from 'react';
import type { Viewport } from 'next';
import { useEffect } from 'react';
import insertGTM from '../../utils/insertGTM'; // Adjust the path as needed

import '@/styles/global.css';

import { UserProvider } from '@/contexts/user-context';
import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  useEffect(() => {
    if (GTM_ID) {
      insertGTM(GTM_ID);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        {/* Add any other head elements here */}
      </head>
      <body>
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>
        <LocalizationProvider>
          <UserProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </UserProvider>
        </LocalizationProvider>
      </body>
    </html>
  );
}
