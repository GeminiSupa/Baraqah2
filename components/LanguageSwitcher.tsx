'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from './LanguageProvider'

const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it' as const, name: 'Italiano', flag: '🇮🇹' },
  { code: 'ur' as const, name: 'اردو', flag: '🇵🇰' },
  { code: 'ar' as const, name: 'العربية', flag: '🇸🇦' },
]

export function LanguageSwitcher() {
  const { locale, setLocale, isRTL } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (code: typeof locale) => {
    setLocale(code)
    setIsOpen(false)
  }

  // Render placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <button
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ios-press transition-colors text-sm sm:text-base min-h-[44px]"
          aria-label="Change language"
          disabled
        >
          <span className="text-lg">🇬🇧</span>
          <span className="hidden sm:inline font-medium text-gray-700">
            English
          </span>
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 ios-press transition-colors text-sm sm:text-base min-h-[44px]"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="hidden sm:inline font-medium text-gray-700">
          {currentLanguage.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Mobile overlay */}
          <div
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            className={`absolute ${
              isRTL ? 'left-0' : 'right-0'
            } mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden`}
          >
            <div className="py-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    locale === lang.code ? 'bg-iosBlue/5' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className={`flex-1 font-medium ${
                    locale === lang.code ? 'text-iosBlue' : 'text-gray-700'
                  }`}>
                    {lang.name}
                  </span>
                  {locale === lang.code && (
                    <svg
                      className="w-5 h-5 text-iosBlue"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
