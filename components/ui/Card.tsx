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
    default: 'bg-white shadow-xl border border-gray-100/50',
    elevated: 'bg-white shadow-2xl border border-gray-100/50',
    outlined: 'bg-white border-2 border-gray-200',
  }
  
  return (
    <div
      className={cn(
        'rounded-3xl p-6 md:p-8',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
