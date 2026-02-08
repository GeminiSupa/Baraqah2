'use client'

import Link from 'next/link'
import { useTranslation } from './LanguageProvider'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-ios py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} Baraqah. {t('home.respectfulService')}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/privacy-policy" className="hover:text-gray-800 underline-offset-2 hover:underline">
            {t('legal.privacyPolicy')}
          </Link>
          <Link href="/legal/terms" className="hover:text-gray-800 underline-offset-2 hover:underline">
            {t('legal.termsOfUse')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
