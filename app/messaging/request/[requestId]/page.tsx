'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { OptimizedImage } from '@/components/OptimizedImage'

interface Profile {
  id: string
  firstName: string
  lastName: string
  age: number
  gender: string
  bio?: string
  education?: string
  profession?: string
  location?: string
  city?: string
  photos: Array<{ url: string; isPrimary: boolean }>
  // Questionnaire fields
  marriageUnderstanding?: string
  lifeGoals?: string
  religiousPracticeImportance?: string
  childrenPreference?: string
  partnerTraits?: string
  marriageRoles?: string
  workLifeBalance?: string
  conflictResolution?: string
  happyHomeVision?: string
  dealBreakers?: string
  spiritualGrowth?: string
  hobbiesInterests?: string
}

interface MessageRequest {
  id: string
  status: string
  connectionStatus: string
  message?: string
  createdAt: string
  sender?: {
    id: string
    profile?: Profile
  }
  receiver?: {
    id: string
    profile?: Profile
  }
}

export default function RequestDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const requestId = params.requestId as string
  const [request, setRequest] = useState<MessageRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const fetchRequest = useCallback(async () => {
    try {
      // Try received requests first
      let response = await fetch(`/api/messaging/requests?type=received`)
      let data = await response.json()
      let foundRequest = data.requests?.find((r: MessageRequest) => r.id === requestId)

      // If not found, try sent requests
      if (!foundRequest) {
        response = await fetch(`/api/messaging/requests?type=sent`)
        data = await response.json()
        foundRequest = data.requests?.find((r: MessageRequest) => r.id === requestId)
      }

      if (foundRequest) {
        // Determine which user's profile to fetch
        const profileUserId = foundRequest.sender?.id === session?.user?.id 
          ? foundRequest.receiver?.id 
          : foundRequest.sender?.id

        if (profileUserId) {
          // Fetch full profile with questionnaire
          const profileResponse = await fetch(`/api/profile/view/${profileUserId}`)
          const profileData = await profileResponse.json()
          
          if (profileResponse.ok && profileData.profile) {
            if (foundRequest.sender?.id === session?.user?.id) {
              foundRequest.receiver = {
                ...foundRequest.receiver,
                profile: profileData.profile
              }
            } else {
              foundRequest.sender = {
                ...foundRequest.sender,
                profile: profileData.profile
              }
            }
          }
        }
        setRequest(foundRequest)
      } else {
        setError('Request not found')
      }
    } catch (error) {
      console.error('Error fetching request:', error)
      setError('Failed to load request')
    } finally {
      setLoading(false)
    }
  }, [requestId, session?.user?.id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRequest()
    }
  }, [status, router, fetchRequest])

  const handleAccept = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/messaging/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved', connectionStatus: 'accepted' }),
      })

      if (response.ok) {
        // Redirect to compatibility questionnaire after accepting
        router.push(`/messaging/compatibility/${requestId}`)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to accept request')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/messaging/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected', connectionStatus: 'rejected' }),
      })

      if (response.ok) {
        router.push('/messaging')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to reject request')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">{error || 'Request not found'}</p>
            <Link href="/messaging" className="mt-4 text-primary-600 hover:text-primary-700">
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Determine which profile to show
  const profile = request.sender?.id === session?.user?.id 
    ? request.receiver?.profile 
    : request.sender?.profile

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">Profile not found</p>
            <Link href="/messaging" className="mt-4 text-primary-600 hover:text-primary-700">
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const primaryPhoto = profile.photos?.find(p => p.isPrimary)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 safe-top safe-bottom pb-24 md:pb-12">
      <div className="max-w-4xl mx-auto">
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
        
        <div className="mb-6 hidden md:block">
          <Link href="/messaging" className="text-primary-600 hover:text-primary-700">
            ← Back to Messages
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Profile & Questionnaire Review
          </h1>

          {/* Basic Profile Info */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start space-x-6">
              {primaryPhoto && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={primaryPhoto.url}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600 mt-1">
                  {profile.age} years old • {profile.city || profile.location || 'Location not specified'}
                </p>
                {profile.profession && (
                  <p className="text-gray-600 mt-1">{profile.profession}</p>
                )}
                {profile.education && (
                  <p className="text-gray-600 mt-1">{profile.education}</p>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="text-gray-700 mt-4">{profile.bio}</p>
            )}
          </div>

          {/* Questionnaire Answers */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Questionnaire Answers</h3>

            {profile.marriageUnderstanding && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  1. Understanding of successful marriage and role of religion/deen
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.marriageUnderstanding}</p>
              </div>
            )}

            {profile.lifeGoals && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  2. Long-term life goals or ambitions
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.lifeGoals}</p>
              </div>
            )}

            {profile.religiousPracticeImportance && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  3. Importance of religious practice
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.religiousPracticeImportance}</p>
              </div>
            )}

            {profile.childrenPreference && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  4. Children preference and upbringing values
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.childrenPreference}</p>
              </div>
            )}

            {profile.partnerTraits && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  5. Important personality traits in a life partner
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.partnerTraits}</p>
              </div>
            )}

            {profile.marriageRoles && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  6. Roles and responsibilities in marriage
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.marriageRoles}</p>
              </div>
            )}

            {profile.workLifeBalance && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  7. Views on work-life balance after marriage
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.workLifeBalance}</p>
              </div>
            )}

            {profile.conflictResolution && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  8. How to handle conflicts or differences
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.conflictResolution}</p>
              </div>
            )}

            {profile.happyHomeVision && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  9. Vision of a happy, peaceful home
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.happyHomeVision}</p>
              </div>
            )}

            {profile.dealBreakers && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  10. Non-negotiables or deal-breakers
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.dealBreakers}</p>
              </div>
            )}

            {profile.spiritualGrowth && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  11. How marriage helps grow closer to Allah and achieve Jannah
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.spiritualGrowth}</p>
              </div>
            )}

            {profile.hobbiesInterests && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  12. Hobbies, interests, and free time activities
                </h4>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.hobbiesInterests}</p>
              </div>
            )}
          </div>

          {/* Request Message */}
          {request.message && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Message from {profile.firstName}:</h4>
              <p className="text-gray-700">{request.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          {request.status === 'pending' && (
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base min-h-[44px] shadow-md ios-press"
              >
                {processing ? 'Processing...' : 'Accept Request'}
              </button>
              <button
                onClick={handleReject}
                disabled={processing}
                className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm sm:text-base min-h-[44px] shadow-md ios-press"
              >
                {processing ? 'Processing...' : 'Decline Request'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
