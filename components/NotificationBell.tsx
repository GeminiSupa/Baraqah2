'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/LanguageProvider'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string
  createdAt: string
  isRead?: boolean
}

export function NotificationBell() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
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

  const handleNotificationClick = async (notification: Notification) => {
    setIsOpen(false)
    if (notification.link) {
      if (!notification.isRead) {
        try {
          await fetch(`/api/notifications/${notification.id}/read`, { method: 'PATCH' })
          setNotifications((prev) =>
            prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
          )
          setUnreadCount((prev) => Math.max(0, prev - 1))
        } catch {
          // Non-blocking
        }
      }
      router.push(notification.link)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return t('notifications.justNow')
    if (diffInSeconds < 3600) return t('notifications.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
    if (diffInSeconds < 86400) return t('notifications.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
    if (diffInSeconds < 604800) return t('notifications.daysAgo', { count: Math.floor(diffInSeconds / 86400) })
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return '💬'
      case 'request':
      case 'request_approved':
      case 'request_rejected':
        return '👤'
      case 'questionnaire':
      case 'questionnaire_answered':
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
        aria-label={t('notifications.notifications')}
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
          <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-iosRed text-white text-xs font-semibold flex items-center justify-center transform translate-x-1 -translate-y-1">
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
              <h3 className="text-lg md:text-ios-title3 font-semibold text-gray-900">{t('notifications.notifications')}</h3>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <span className="text-xs md:text-ios-footnote text-iosGray-1">
                    {unreadCount} {t('notifications.new')}
                  </span>
                )}
                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await fetch('/api/notifications/read-all', { method: 'PATCH' })
                        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
                        setUnreadCount(0)
                      } catch {
                        // ignore
                      }
                    }}
                    className="hidden md:inline text-xs md:text-ios-footnote text-iosBlue hover:text-iosBlue-dark font-medium"
                  >
                    {t('notifications.markAllRead')}
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden p-2 -mr-2 ios-press rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label={t('common.close')}
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
                  <p className="text-sm md:text-ios-body text-iosGray-1">{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                <div className="divide-y divide-iosGray-4">
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={cn(
                        'w-full text-left p-4 hover:bg-iosGray-6 active:bg-iosGray-5 transition-colors ios-press min-h-[80px]',
                        notification.isRead ? 'bg-white' : 'bg-iosBlue/5'
                      )}
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
                        {!notification.isRead && (
                          <span className="mt-2 h-2 w-2 rounded-full bg-iosBlue flex-shrink-0" aria-hidden="true" />
                        )}
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
                  {t('notifications.viewAllMessages')}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
