import React from 'react'
import { cn } from '@/lib/utils'

interface PageLayoutProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  variant?: 'default' | 'plain'
}

export function PageLayout({
  children,
  className,
  containerClassName,
  variant = 'default',
}: PageLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen safe-top safe-bottom relative',
        variant === 'default' && 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
        variant === 'plain' && 'bg-white',
        'py-6 md:py-10 px-4 sm:px-6',
        className
      )}
    >
      <div className={cn('max-w-6xl mx-auto', containerClassName)}>{children}</div>
    </div>
  )
}

