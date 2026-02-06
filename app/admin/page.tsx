'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface DashboardStats {
  pendingVerifications: number
  pendingProfiles: number
  pendingReports: number
  totalUsers: number
  activeUsers: number
  suspendedUsers: number
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!session.user.isAdmin) {
        router.push('/')
        return
      }
      fetchStats()
    }
  }, [status, session, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  const adminSections = [
    {
      title: 'ID Verifications',
      description: 'Review and approve ID document verifications',
      href: '/admin/verifications',
      count: stats?.pendingVerifications || 0,
      color: 'blue',
      icon: '🆔',
    },
    {
      title: 'User Management',
      description: 'View, search, suspend, and activate user accounts',
      href: '/admin/users',
      count: stats?.totalUsers || 0,
      color: 'green',
      icon: '👥',
    },
    {
      title: 'Profile Moderation',
      description: 'Approve or reject new profiles before they go live',
      href: '/admin/profiles',
      count: stats?.pendingProfiles || 0,
      color: 'purple',
      icon: '📝',
    },
    {
      title: 'Reports Management',
      description: 'Review user reports and take appropriate action',
      href: '/admin/reports',
      count: stats?.pendingReports || 0,
      color: 'red',
      icon: '🚨',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-base text-gray-600">Manage the platform and moderate content</p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-2xl p-3">
                  <span className="text-2xl">🆔</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-2xl p-3">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Profiles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingProfiles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-2xl p-3">
                  <span className="text-2xl">🚨</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingReports}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-2xl p-3">
                  <span className="text-2xl">👥</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="block bg-white rounded-3xl shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all p-6"
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 bg-${section.color}-100 rounded-2xl p-4`}>
                  <span className="text-3xl">{section.icon}</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                    {section.count > 0 && (
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-${section.color}-100 text-${section.color}-800`}>
                        {section.count}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  <div className="mt-4 text-sm text-iosBlue font-semibold">
                    Manage →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Admin Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">Admin Guidelines</h3>
          <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
            <li>Review all verifications and profiles carefully before approval</li>
            <li>Take appropriate action on user reports within 24 hours</li>
            <li>Maintain user privacy and handle sensitive data securely</li>
            <li>Document any moderation actions taken</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
