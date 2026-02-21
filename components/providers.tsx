'use client'

import { SessionProvider } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/Toast'
import { ConfirmProvider } from '@/components/ui/Confirm'

/**
 * Global providers for the app.
 *
 * NOTE: Dark mode via `next-themes` is NOT enabled by default so that
 * the project runs without extra dependencies.
 *
 * If you want full theme support later:
 *  1. npm install next-themes
 *  2. Replace the SessionProvider-only wrapper below with a ThemeProvider + SessionProvider combo.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes instead of on every request
      refetchOnWindowFocus={false} // Don't refetch on window focus to reduce API calls
    >
      <ToastProvider>
        <ConfirmProvider>{children}</ConfirmProvider>
      </ToastProvider>
    </SessionProvider>
  )
}