'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface PendingUser {
  id: string
  email: string
  phone?: string
  idDocumentUrl: string
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
}

export default function AdminVerificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (!session.user.isAdmin) {
        router.push('/')
        return
      }
      fetchPendingVerifications()
    }
  }, [status, session, router])

  const fetchPendingVerifications = async () => {
    try {
      const response = await fetch('/api/admin/pending-verifications')
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      } else {
        setError(data.error || 'Failed to fetch pending verifications')
      }
    } catch (error) {
      setError('Failed to load pending verifications')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (userId: string, verified: boolean) => {
    setProcessing(userId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/verify-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, verified }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || `ID verification ${verified ? 'approved' : 'rejected'}`)
        setUsers(users.filter(u => u.id !== userId))
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update verification status')
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/admin" className="text-iosBlue hover:text-iosBlue-dark mb-4 inline-block font-medium">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">ID Verification Management</h1>
          <p className="text-base text-gray-600">
            ID verification is optional for users but highly recommended. Review uploaded documents and approve
            trusted profiles so they appear with a Verified ID badge across the app.
          </p>
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

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Pending ID Verifications ({users.length})
          </h2>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No pending verifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">User Information</h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Email:</span> {user.email}
                        </p>
                        {user.phone && (
                          <p>
                            <span className="font-medium">Phone:</span> {user.phone}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Email Verified:</span>{' '}
                          {user.emailVerified ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Phone Verified:</span>{' '}
                          {user.phoneVerified ? (
                            <span className="text-green-600">Yes</span>
                          ) : (
                            <span className="text-red-600">No</span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Submitted:</span>{' '}
                          {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">ID Document</h3>
                      <div className="mb-4">
                        {user.idDocumentUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <div className="relative w-full max-w-md h-80">
                            <Image
                              src={user.idDocumentUrl}
                              alt="ID Document"
                              fill
                              className="object-contain border rounded-lg shadow-sm bg-gray-50"
                            />
                          </div>
                        ) : (
                          <div className="border rounded-lg p-4 bg-gray-50">
                            <p className="text-sm text-gray-600 mb-2">PDF Document</p>
                            <a
                              href={user.idDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700 underline"
                            >
                              View/Download PDF
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-4 pt-6 border-t">
                    <button
                      onClick={() => handleVerify(user.id, true)}
                      disabled={processing === user.id}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === user.id ? 'Processing...' : '✓ Approve Verification'}
                    </button>
                    <button
                      onClick={() => handleVerify(user.id, false)}
                      disabled={processing === user.id}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processing === user.id ? 'Processing...' : '✗ Reject Verification'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Privacy Notice</h3>
          <p className="text-sm text-blue-800">
            ID documents are securely stored and only used for verification purposes. 
            Once verified, access to documents is restricted to administrators only. 
            All documents are handled in accordance with privacy regulations.
          </p>
        </div>
      </div>
    </div>
  )
}
