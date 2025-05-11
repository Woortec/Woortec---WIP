// src/components/Analytics.tsx
'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { pageview, GA_MEASUREMENT_ID } from '@/lib/gtag'

export default function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const params = searchParams?.toString() ?? ''
    const url = pathname + (params ? `?${params}` : '')
    console.debug('[Analytics] pageview →', url)

    if (typeof window.gtag !== 'function') {
      console.warn('[Analytics] window.gtag not defined—are your GA scripts loaded?')
      return
    }

    pageview(url)
  }, [pathname, searchParams])

  return null
}
