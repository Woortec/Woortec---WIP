'use client'

import * as React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import NextDynamic from 'next/dynamic'
import type { Session } from '@supabase/auth-helpers-nextjs'
import { createBrowserClient } from '@supabase/ssr'
import type { Viewport } from 'next'

import { TourProvider } from '@/contexts/TourContext'
import { UserProvider } from '@/contexts/user-context'
import { LocalizationProvider } from '@/components/core/localization-provider'
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider'
import '@/styles/global.css'

export const dynamic = 'force-dynamic'

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport

const Analytics = NextDynamic(() => import('@/components/Analytics'), { ssr: false })

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

const supabase = React.useMemo(() => 
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []
)


  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // try to refresh session if cookies are still valid
        await supabase.auth.refreshSession()
        const refreshed = await supabase.auth.getSession()
        setSession(refreshed.data.session)
      } else {
        setSession(data.session)
      }

      setLoading(false)
    }

    checkSession()
  }, [supabase])

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  useEffect(() => {
    if (!loading && !session) {
      router.push('/auth/log-in')
    }
  }, [loading, session, router])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span className="text-muted-foreground text-sm">Checking session...</span>
      </div>
    )
  }

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
                <Analytics />
              </ThemeProvider>
            </UserProvider>
          </LocalizationProvider>
        </TourProvider>
      </body>
    </html>
  )
}
