import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'de', 'it', 'ur', 'ar'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

// RTL languages
export const rtlLocales: Locale[] = ['ar', 'ur']

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as Locale)
}

export default getRequestConfig(async ({ locale }) => {
  if (!isValidLocale(locale)) notFound()

  return {
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
