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
    pageview(url)
  }, [pathname, searchParams])

  return null
}
