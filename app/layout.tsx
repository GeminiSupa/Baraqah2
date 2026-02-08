import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { Header } from '@/components/Header'
import { MobileNavigation } from '@/components/MobileNavigation'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Baraqah - Muslim Matrimony',
  description: 'A respectful matrimony platform for the Muslim community, emphasizing privacy, authenticity, and family-oriented matchmaking.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <DisclaimerBanner />
          <Header />
          <main className="min-h-screen flex flex-col pb-16 md:pb-0">{children}</main>
          <MobileNavigation />
          <footer className="border-t border-gray-100 bg-white/80 backdrop-blur-ios py-4 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
              <p className="text-center sm:text-left">
                © {new Date().getFullYear()} Baraqah. A respectful Muslim matrimony service.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy-policy" className="hover:text-gray-800 underline-offset-2 hover:underline">
                  Privacy Policy
                </Link>
                <Link href="/legal/terms" className="hover:text-gray-800 underline-offset-2 hover:underline">
                  Terms of Use
                </Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}