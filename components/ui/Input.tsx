import React from 'react'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-ios-subhead font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 rounded-ios border border-iosGray-4',
          'bg-white text-ios-body text-gray-900',
          'placeholder:text-iosGray-2',
          'focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue',
          'disabled:bg-iosGray-6 disabled:cursor-not-allowed',
          error && 'border-iosRed focus:ring-iosRed focus:border-iosRed',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-ios-footnote text-iosRed">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-ios-footnote text-iosGray-1">{helperText}</p>
      )}
    </div>
  )
}
