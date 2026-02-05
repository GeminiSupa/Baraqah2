'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  age: number
  gender: string
  bio?: string
  education?: string
  profession?: string
  location?: string
  city?: string
  moderationStatus: string
  moderationNotes?: string
  moderatedAt?: string
  createdAt: string
  user?: {
    id: string
    email: string
    phone?: string
    idVerified: boolean
    profileActive: boolean
  }
  photos: Array<{
    id: string
    url: string
    isPrimary: boolean
  }>
}

export default function AdminProfilesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [moderationNotes, setModerationNotes] = useState('')

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', statusFilter)
      params.append('page', page.toString())
      params.append('limit', '20')

      const response = await fetch(`/api/admin/profiles?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.profiles || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else {
        setError(data.error || 'Failed to fetch profiles')
      }
    } catch (error) {
      setError('Failed to load profiles')
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
      fetchProfiles()
    }
  }, [status, session, router, fetchProfiles])

  const handleModerate = async (profileId: string, action: 'approve' | 'reject') => {
    setProcessing(profileId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/profiles', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          action,
          notes: moderationNotes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message || 'Profile moderated successfully')
        setSelectedProfile(null)
        setModerationNotes('')
        fetchProfiles()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to moderate profile')
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Profile Moderation</h1>
          <p className="text-gray-600 mt-2">Approve or reject new profiles before they go live</p>
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
            {['pending', 'approved', 'rejected', 'all'].map((status) => (
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
                {status.charAt(0).toUpperCase() + status.slice(1)} ({profiles.length})
              </button>
            ))}
          </div>
        </div>

        {/* Profiles List */}
        <div className="grid grid-cols-1 gap-6">
          {profiles.map((profile) => {
            const primaryPhoto = profile.photos.find(p => p.isPrimary)
            return (
              <div key={profile.id} className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Photo */}
                  <div>
                    {primaryPhoto ? (
                      <div className="relative w-full h-64">
                        <Image
                          src={primaryPhoto.url}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="lg:col-span-2">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {profile.firstName} {profile.lastName}
                        </h3>
                        <p className="text-gray-600">
                          {profile.age} years old • {profile.gender} • {profile.city || profile.location || 'Location not specified'}
                        </p>
                        {profile.user && (
                          <p className="text-sm text-gray-500 mt-1">
                            {profile.user.email} {profile.user.phone && `• ${profile.user.phone}`}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profile.moderationStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        profile.moderationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.moderationStatus}
                      </span>
                    </div>

                    {profile.bio && (
                      <p className="text-gray-700 mb-4 line-clamp-3">{profile.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      {profile.education && (
                        <div>
                          <span className="font-medium">Education:</span> {profile.education}
                        </div>
                      )}
                      {profile.profession && (
                        <div>
                          <span className="font-medium">Profession:</span> {profile.profession}
                        </div>
                      )}
                    </div>

                    {profile.user && (
                      <div className="flex space-x-4 text-sm mb-4">
                        <span className={profile.user.idVerified ? 'text-green-600' : 'text-red-600'}>
                          ID Verified: {profile.user.idVerified ? '✓' : '✗'}
                        </span>
                        <span className={profile.user.profileActive ? 'text-green-600' : 'text-red-600'}>
                          Profile Active: {profile.user.profileActive ? '✓' : '✗'}
                        </span>
                      </div>
                    )}

                    {profile.moderationStatus === 'pending' && (
                      <div className="flex space-x-4 pt-4 border-t">
                        <button
                          onClick={() => setSelectedProfile(profile)}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Review & Moderate
                        </button>
                      </div>
                    )}

                    {profile.moderationNotes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
                        <span className="font-medium">Moderation Notes:</span> {profile.moderationNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {profiles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">No profiles found with status: {statusFilter}</p>
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

      {/* Moderation Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Review Profile: {selectedProfile.firstName} {selectedProfile.lastName}
            </h3>

            <div className="max-h-96 overflow-y-auto mb-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                <p className="text-sm text-gray-600">
                  Age: {selectedProfile.age} • Gender: {selectedProfile.gender} • Location: {selectedProfile.city || selectedProfile.location}
                </p>
              </div>

              {selectedProfile.bio && (
                <div>
                  <h4 className="font-medium text-gray-900">Bio</h4>
                  <p className="text-sm text-gray-600">{selectedProfile.bio}</p>
                </div>
              )}

              {selectedProfile.education && (
                <div>
                  <h4 className="font-medium text-gray-900">Education</h4>
                  <p className="text-sm text-gray-600">{selectedProfile.education}</p>
                </div>
              )}

              {selectedProfile.profession && (
                <div>
                  <h4 className="font-medium text-gray-900">Profession</h4>
                  <p className="text-sm text-gray-600">{selectedProfile.profession}</p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moderation Notes (optional)
              </label>
              <textarea
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Add notes about this moderation decision..."
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => handleModerate(selectedProfile.id, 'approve')}
                disabled={processing === selectedProfile.id}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {processing === selectedProfile.id ? 'Processing...' : '✓ Approve Profile'}
              </button>
              <button
                onClick={() => handleModerate(selectedProfile.id, 'reject')}
                disabled={processing === selectedProfile.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {processing === selectedProfile.id ? 'Processing...' : '✗ Reject Profile'}
              </button>
              <button
                onClick={() => {
                  setSelectedProfile(null)
                  setModerationNotes('')
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
