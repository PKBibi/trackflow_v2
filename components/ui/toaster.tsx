'use client'

import { useEffect, useRef } from 'react'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const liveRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!toasts.length) return
    const latest = toasts[0]
    // Announce latest toast to screen readers
    if (liveRef.current) {
      liveRef.current.textContent = `${latest.title ?? ''} ${latest.description ?? ''}`.trim()
    }
  }, [toasts])

  return (
    <>
      {/* SR-only live region */}
      <div aria-live="polite" aria-atomic="true" role="status" className="sr-only" ref={liveRef} />
      {/* Minimal visual toasts (stacked) */}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-2" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-md shadow bg-white dark:bg-gray-800 border px-3 py-2 text-sm ${t.variant === 'destructive' ? 'border-red-300 text-red-700 dark:text-red-300' : 'border-gray-200 text-gray-800 dark:text-gray-100'}`}
            role="alert"
          >
            {t.title && <div className="font-medium">{t.title}</div>}
            {t.description && <div className="text-sm opacity-90">{t.description}</div>}
            <button
              className="mt-1 text-xs underline focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss notification"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

