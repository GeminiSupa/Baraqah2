'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const DISMISS_KEY = 'baraqah_disclaimer_dismissed'

export function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem(DISMISS_KEY)
    if (stored === 'true') {
      setDismissed(true)
    } else {
      setDismissed(false)
    }
  }, [])

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(DISMISS_KEY, 'true')
      }
    } catch {
      // ignore storage errors
    }
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <span className="text-lg sm:text-xl text-yellow-800 mt-0.5">⚠️</span>
          <p className="text-xs sm:text-sm text-yellow-800 leading-snug">
            <strong>Important:</strong> Sharing personal contact information is not allowed.
            <Link href="/disclaimer" className="underline ml-1 hover:text-yellow-900">
              Read our disclaimer
            </Link>
            . We are not responsible for offline interactions.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-2 flex-shrink-0 rounded-full border border-yellow-300 text-yellow-800 hover:text-yellow-900 hover:bg-yellow-100 px-2.5 py-1 text-sm leading-none"
          aria-label="Dismiss disclaimer"
        >
          ×
        </button>
      </div>
    </div>
  )
}