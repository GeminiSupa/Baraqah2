import React from 'react'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

export function Badge({ variant = 'default', size = 'md', className, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-iosGray-5 text-gray-900',
    success: 'bg-iosGreen/20 text-iosGreen',
    warning: 'bg-iosOrange/20 text-iosOrange',
    danger: 'bg-iosRed/20 text-iosRed',
    info: 'bg-iosBlue/20 text-iosBlue',
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-ios-caption1',
    md: 'px-3 py-1.5 text-ios-footnote',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-ios-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
