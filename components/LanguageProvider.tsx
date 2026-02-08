'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import LanguageDetector from 'i18next-browser-languagedetector'

type Locale = 'en' | 'de' | 'it' | 'ur' | 'ar'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
  messages: Record<string, any>
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const languageDetector = new LanguageDetector()
languageDetector.addDetector({
  name: 'localStorage',
  lookup: () => {
    if (typeof window === 'undefined') return undefined
    return localStorage.getItem('preferred-language') || undefined
  },
  cacheUserLanguage: (lng: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem('preferred-language', lng)
  },
})

const locales: Locale[] = ['en', 'de', 'it', 'ur', 'ar']
const rtlLocales: Locale[] = ['ar', 'ur']

function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  
  const detected = languageDetector.detect() as string | string[] | null
  const lang = Array.isArray(detected) ? detected[0] : detected
  
  if (lang && isValidLocale(lang)) {
    return lang
  }
  
  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0]
  if (isValidLocale(browserLang)) {
    return browserLang
  }
  
  return 'en'
}

interface LanguageProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
  initialMessages?: Record<string, any>
}

export function LanguageProvider({ 
  children, 
  initialLocale,
  initialMessages 
}: LanguageProviderProps) {
  const { data: session } = useSession()
  const [locale, setLocaleState] = useState<Locale>(initialLocale || getInitialLocale())
  const [messages, setMessages] = useState<Record<string, any>>(initialMessages || {})
  const [isLoading, setIsLoading] = useState(false)

  // Load messages when locale changes
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      try {
        let msgs
        switch (locale) {
          case 'de':
            msgs = await import('../messages/de.json')
            break
          case 'it':
            msgs = await import('../messages/it.json')
            break
          case 'ur':
            msgs = await import('../messages/ur.json')
            break
          case 'ar':
            msgs = await import('../messages/ar.json')
            break
          case 'en':
          default:
            msgs = await import('../messages/en.json')
            break
        }
        setMessages(msgs.default)
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error)
        // Fallback to English
        if (locale !== 'en') {
          try {
            const enMsgs = await import('../messages/en.json')
            setMessages(enMsgs.default)
          } catch (e) {
            console.error('Failed to load English fallback:', e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadMessages()
  }, [locale])
  
  // Load initial messages if provided
  useEffect(() => {
    if (initialMessages && Object.keys(initialMessages).length > 0) {
      setMessages(initialMessages)
      setIsLoading(false)
    }
  }, [initialMessages])

  // Sync with user account
  useEffect(() => {
    if (session?.user?.id && locale) {
      // Update user's preferred language in database
      fetch('/api/user/language', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: locale }),
      }).catch((error) => {
        console.error('Failed to update user language preference:', error)
      })
    }
  }, [session?.user?.id, locale])

  // Load user's preferred language from session or account on mount
  useEffect(() => {
    if (session?.user?.preferredLanguage && isValidLocale(session.user.preferredLanguage)) {
      setLocaleState(session.user.preferredLanguage)
      languageDetector.cacheUserLanguage(session.user.preferredLanguage)
    } else if (session?.user?.id) {
      fetch('/api/user/language')
        .then(res => res.json())
        .then(data => {
          if (data.language && isValidLocale(data.language)) {
            setLocaleState(data.language)
            languageDetector.cacheUserLanguage(data.language)
          }
        })
        .catch(() => {
          // User language not set, use detected/default
        })
    }
  }, [session?.user?.id, session?.user?.preferredLanguage])

  const setLocale = useCallback((newLocale: Locale) => {
    if (!isValidLocale(newLocale)) return
    
    setLocaleState(newLocale)
    languageDetector.cacheUserLanguage(newLocale)
    
    // Update document direction for RTL
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', rtlLocales.includes(newLocale) ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', newLocale)
    }
  }, [])

  // Update document direction when locale changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isRTL = rtlLocales.includes(locale)
      document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
      document.documentElement.setAttribute('lang', locale)
    }
  }, [locale])

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        // Fallback to key if translation not found
        return key
      }
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Replace parameters
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }
    
    return value
  }, [messages])

  const isRTL = rtlLocales.includes(locale)

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isRTL, messages }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
