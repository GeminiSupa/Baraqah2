import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  children: React.ReactNode
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white shadow-ios-lg border border-gray-100/50',
    elevated: 'bg-white shadow-ios-xl border border-gray-100/50',
    outlined: 'bg-white border-2 border-gray-200',
  }
  
  return (
    <div
      className={cn(
        'rounded-ios-xl p-6 md:p-8',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
