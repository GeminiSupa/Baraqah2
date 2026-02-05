import React from 'react'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  children: React.ReactNode
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white shadow-ios',
    elevated: 'bg-white shadow-ios-lg',
    outlined: 'bg-white border border-iosGray-4',
  }
  
  return (
    <div
      className={cn(
        'rounded-ios-lg p-6',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
