'use client'

import { useEffect } from 'react'
import { capturePosthog } from '@/components/analytics'

export function WebVitals() {
  useEffect(() => {
    if ('PerformanceObserver' in window) {
      try {
        const po = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const name = (entry as any).name || entry.entryType
            const value = (entry as any).value || (entry as any).startTime || 0
            if (name === 'largest-contentful-paint') {
              capturePosthog('web_vitals', { metric: 'LCP', value })
            } else if (name === 'first-input') {
              capturePosthog('web_vitals', { metric: 'FID', value })
            } else if (name === 'layout-shift' && !(entry as any).hadRecentInput) {
              capturePosthog('web_vitals', { metric: 'CLS', value: (entry as any).value })
            }
          }
        })
        po.observe({ type: 'largest-contentful-paint', buffered: true as any })
        po.observe({ type: 'first-input', buffered: true as any })
        po.observe({ type: 'layout-shift', buffered: true as any })
        return () => po.disconnect()
      } catch {}
    }
  }, [])
  return null
}

