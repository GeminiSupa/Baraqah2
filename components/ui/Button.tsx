import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    className,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'ios-press touch-target font-ios-headline rounded-ios transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iosBlue focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-iosBlue text-white hover:bg-iosBlue-dark focus-visible:ring-iosBlue',
      secondary: 'bg-iosGray-5 text-gray-900 hover:bg-iosGray-4 focus-visible:ring-iosGray-3',
      danger: 'bg-iosRed text-white hover:bg-iosRed-dark focus-visible:ring-iosRed',
      ghost: 'bg-transparent text-iosBlue hover:bg-iosGray-6 focus-visible:ring-iosBlue',
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-ios-subhead',
      md: 'px-6 py-3 text-ios-body',
      lg: 'px-8 py-4 text-ios-title3',
    }
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-live={loading ? 'polite' : undefined}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <span className="sr-only">Loading...</span>
            <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children}
          </>
        ) : children}
      </button>
    )
  }
)

Button.displayName = 'Button'
