'use client'

import React, { useEffect } from 'react'
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
  
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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
