// src/app/layout.tsx
'use client'

import * as React from 'react'
import Script from 'next/script'
// alias this import so it doesn't clash with our `export const dynamic`
import NextDynamic from 'next/dynamic'
import type { Viewport } from 'next'
import { TourProvider } from '@/contexts/TourContext'
import '@/styles/global.css'

import { UserProvider } from '@/contexts/user-context'
// keep your existing LocalizationProvider
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'

// NEW: import our LocaleProvider
import { LocaleProvider } from '@/contexts/LocaleContext'
import { useUser } from '@/hooks/use-user'
import { useLocale } from '@/contexts/LocaleContext'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'

// This tells Next.js "always render this layout client-side"
export const dynamic = 'force-dynamic'

// mobile viewport meta
export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

// now use our aliased import for the client-only Analytics component
const Analytics = NextDynamic(() => import('@/components/Analytics'), { ssr: false })

interface LayoutProps {
  children: React.ReactNode
}

function LanguageDialog() {
  const { userInfo, updateUser } = useUser()
  const { setLocale } = useLocale()
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    if (userInfo && !userInfo.language) setOpen(true)
  }, [userInfo])

  const handleLangSelect = async (lang: 'en' | 'es') => {
    setLocale(lang)
    if (userInfo?.firstName && userInfo?.lastName && userInfo?.uuid) {
      await updateUser(userInfo.firstName, userInfo.lastName, userInfo.uuid, lang)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open}>
      <DialogTitle>Select your preferred language</DialogTitle>
      <DialogActions>
        <Button onClick={() => handleLangSelect('en')}>English</Button>
        <Button onClick={() => handleLangSelect('es')}>Español</Button>
      </DialogActions>
    </Dialog>
  )
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
            <LocaleProvider>
              <UserProvider>
                <ThemeProvider>
                  {children}
                  <LanguageDialog />
                  <Analytics />
                </ThemeProvider>
              </UserProvider>
            </LocaleProvider>
          </LocalizationProvider>
        </TourProvider>
      </body>
    </html>
  )
}
