'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Report {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  description?: string
  status: string
  adminNotes?: string
  reviewedBy?: string
  reviewedAt?: string
  createdAt: string
  reporter?: {
    id: string
    email: string
    name?: string
  }
  reportedUser?: {
    id: string
    email: string
    name?: string
  }
}

export default function AdminReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [suspendUser, setSuspendUser] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/reports?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch reports')
      }
    } catch (error) {
      setError('Failed to load reports')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!session?.user?.isAdmin) {
        router.push('/')
        return
      }
      fetchReports()
    }
  }, [status, session, router, fetchReports])

  const handleAction = async (reportId: string, action: 'reviewed' | 'resolved' | 'dismissed') => {
    setProcessing(reportId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          action,
          adminNotes,
          suspendUser: action === 'resolved' ? suspendUser : false,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Report updated successfully')
        setSelectedReport(null)
        setAdminNotes('')
        setSuspendUser(false)
        fetchReports()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update report')
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-iosBlue hover:text-iosBlue-dark mb-4 inline-block font-medium">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Reports Management</h1>
          <p className="text-base text-gray-600">Review user reports and take appropriate action</p>
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

        {/* Status Filter */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex space-x-4">
            {['pending', 'reviewed', 'resolved', 'dismissed', 'all'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  statusFilter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Report: {report.reason}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      <span className="font-medium">Reported by:</span>{' '}
                      {report.reporter?.name || report.reporter?.email}
                    </p>
                    <p>
                      <span className="font-medium">Reported user:</span>{' '}
                      {report.reportedUser?.name || report.reportedUser?.email}
                    </p>
                    <p>
                      <span className="font-medium">Submitted:</span>{' '}
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  report.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                  report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>

              {report.description && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{report.description}</p>
                </div>
              )}

              {report.adminNotes && (
                <div className="mb-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Admin Notes:</span> {report.adminNotes}
                  </p>
                </div>
              )}

              {report.status === 'pending' && (
                <div className="flex space-x-4 pt-4 border-t">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                  >
                    Review Report
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {reports.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No reports found with status: {statusFilter}</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Review Report</h3>

            <div className="mb-4 space-y-3">
              <div>
                <span className="font-medium">Reason:</span> {selectedReport.reason}
              </div>
              {selectedReport.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedReport.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium">Reported by:</span> {selectedReport.reporter?.name || selectedReport.reporter?.email}
              </div>
              <div>
                <span className="font-medium">Reported user:</span> {selectedReport.reportedUser?.name || selectedReport.reportedUser?.email}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add notes about this report and action taken..."
              />
            </div>

            {selectedReport.status === 'pending' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={suspendUser}
                    onChange={(e) => setSuspendUser(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Suspend reported user when resolving
                  </span>
                </label>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => handleAction(selectedReport.id, 'resolved')}
                disabled={processing === selectedReport.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing === selectedReport.id ? 'Processing...' : '✓ Resolve'}
              </button>
              <button
                onClick={() => handleAction(selectedReport.id, 'reviewed')}
                disabled={processing === selectedReport.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processing === selectedReport.id ? 'Processing...' : 'Mark Reviewed'}
              </button>
              <button
                onClick={() => handleAction(selectedReport.id, 'dismissed')}
                disabled={processing === selectedReport.id}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
              >
                {processing === selectedReport.id ? 'Processing...' : 'Dismiss'}
              </button>
              <button
                onClick={() => {
                  setSelectedReport(null)
                  setAdminNotes('')
                  setSuspendUser(false)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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
