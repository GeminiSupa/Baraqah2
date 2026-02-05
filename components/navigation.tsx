'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { MobileNavigation } from './MobileNavigation'
import { NotificationBell } from './NotificationBell'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Navigation() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserName()
    }
  }, [status, session?.user?.id])

  const fetchUserName = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          const name = `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim()
          if (name) {
            setUserName(name)
            return
          }
        }
      }
      // Fallback to email if profile doesn't exist or name is not available
      setUserName(null)
    } catch (error) {
      console.error('Error fetching user name:', error)
      setUserName(null)
    }
  }

  const displayName = userName || session?.user?.email || 'User'

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/verify')) {
    return null
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-ios border-b border-iosGray-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex items-center space-x-2 px-2 py-2">
                <div className="relative w-8 h-8 rounded-ios-lg overflow-hidden shadow-ios">
                  <Image
                    src="/logo.png"
                    alt="Baraqah logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <span className="text-ios-title2 font-bold text-iosBlue hidden sm:inline">Baraqah</span>
              </Link>
              {status === 'authenticated' && (
                <div className="ml-2 md:ml-6 flex space-x-2 md:space-x-8">
                  {session?.user?.isAdmin ? (
                    <Link
                      href="/admin"
                      className={cn(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors',
                        isActive('/admin')
                          ? 'border-iosBlue text-gray-900'
                          : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
                      )}
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/browse"
                        className={cn(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors hidden sm:inline-flex',
                          isActive('/browse')
                            ? 'border-iosBlue text-gray-900'
                            : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
                        )}
                      >
                        Browse
                      </Link>
                      <Link
                        href="/favorites"
                        className={cn(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors hidden sm:inline-flex',
                          isActive('/favorites')
                            ? 'border-iosBlue text-gray-900'
                            : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
                        )}
                      >
                        Favorites
                      </Link>
                      <Link
                        href="/profile"
                        className={cn(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors hidden sm:inline-flex',
                          isActive('/profile')
                            ? 'border-iosBlue text-gray-900'
                            : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
                        )}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/messaging"
                        className={cn(
                          'inline-flex items-center px-1 pt-1 border-b-2 text-ios-body font-medium transition-colors hidden sm:inline-flex',
                          isActive('/messaging')
                            ? 'border-iosBlue text-gray-900'
                            : 'border-transparent text-iosGray-1 hover:text-gray-700 hover:border-iosGray-3'
                        )}
                      >
                        Messages
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              {status === 'authenticated' ? (
                <>
                  <NotificationBell />
                  <span className="text-ios-subhead text-gray-900 font-medium hidden sm:inline">{displayName}</span>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-2 md:px-4 py-2 text-ios-body font-medium text-gray-700 hover:text-gray-900 ios-press rounded-ios text-xs md:text-base"
                  >
                    <span className="hidden sm:inline">Sign Out</span>
                    <span className="sm:hidden">Out</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-ios-body font-medium text-gray-700 hover:text-gray-900 ios-press rounded-ios"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-ios-body font-medium text-white bg-iosBlue rounded-ios hover:bg-iosBlue-dark ios-press"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </>
  )
}