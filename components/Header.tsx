'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { NotificationBell } from './NotificationBell'
import { NavList } from './Navigation/NavList'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isActive = (path: string) => pathname === path

  // Fetch user name
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            const name = `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim()
            if (name) setUserName(name)
          }
        })
        .catch(() => {})
    }
  }, [status, session?.user?.id])

  const displayName = userName || session?.user?.email || 'User'

  // Don't show header on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/verify')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 safe-top pt-4 glass-header shadow-ios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center">
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
          </div>

          {/* Desktop Navigation */}
          {status === 'authenticated' && (
            <NavList variant="horizontal" className="hidden md:flex" />
          )}

          {/* Right Side - User Menu & Notifications */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {status === 'authenticated' && (
              <>
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-2 py-2 hover:bg-iosGray-6 rounded-ios ios-press"
                  >
                    <div className="w-8 h-8 bg-iosBlue rounded-ios-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden lg:inline text-ios-body font-medium text-gray-900 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <svg className="w-4 h-4 text-iosGray-1 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-ios-xl shadow-ios-xl border border-iosGray-4 py-2 z-50">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-ios-body text-gray-900 hover:bg-iosGray-6"
                          onClick={() => setShowUserMenu(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          href="/settings/privacy"
                          className="block px-4 py-2 text-ios-body text-gray-900 hover:bg-iosGray-6"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Privacy Settings
                        </Link>
                        <hr className="my-2 border-iosGray-4" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            signOut({ callbackUrl: '/login' })
                          }}
                          className="block w-full text-left px-4 py-2 text-ios-body text-iosRed hover:bg-iosGray-6"
                        >
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}

            {status === 'unauthenticated' && (
              <div className="flex items-center space-x-2 md:space-x-3">
                <Link
                  href="/login"
                  className="px-3 md:px-4 py-2 text-ios-body font-medium text-iosGray-1 hover:text-gray-900 ios-press"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 md:px-6 py-2 bg-iosBlue text-white rounded-ios-lg hover:bg-iosBlue-dark text-ios-body font-semibold ios-press shadow-ios"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
