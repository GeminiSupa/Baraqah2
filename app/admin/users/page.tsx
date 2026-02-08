'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  phone?: string
  emailVerified: boolean
  phoneVerified: boolean
  idVerified: boolean
  profileActive: boolean
  isSuspended: boolean
  suspensionReason?: string
  createdAt: string
  profile?: {
    id: string
    firstName: string
    lastName: string
  }
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showSuspendModal, setShowSuspendModal] = useState<{ userId: string; email: string } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState<{ userId: string; email: string } | null>(null)
  const [suspendReason, setSuspendReason] = useState('')

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch users')
      }
    } catch (error) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, search])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        router.push('/')
        return
      }
      fetchUsers()
    }
  }, [status, session, router, fetchUsers])

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handleAction = async (userId: string, action: 'suspend' | 'activate' | 'delete', email: string) => {
    if (action === 'suspend') {
      setShowSuspendModal({ userId, email })
      return
    }

    if (action === 'delete') {
      setShowDeleteModal({ userId, email })
      return
    }

    setProcessing(userId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          reason: suspendReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Action completed successfully')
        setShowSuspendModal(null)
        setShowDeleteModal(null)
        setSuspendReason('')
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to perform action')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleSuspendConfirm = () => {
    if (!showSuspendModal) return
    handleAction(showSuspendModal.userId, 'suspend', showSuspendModal.email)
  }

  const handleDeleteConfirm = async () => {
    if (!showDeleteModal) return
    
    setProcessing(showDeleteModal.userId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: showDeleteModal.userId,
          action: 'delete',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'User deleted successfully')
        setShowDeleteModal(null)
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session?.user?.isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-24 md:pb-10 relative">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600">View, search, suspend, and activate user accounts</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Email or phone..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white text-sm sm:text-base"
                />
                <button
                  onClick={handleSearch}
                  className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm sm:text-base min-h-[44px]"
                >
                  Search
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white text-sm sm:text-base min-h-[44px]"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table - Mobile Card View */}
        <div className="md:hidden space-y-4 mb-6">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-2xl shadow-xl border border-gray-100/50 p-4">
              <div className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">{user.email}</div>
                  {user.profile && (
                    <div className="text-sm text-gray-500">
                      {user.profile.firstName} {user.profile.lastName}
                    </div>
                  )}
                  {user.phone && (
                    <div className="text-xs text-gray-500">{user.phone}</div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                    Email: {user.emailVerified ? '✓' : '✗'}
                  </span>
                  <span className={user.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                    Phone: {user.phoneVerified ? '✓' : '✗'}
                  </span>
                  <span className={user.idVerified ? 'text-green-600' : 'text-red-600'}>
                    ID: {user.idVerified ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    {user.isSuspended ? (
                      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Suspended
                      </span>
                    ) : user.profileActive ? (
                      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {user.isSuspended ? (
                      <button
                        onClick={() => handleAction(user.id, 'activate', user.email)}
                        disabled={processing === user.id}
                        className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 min-h-[36px]"
                      >
                        Activate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAction(user.id, 'suspend', user.email)}
                        disabled={processing === user.id}
                        className="px-3 py-1.5 text-xs bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 min-h-[36px]"
                      >
                        Suspend
                      </button>
                    )}
                    <button
                      onClick={() => handleAction(user.id, 'delete', user.email)}
                      disabled={processing === user.id}
                      className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 min-h-[36px]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {user.suspensionReason && (
                  <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                    {user.suspensionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Users Table - Desktop View */}
        <div className="hidden md:block bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 lg:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        {user.profile && (
                          <div className="text-sm text-gray-500">
                            {user.profile.firstName} {user.profile.lastName}
                          </div>
                        )}
                        {user.phone && (
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm">
                        <div className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                          Email: {user.emailVerified ? '✓' : '✗'}
                        </div>
                        <div className={user.phoneVerified ? 'text-green-600' : 'text-red-600'}>
                          Phone: {user.phoneVerified ? '✓' : '✗'}
                        </div>
                        <div className={user.idVerified ? 'text-green-600' : 'text-red-600'}>
                          ID: {user.idVerified ? '✓' : '✗'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="text-sm">
                        {user.isSuspended ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Suspended
                          </span>
                        ) : user.profileActive ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      {user.suspensionReason && (
                        <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">{user.suspensionReason}</div>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2">
                        {user.isSuspended ? (
                          <button
                            onClick={() => handleAction(user.id, 'activate', user.email)}
                            disabled={processing === user.id}
                            className="px-3 py-1.5 text-green-600 hover:text-green-900 disabled:opacity-50 text-xs sm:text-sm min-h-[36px]"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(user.id, 'suspend', user.email)}
                            disabled={processing === user.id}
                            className="px-3 py-1.5 text-yellow-600 hover:text-yellow-900 disabled:opacity-50 text-xs sm:text-sm min-h-[36px]"
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          onClick={() => handleAction(user.id, 'delete', user.email)}
                          disabled={processing === user.id}
                          className="px-3 py-1.5 text-red-600 hover:text-red-900 disabled:opacity-50 text-xs sm:text-sm min-h-[36px]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 safe-top safe-bottom">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-[90%] sm:w-96 max-w-md shadow-lg rounded-md bg-white m-4 sm:m-0">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to suspend <strong>{showSuspendModal.email}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                placeholder="Enter reason for suspension..."
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSuspendConfirm}
                disabled={processing === showSuspendModal.userId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Suspend
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(null)
                  setSuspendReason('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 safe-top safe-bottom">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-[90%] sm:w-96 max-w-md shadow-lg rounded-md bg-white m-4 sm:m-0">
            <h3 className="text-lg font-bold text-red-600 mb-4">Delete User</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-700 mb-2">
                Are you sure you want to <strong className="text-red-600">permanently delete</strong> user:
              </p>
              <p className="text-base font-semibold text-gray-900 mb-4">{showDeleteModal.email}</p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                <p className="text-sm text-red-800 font-medium mb-1">⚠️ Warning: This action cannot be undone!</p>
                <p className="text-xs text-red-700">
                  This will permanently delete:
                </p>
                <ul className="text-xs text-red-700 list-disc list-inside mt-1 space-y-1">
                  <li>User account</li>
                  <li>Profile and all profile data</li>
                  <li>All uploaded photos</li>
                  <li>All messages and conversations</li>
                  <li>All favorites and connections</li>
                </ul>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteConfirm}
                disabled={processing === showDeleteModal.userId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 font-semibold"
              >
                {processing === showDeleteModal.userId ? 'Deleting...' : 'Delete User'}
              </button>
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={processing === showDeleteModal.userId}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
