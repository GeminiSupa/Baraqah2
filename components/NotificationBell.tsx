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
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 md:w-96 bg-white rounded-ios-lg shadow-ios-lg border border-iosGray-4 z-50 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
          <div className="p-4 border-b border-iosGray-4 flex items-center justify-between">
            <h3 className="text-ios-title3 font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-ios-footnote text-iosGray-1">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto ios-scroll flex-1">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-iosBlue"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-ios-body text-iosGray-1">No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-iosGray-4">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification.link)}
                    className="w-full text-left p-4 hover:bg-iosGray-6 transition-colors ios-press"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-ios-body font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-ios-footnote text-iosGray-1 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-ios-caption1 text-iosGray-2 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-iosGray-4">
              <Link
                href="/messaging"
                onClick={() => setIsOpen(false)}
                className="block text-center text-ios-body text-iosBlue hover:text-iosBlue-dark font-medium"
              >
                View All Messages
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
