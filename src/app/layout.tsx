// src/app/layout.tsx
import * as React from 'react'
import type { Viewport } from 'next'
import { TourProvider } from '@/contexts/TourContext'
import '@/styles/global.css'

import { UserProvider } from '@/contexts/user-context'
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'
import Analytics from '@/components/Analytics'     // ← import client component

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <head>
        {/* GA snippet */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </head>
      <body>
        {/* this runs on the client and fires pageviews */}
        <Analytics />

        <TourProvider>
          <LocalizationProvider>
            <UserProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
        </TourProvider>
      </body>
    </html>
  )
}
