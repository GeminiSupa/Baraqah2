import React from 'react'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, error, helperText, options, className, ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-ios-subhead font-medium text-gray-900 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={cn(
            'w-full px-4 py-3 rounded-ios border border-iosGray-4',
            'bg-white text-ios-body text-gray-900',
            'appearance-none pr-10',
            'focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue',
            'disabled:bg-iosGray-6 disabled:cursor-not-allowed',
            error && 'border-iosRed focus:ring-iosRed focus:border-iosRed',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-5 h-5 text-iosGray-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-ios-footnote text-iosRed">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-ios-footnote text-iosGray-1">{helperText}</p>
      )}
    </div>
  )
}
