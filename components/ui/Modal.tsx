'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useSafeArea } from '@/hooks/useSafeArea'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  variant?: 'center' | 'bottom-sheet'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = 'center',
  size = 'md',
}: ModalProps) {
  const { bottom } = useSafeArea()
  useBodyScrollLock(isOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  const focusableSelector = useMemo(
    () =>
      [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    []
  )
  
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement as HTMLElement | null

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }

      const handleTabTrap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        const root = contentRef.current
        if (!root) return
        const focusables = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
          .filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1)

        if (focusables.length === 0) {
          e.preventDefault()
          root.focus()
          return
        }

        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        const active = document.activeElement as HTMLElement | null

        if (e.shiftKey) {
          if (!active || active === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (active === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('keydown', handleTabTrap)

      // Focus the first focusable element, else focus the dialog container
      window.setTimeout(() => {
        const root = contentRef.current
        if (!root) return
        const focusables = root.querySelectorAll<HTMLElement>(focusableSelector)
        if (focusables.length > 0) {
          focusables[0].focus()
        } else {
          root.focus()
        }
      }, 0)

      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('keydown', handleTabTrap)
      }
    }
  }, [isOpen, onClose, focusableSelector])

  useEffect(() => {
    if (!isOpen) {
      previouslyFocusedRef.current?.focus?.()
      previouslyFocusedRef.current = null
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        className={cn(
          'bg-white rounded-ios-xl shadow-ios-xl',
          variant === 'bottom-sheet' 
            ? cn(
                'w-full max-w-full rounded-t-ios-xl rounded-b-none',
                'mt-auto mb-0 animate-ios-slide-up',
                `pb-[calc(1rem+${bottom}px)]` // Safe area
              )
            : cn(
                sizes[size],
                'animate-ios-spring',
                'max-h-[85vh] overflow-y-auto'
              )
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="px-6 py-4 border-b border-iosGray-5">
            <h2 id="modal-title" className="text-ios-title2 font-semibold text-gray-900">
              {title}
            </h2>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  if (typeof window !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return null
}
