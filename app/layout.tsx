import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { DisclaimerBanner } from '@/components/disclaimer-banner'
import { Header } from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>
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