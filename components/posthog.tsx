'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function PostHogAnalytics() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!key) return
    
    // Delay PostHog loading to improve initial performance
    const timer = setTimeout(() => {
      // Lazy load posthog-js to keep it out of the main bundle
      import('posthog-js')
        .then((ph) => {
          const posthog = ph.default
          if (!(posthog as any).__loaded) {
            posthog.init(key, { 
              api_host: host, 
              capture_pageview: false,
              loaded: () => {
                // capture initial pageview only after fully loaded
                const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
                posthog.capture('$pageview', { $current_url: url })
              }
            })
          }
        })
        .catch(() => {})
    }, 2000) // Wait 2 seconds before loading analytics

    return () => clearTimeout(timer)
  }, [key, host, pathname, searchParams])

  useEffect(() => {
    if (!key) return
    if (!pathname) return
    
    // Only track page changes after initial load
    const timer = setTimeout(() => {
      import('posthog-js')
        .then((ph) => {
          const posthog = ph.default
          if ((posthog as any).__loaded) {
            posthog.capture('$pageview', { $current_url: pathname + (searchParams?.toString() ? `?${searchParams}` : '') })
          }
        })
        .catch(() => {})
    }, 100)
    
    return () => clearTimeout(timer)
  }, [key, pathname, searchParams])

  return null
}