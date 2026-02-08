'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Notification {
  id: string
  type: 'message' | 'request' | 'questionnaire'
  title: string
  message: string
  link: string
  createdAt: string
}

export function NotificationBell() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchNotifications()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [status, session?.user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/notifications')
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = (link: string) => {
    setIsOpen(false)
    router.push(link)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'request':
        return '👤'
      case 'questionnaire':
        return '📝'
      default:
        return '🔔'
    }
  }

  if (status !== 'authenticated' || session?.user?.isAdmin) {
    return null // Don't show for admins or unauthenticated users
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 ios-press rounded-ios text-iosGray-1 hover:text-gray-900 transition-colors touch-target"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-iosRed text-white text-xs font-semibold flex items-center justify-center transform translate-x-1 -translate-y-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Mobile Full Screen Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification Panel */}
          <div className="fixed md:absolute right-0 top-0 md:top-auto md:mt-2 w-full md:w-80 lg:w-96 h-screen md:h-auto md:max-h-[calc(100vh-8rem)] bg-white rounded-none md:rounded-ios-lg shadow-ios-lg border-0 md:border border-iosGray-4 z-50 overflow-hidden flex flex-col safe-top safe-bottom">
            {/* Header with Close Button */}
            <div className="p-4 border-b border-iosGray-4 flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg md:text-ios-title3 font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="text-xs md:text-ios-footnote text-iosGray-1">
                    {unreadCount} new
                  </span>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-2 -mr-2 ios-press rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Close notifications"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto ios-scroll flex-1 px-0">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-iosBlue"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm md:text-ios-body text-iosGray-1">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-iosGray-4">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.link)}
                      className="w-full text-left p-4 hover:bg-iosGray-6 active:bg-iosGray-5 transition-colors ios-press min-h-[80px]"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl md:text-2xl flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-ios-body font-medium text-gray-900 line-clamp-1 break-words">
                            {notification.title}
                          </p>
                          <p className="text-xs md:text-ios-footnote text-iosGray-1 mt-1 line-clamp-2 break-words">
                            {notification.message}
                          </p>
                          <p className="text-xs md:text-ios-caption1 text-iosGray-2 mt-1.5">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 sm:p-4 border-t border-iosGray-4 flex-shrink-0">
                <Link
                  href="/messaging"
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm md:text-ios-body text-iosBlue hover:text-iosBlue-dark font-medium py-2"
                >
                  View All Messages
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
