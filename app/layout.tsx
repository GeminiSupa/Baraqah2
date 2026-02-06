import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { Header } from '@/components/Header'

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
          <main className="min-h-screen flex flex-col pb-16 md:pb-0">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}