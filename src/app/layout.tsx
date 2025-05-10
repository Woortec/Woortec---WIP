import * as React from 'react'
import Head from 'next/head'
import dynamicImport from 'next/dynamic'
import type { Viewport } from 'next'
import { TourProvider } from '@/contexts/TourContext'
import '@/styles/global.css'

import { UserProvider } from '@/contexts/user-context'
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'

// force dynamic if you really need it:
export const dynamic = 'force-dynamic'

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

// dynamically import our client analytics component:
const Analytics = dynamicImport(() => import('@/components/Analytics'), { ssr: false })

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <Head>
        {/* Global site tag (gtag.js) */}
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
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { send_page_view: false });
            `,
          }}
        />
      </Head>
      <body>
        <TourProvider>
          <LocalizationProvider>
            <UserProvider>
              <ThemeProvider>
                {children}
                {/* mount our client‐only pageview tracker */}
                <Analytics />
              </ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
        </TourProvider>
      </body>
    </html>
  )
}
