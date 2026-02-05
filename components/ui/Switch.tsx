'use client'

import React from 'react'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
}

export function Switch({ label, description, className, ...props }: SwitchProps) {
  return (
    <label className={cn('flex items-start space-x-3 cursor-pointer', className)}>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          {...props}
        />
        <div
          className={cn(
            'w-11 h-6 rounded-ios-full transition-colors duration-200',
            props.checked ? 'bg-iosGreen' : 'bg-iosGray-4'
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-ios-full shadow-ios transition-transform duration-200',
              props.checked && 'transform translate-x-5'
            )}
          />
        </div>
      </div>
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <span className="text-ios-body font-medium text-gray-900">{label}</span>
          )}
          {description && (
            <p className="text-ios-subhead text-iosGray-1 mt-0.5">{description}</p>
          )}
        </div>
      )}
    </label>
  )
}
