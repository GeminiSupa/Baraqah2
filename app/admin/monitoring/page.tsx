'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface MonitoringOverview {
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
  totalMessages: number
  totalReports: number
  pendingReports: number
}

interface SuspiciousUser {
  id: string
  email: string
  createdAt: string
  isSuspended: boolean
  flags: string[]
  reportsCount: number
  rejectedCount: number
  messageRatio: string
}

interface UserDetail {
  user: {
    id: string
    email: string
    phone?: string
    createdAt: string
    profileActive: boolean
    isSuspended: boolean
  }
  statistics: {
    messagesSent: number
    messagesReceived: number
    reportsMade: number
    reportsReceived: number
    requestsSent: number
    requestsReceived: number
    rejectedRequests: number
    recentActivity: {
      messagesLast7Days: number
      requestsLast7Days: number
    }
  }
  suspiciousFlags: string[]
  recentMessages: Array<{
    id: string
    isSent: boolean
    content: string
    createdAt: string
    isRead: boolean
  }>
  recentRequests: Array<{
    id: string
    sender_id: string
    receiver_id: string
    status: string
    connection_status: string
    created_at: string
  }>
  allReports: Array<{
    id: string
    isReporter: boolean
    reason: string
    status: string
    createdAt: string
  }>
}

export default function AdminMonitoringPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState<'overview' | 'suspicious' | 'user-detail'>('overview')
  const [overview, setOverview] = useState<MonitoringOverview | null>(null)
  const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([])
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchEmail, setSearchEmail] = useState('')

  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/monitoring?type=overview')
      const data = await response.json()

      if (response.ok) {
        setOverview(data.overview)
      } else {
        setError(data.error || 'Failed to fetch monitoring data')
      }
    } catch (error) {
      setError('Failed to load monitoring data')
    }
  }, [])

  const fetchSuspicious = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/monitoring?type=suspicious-activity')
      const data = await response.json()

      if (response.ok) {
        setSuspiciousUsers(data.suspiciousUsers || [])
      } else {
        setError(data.error || 'Failed to fetch suspicious activity')
      }
    } catch (error) {
      setError('Failed to load suspicious activity')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserDetail = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/monitoring?type=user-detail&userId=${userId}`)
      const data = await response.json()

      if (response.ok) {
        setUserDetail(data)
        setView('user-detail')
      } else {
        setError(data.error || 'Failed to fetch user details')
      }
    } catch (error) {
      setError('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }, [])

  const searchUser = async () => {
    if (!searchEmail.trim()) return

    setLoading(true)
    try {
      // First find user by email
      const usersResponse = await fetch(`/api/admin/users?search=${encodeURIComponent(searchEmail)}&limit=1`)
      const usersData = await usersResponse.json()

      if (usersResponse.ok && usersData.users?.length > 0) {
        const userId = usersData.users[0].id
        setSelectedUserId(userId)
        await fetchUserDetail(userId)
      } else {
        setError('User not found')
      }
    } catch (error) {
      setError('Failed to search user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        router.push('/')
        return
      }
      if (view === 'overview') {
        fetchOverview()
        setLoading(false)
      } else if (view === 'suspicious') {
        fetchSuspicious()
      }
    }
  }, [status, session, router, view, fetchOverview, fetchSuspicious])

  if (status === 'loading' || (loading && view !== 'overview')) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading monitoring data...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-24 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Back Button */}
          <button
            onClick={() => {
              if (view === 'user-detail') {
                setView('overview')
                setUserDetail(null)
                setSelectedUserId(null)
              } else {
                router.back()
              }
            }}
            className="md:hidden mb-4 flex items-center text-gray-700 hover:text-gray-900 ios-press"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-medium">Back</span>
          </button>

          <div className="mb-6 sm:mb-8">
            <Link href="/admin" className="text-iosBlue hover:text-iosBlue-dark mb-4 inline-block font-medium text-sm sm:text-base">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">User Monitoring</h1>
            <p className="text-sm sm:text-base text-gray-600">Monitor user activity and detect misuse patterns</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* View Tabs */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-wrap gap-2 sm:gap-4">
              <button
                onClick={() => {
                  setView('overview')
                  fetchOverview()
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                  view === 'overview'
                    ? 'bg-iosBlue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setView('suspicious')
                  fetchSuspicious()
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium min-h-[44px] ${
                  view === 'suspicious'
                    ? 'bg-iosBlue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Suspicious Activity
              </button>
              <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:ml-auto">
                <input
                  type="text"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchUser()}
                  placeholder="Search by email..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white text-sm sm:text-base min-h-[44px]"
                />
                <button
                  onClick={searchUser}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm sm:text-base min-h-[44px]"
                >
                  Search User
                </button>
              </div>
            </div>
          </div>

          {/* Overview View */}
          {view === 'overview' && overview && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">👥</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">✓</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Active Users</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.activeUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">🚫</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Suspended</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.suspendedUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">💬</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Messages</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.totalMessages}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">🚨</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Reports</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.totalReports}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-xl sm:rounded-2xl p-2 sm:p-3">
                      <span className="text-xl sm:text-2xl">⏳</span>
                    </div>
                    <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending Reports</p>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{overview.pendingReports}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <h3 className="font-semibold text-blue-900 mb-3 text-base sm:text-lg">Monitoring Features</h3>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-2 list-disc list-inside">
                  <li>Track user activity patterns and message behavior</li>
                  <li>Identify users with high report counts or rejection rates</li>
                  <li>Monitor message send/receive ratios for spam detection</li>
                  <li>View detailed user activity history (invisible to users)</li>
                  <li>Flag suspicious behavior automatically</li>
                </ul>
              </div>
            </div>
          )}

          {/* Suspicious Activity View */}
          {view === 'suspicious' && (
            <div className="space-y-4">
              {suspiciousUsers.length === 0 ? (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-6 sm:p-8 text-center">
                  <p className="text-gray-600">No suspicious activity patterns detected</p>
                </div>
              ) : (
                suspiciousUsers.map((user) => (
                  <div key={user.id} className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{user.email}</h3>
                          {user.isSuspended && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-3">
                          Joined: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <div className="space-y-2">
                          {user.flags.map((flag, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="text-red-600">⚠️</span>
                              <span className="text-sm text-gray-700">{flag}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs sm:text-sm">
                          <div>
                            <span className="text-gray-500">Reports:</span> <span className="font-medium">{user.reportsCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rejected:</span> <span className="font-medium">{user.rejectedCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Msg Ratio:</span> <span className="font-medium">{user.messageRatio}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id)
                          fetchUserDetail(user.id)
                        }}
                        className="px-4 py-2 bg-iosBlue text-white rounded-md hover:bg-iosBlue-dark text-sm sm:text-base min-h-[44px] whitespace-nowrap"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* User Detail View */}
          {view === 'user-detail' && userDetail && (
            <div className="space-y-4 sm:space-y-6">
              {/* User Info Card */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">User Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base">
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-900">{userDetail.user.email}</p>
                  </div>
                  {userDetail.user.phone && (
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span>
                      <p className="text-gray-900">{userDetail.user.phone}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Account Created:</span>
                    <p className="text-gray-900">{new Date(userDetail.user.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-900">
                      {userDetail.user.isSuspended ? 'Suspended' : userDetail.user.profileActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suspicious Flags */}
              {userDetail.suspiciousFlags.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-red-900 mb-3">⚠️ Suspicious Activity Flags</h3>
                  <ul className="space-y-2">
                    {userDetail.suspiciousFlags.map((flag, idx) => (
                      <li key={idx} className="text-sm sm:text-base text-red-800 flex items-start gap-2">
                        <span>•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statistics */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Activity Statistics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Messages Sent</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userDetail.statistics.messagesSent}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Messages Received</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userDetail.statistics.messagesReceived}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Reports Made</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userDetail.statistics.reportsMade}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Reports Received</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{userDetail.statistics.reportsReceived}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Requests Sent</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userDetail.statistics.requestsSent}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Requests Received</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{userDetail.statistics.requestsReceived}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Rejected</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-600">{userDetail.statistics.rejectedRequests}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Last 7 Days</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {userDetail.statistics.recentActivity.messagesLast7Days} msgs
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Messages Preview */}
              {userDetail.recentMessages.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Recent Messages (Preview)</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {userDetail.recentMessages.map((msg) => (
                      <div key={msg.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium ${msg.isSent ? 'text-blue-600' : 'text-green-600'}`}>
                            {msg.isSent ? 'Sent' : 'Received'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 line-clamp-2">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports History */}
              {userDetail.allReports.length > 0 && (
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Reports History</h3>
                  <div className="space-y-3">
                    {userDetail.allReports.map((report) => (
                      <div key={report.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            report.isReporter ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {report.isReporter ? 'Made Report' : 'Reported Against'}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-1">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(report.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/admin/users`}
                    className="px-4 py-2 bg-iosBlue text-white rounded-md hover:bg-iosBlue-dark text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                  >
                    View in User Management
                  </Link>
                  {!userDetail.user.isSuspended && (
                    <Link
                      href={`/admin/users`}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-center text-sm sm:text-base min-h-[44px] flex items-center justify-center"
                    >
                      Suspend User
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
