import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { LanguageProvider } from '@/components/LanguageProvider'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { Header } from '@/components/Header'
import { MobileNavigation } from '@/components/MobileNavigation'
import { Footer } from '@/components/Footer'

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
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <LanguageProvider>
            <DisclaimerBanner />
            <Header />
            <main className="min-h-screen flex flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              {children}
            </main>
            <MobileNavigation />
            <Footer />
          </LanguageProvider>
        </Providers>
      </body>
    </html>
  )
}