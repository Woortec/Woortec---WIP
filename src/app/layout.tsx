// src/app/layout.tsx

'use client'

import * as React from 'react'
import Head from 'next/head'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Viewport } from 'next'
import { TourProvider } from '@/contexts/TourContext'
import '@/styles/global.css'

import { UserProvider } from '@/contexts/user-context'
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'
import { pageview, GA_MEASUREMENT_ID } from '@/lib/gtag'

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  React.useEffect(() => {
    const params = searchParams?.toString() ?? ''
    const url = pathname + (params ? `?${params}` : '')
    pageview(url)
  }, [pathname, searchParams])

  return (
    <>
      <Head>
        {/* Global site tag (gtag.js) - Google Analytics */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        />
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
      </Head>

      <html lang="en">
        <body>
          <TourProvider>
            <LocalizationProvider>
              <UserProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </UserProvider>
            </LocalizationProvider>
          </TourProvider>
        </body>
      </html>
    </>
  )
}
