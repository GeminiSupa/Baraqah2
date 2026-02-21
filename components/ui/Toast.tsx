'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  description?: string
  variant?: ToastVariant
  durationMs?: number
}

interface ToastItem extends Required<Pick<ToastOptions, 'title'>> {
  id: string
  description?: string
  variant: ToastVariant
  durationMs: number
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function variantStyles(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return 'border-iosGreen/25 bg-iosGreen/10 text-gray-900'
    case 'error':
      return 'border-iosRed/25 bg-iosRed/10 text-gray-900'
    case 'warning':
      return 'border-yellow-500/25 bg-yellow-500/10 text-gray-900'
    case 'info':
    default:
      return 'border-iosBlue/25 bg-iosBlue/10 text-gray-900'
  }
}

function variantIcon(variant: ToastVariant) {
  switch (variant) {
    case 'success':
      return '✓'
    case 'error':
      return '!'
    case 'warning':
      return '!'
    case 'info':
    default:
      return 'i'
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const item: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'info',
        durationMs: options.durationMs ?? 3500,
      }

      setItems((prev) => [item, ...prev].slice(0, 5))

      window.setTimeout(() => {
        dismiss(id)
      }, item.durationMs)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Toast viewport */}
      <div
        className={cn(
          'fixed z-[60] flex flex-col gap-2',
          'top-3 right-3 sm:top-4 sm:right-4',
          'safe-top'
        )}
        role="status"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              'w-[min(420px,calc(100vw-1.5rem))]',
              'rounded-ios-lg border shadow-ios-lg backdrop-blur-ios',
              'px-4 py-3',
              variantStyles(t.variant)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-7 w-7 rounded-full bg-white/70 border border-black/5 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-gray-900" aria-hidden="true">
                  {variantIcon(t.variant)}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 break-words">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-iosGray-1 break-words">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="p-2 -m-2 rounded-ios ios-press text-iosGray-1 hover:text-gray-900 touch-target"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

