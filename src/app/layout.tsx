// src/app/layout.tsx
'use client'

import * as React from 'react'
import Script from 'next/script'
// alias this import so it doesn’t clash with our `export const dynamic`
import NextDynamic from 'next/dynamic'
import type { Viewport } from 'next'
import { TourProvider } from '@/contexts/TourContext'
import '@/styles/global.css'

import { UserProvider } from '@/contexts/user-context'
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'

// This tells Next.js “always render this layout client-side”
export const dynamic = 'force-dynamic'

// mobile viewport meta
export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

// now use our aliased import for the client-only Analytics component
const Analytics = NextDynamic(() => import('@/components/Analytics'), { ssr: false })

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      {/* GA library */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID!}`}
        strategy="afterInteractive"
      />

      {/* bootstrap dataLayer & initial config */}
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID!}', { send_page_view: false });
        `}
      </Script>

      <body>
        <TourProvider>
          <LocalizationProvider>
            <UserProvider>
              <ThemeProvider>
                {children}
                {/* only runs on client, after gtag is ready */}
                <Analytics />
              </ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
        </TourProvider>
      </body>
    </html>
  )
}