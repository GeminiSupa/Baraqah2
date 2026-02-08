'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { NotificationBell } from './NotificationBell'
import { NavList } from './Navigation/NavList'
import { LanguageSwitcher } from './LanguageSwitcher'

function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function Header() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userName, setUserName] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isActive = (path: string) => pathname === path

  // Fetch user profile data including photo
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetch('/api/profile')
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`)
          }
          return res.json()
        })
        .then(data => {
          if (data.profile) {
            const name = `${data.profile.firstName || ''} ${data.profile.lastName || ''}`.trim()
            if (name) setUserName(name)
            
            // Get primary photo or first photo
            if (data.profile.photos && Array.isArray(data.profile.photos) && data.profile.photos.length > 0) {
              // Find primary photo first, then fall back to first photo
              const primaryPhoto = data.profile.photos.find((p: any) => p.isPrimary === true) 
                || data.profile.photos.find((p: any) => p.isPrimary === 1)
                || data.profile.photos[0]
              
              if (primaryPhoto?.url) {
                // Ensure URL is valid and set it
                const photoUrl = String(primaryPhoto.url).trim()
                if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('/'))) {
                  setProfilePhoto(photoUrl)
                } else {
                  console.warn('Invalid photo URL format:', photoUrl)
                  setProfilePhoto(null)
                }
              } else {
                console.warn('Photo found but no URL:', primaryPhoto)
                setProfilePhoto(null)
              }
            } else {
              // No photos found
              setProfilePhoto(null)
            }
          } else {
            setProfilePhoto(null)
          }
        })
        .catch((error) => {
          console.error('Error fetching profile for header:', error)
          setProfilePhoto(null)
        })
    } else {
      setProfilePhoto(null)
      setUserName(null)
    }
  }, [status, session?.user?.id])

  // Listen for custom events to refresh photo when it changes
  useEffect(() => {
    const handleCustomEvent = () => {
      if (status === 'authenticated' && session?.user?.id) {
        fetch('/api/profile')
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
          })
          .then(data => {
            if (data.profile) {
              // Get primary photo or first photo
              if (data.profile.photos && Array.isArray(data.profile.photos) && data.profile.photos.length > 0) {
                const primaryPhoto = data.profile.photos.find((p: any) => p.isPrimary === true) 
                  || data.profile.photos.find((p: any) => p.isPrimary === 1)
                  || data.profile.photos[0]
                
                if (primaryPhoto?.url) {
                  const photoUrl = String(primaryPhoto.url).trim()
                  if (photoUrl && (photoUrl.startsWith('http') || photoUrl.startsWith('/'))) {
                    setProfilePhoto(photoUrl)
                  } else {
                    setProfilePhoto(null)
                  }
                } else {
                  setProfilePhoto(null)
                }
              } else {
                setProfilePhoto(null)
              }
            }
          })
          .catch((error) => {
            console.error('Error refreshing profile photo:', error)
            setProfilePhoto(null)
          })
      }
    }

    window.addEventListener('profile-photo-updated', handleCustomEvent)

    return () => {
      window.removeEventListener('profile-photo-updated', handleCustomEvent)
    }
  }, [status, session?.user?.id])

  const displayName = userName || session?.user?.email || 'User'
  const userInitial = displayName.charAt(0).toUpperCase()

  // Don't show header on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/verify')) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 safe-top pt-3 sm:pt-4 pb-3 sm:pb-4 glass-header shadow-ios">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-2 sm:gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 ios-press">
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-ios-lg overflow-hidden shadow-ios flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="Baraqah logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="36px"
                />
              </div>
              <span className="text-base sm:text-ios-title2 font-bold text-iosBlue hidden sm:inline">Baraqah</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {status === 'authenticated' && (
            <NavList variant="horizontal" className="hidden md:flex" />
          )}

          {/* Right Side - User Menu & Notifications */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <LanguageSwitcher />
            {status === 'authenticated' && (
              <>
                <NotificationBell />
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-1.5 sm:px-2 py-1.5 sm:py-2 hover:bg-iosGray-6 active:bg-iosGray-5 rounded-ios ios-press transition-colors touch-target"
                    aria-label="User menu"
                  >
                    <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-9 md:h-9 rounded-full overflow-hidden border-2 sm:border-[2.5px] border-gray-300 flex-shrink-0 bg-iosBlue shadow-sm">
                      {profilePhoto ? (
                        <img
                          src={profilePhoto}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={(e) => {
                            // If image fails to load, fall back to initial
                            console.warn('Failed to load profile photo:', profilePhoto)
                            setProfilePhoto(null)
                            // Hide the broken image
                            const target = e.target as HTMLImageElement
                            if (target) {
                              target.style.display = 'none'
                            }
                          }}
                          onLoad={(e) => {
                            // Image loaded successfully - ensure it's visible
                            const target = e.target as HTMLImageElement
                            if (target) {
                              target.style.display = 'block'
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-iosBlue flex items-center justify-center">
                          <span className="text-white text-sm sm:text-base font-semibold">
                            {userInitial}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="hidden lg:inline text-ios-body font-medium text-gray-900 max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <svg className="w-4 h-4 text-iosGray-1 hidden lg:block flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <Link
                          href="/settings/password"
                          className="block px-4 py-2 text-ios-body text-gray-900 hover:bg-iosGray-6"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Change Password
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
