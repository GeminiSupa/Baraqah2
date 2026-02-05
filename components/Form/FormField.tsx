'use client'

import { useFormContext, Controller } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  className?: string
  as?: 'input' | 'textarea' | 'select'
  options?: { value: string; label: string }[]
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  required,
  className,
  as = 'input',
  options
}: FormFieldProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext()
  
  const error = errors[name]
  const hasError = !!error
  
  return (
    <div className="form-group">
      <label 
        htmlFor={name} 
        className="block text-ios-subhead font-medium text-gray-900 mb-2"
      >
        {label}
        {required && <span className="text-iosRed ml-1">*</span>}
      </label>
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          if (as === 'textarea') {
            return (
              <textarea
                {...field}
                id={name}
                placeholder={placeholder}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
                className={cn(
                  'w-full px-4 py-3 rounded-ios-lg border',
                  'text-ios-body text-gray-900',
                  'focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-transparent',
                  hasError 
                    ? 'border-iosRed focus:ring-iosRed' 
                    : 'border-iosGray-4',
                  className
                )}
                rows={4}
              />
            )
          }
          
          if (as === 'select') {
            return (
              <select
                {...field}
                id={name}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${name}-error` : undefined}
                className={cn(
                  'w-full px-4 py-3 rounded-ios-lg border',
                  'text-ios-body text-gray-900 bg-white',
                  'focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-transparent',
                  hasError 
                    ? 'border-iosRed focus:ring-iosRed' 
                    : 'border-iosGray-4',
                  className
                )}
              >
                <option value="">Select {label}</option>
                {options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )
          }
          
          return (
            <input
              {...field}
              id={name}
              type={type}
              placeholder={placeholder}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${name}-error` : undefined}
              className={cn(
                'w-full px-4 py-3 rounded-ios-lg border',
                'text-ios-body text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-transparent',
                hasError 
                  ? 'border-iosRed focus:ring-iosRed' 
                  : 'border-iosGray-4',
                className
              )}
            />
          )
        }}
      />
      
      {hasError && (
        <p 
          id={`${name}-error`} 
          className="mt-1 text-ios-footnote text-iosRed flex items-center gap-1"
          role="alert"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error.message as string}
        </p>
      )}
    </div>
  )
}
