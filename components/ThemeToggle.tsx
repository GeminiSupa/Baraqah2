'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Simple manual theme toggle that does NOT depend on next-themes.
// Safe to use without installing any extra packages.
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <button
      onClick={handleToggle}
      className={cn(
        'relative w-14 h-8 bg-iosGray-5 dark:bg-iosGray-2 rounded-full transition-colors touch-target',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iosBlue focus-visible:ring-offset-2'
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          'absolute top-1 w-6 h-6 bg-white rounded-full shadow-ios transition-transform',
          theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
        )}
      >
        <span className="flex items-center justify-center h-full text-sm">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  )
}
