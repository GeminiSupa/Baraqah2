'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { EmptyMessages } from '@/components/ui/EmptyState'

interface MessageRequest {
  id: string
  status: string
  connectionStatus: string
  message?: string
  createdAt: string
  sender?: {
    id: string
    email: string
    profile?: {
      firstName: string
      lastName: string
      photos: Array<{ url: string }>
      idVerified?: boolean
    }
  }
  receiver?: {
    id: string
    email: string
    profile?: {
      firstName: string
      lastName: string
      photos: Array<{ url: string }>
      idVerified?: boolean
    }
  }
}

export default function MessagingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<MessageRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [requestType, setRequestType] = useState<'received' | 'sent'>('received')

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/messaging/requests?type=${requestType}`)
      const data = await response.json()

      if (response.ok) {
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }, [requestType])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchRequests()
    }
  }, [status, router, fetchRequests])

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/messaging/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'approved' }),
      })

      if (response.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const response = await fetch(`/api/messaging/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (response.ok) {
        fetchRequests()
      }
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-iosBg-secondary flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading messages...</p>
        </div>
      </div>
    )
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const approvedRequests = requests.filter(r => r.status === 'approved')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-20 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-base text-gray-600">Manage your message requests and conversations</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8 mb-6">

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => setRequestType('received')}
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ios-press ${
                requestType === 'received'
                  ? 'bg-iosBlue text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Received Requests
            </button>
            <button
              onClick={() => setRequestType('sent')}
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all ios-press ${
                requestType === 'sent'
                  ? 'bg-iosBlue text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Sent Requests
            </button>
          </div>

          {requestType === 'received' && pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Pending Requests</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.sender?.profile?.firstName} {request.sender?.profile?.lastName}
                          </h3>
                          {request.sender?.profile && (
                            request.sender.profile.idVerified ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-200">
                                ✓ Verified ID
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-200">
                                Not verified
                              </span>
                            )
                          )}
                        </div>
                        {request.message && (
                          <p className="text-base text-gray-600 mt-2 mb-2">{request.message}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link
                          href={`/messaging/request/${request.id}`}
                          className="px-5 py-2.5 bg-iosBlue text-white rounded-xl hover:bg-iosBlue-dark text-base font-semibold ios-press text-center shadow-md"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 text-base font-semibold ios-press shadow-md"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 text-base font-semibold ios-press shadow-md"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">
              {requestType === 'received' ? 'Approved Requests' : 'Your Requests'}
            </h2>
            {approvedRequests.length === 0 ? (
              <EmptyMessages />
            ) : (
              <div className="space-y-4">
                {approvedRequests.map((request) => {
                  const otherUser = requestType === 'received' ? request.sender : request.receiver
                  const canMessage = request.connectionStatus === 'connected'
                  
                  return (
                    <div key={request.id} className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-lg">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                            </h3>
                            {otherUser?.profile && (
                              otherUser.profile.idVerified ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-200">
                                  ✓ Verified ID
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-200">
                                  Not verified
                                </span>
                              )
                            )}
                          </div>
                          <p className="text-base text-gray-600 mb-1">
                            Status: <span className="font-medium">{request.connectionStatus.replace('_', ' ').toUpperCase()}</span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {(request.connectionStatus === 'accepted' || 
                            request.connectionStatus === 'questionnaire_sent' ||
                            request.connectionStatus === 'questionnaire_completed') && (
                            <Link
                              href={`/messaging/questionnaire/${request.id}`}
                              className={`px-5 py-2.5 text-white rounded-xl hover:opacity-90 text-base font-semibold ios-press text-center shadow-md ${
                                request.connectionStatus === 'questionnaire_sent' 
                                  ? 'bg-orange-500 animate-pulse' 
                                  : request.connectionStatus === 'questionnaire_completed'
                                  ? 'bg-green-600'
                                  : 'bg-iosBlue'
                              }`}
                            >
                              {request.connectionStatus === 'questionnaire_sent' 
                                ? '📩 Answer Questions' 
                                : request.connectionStatus === 'questionnaire_completed'
                                ? 'View Answers'
                                : 'Questionnaire'}
                            </Link>
                          )}
                          {canMessage && (
                            <Link
                              href={`/messaging/${otherUser?.id}`}
                              className="px-5 py-2.5 bg-iosBlue text-white rounded-xl hover:bg-iosBlue-dark text-base font-semibold ios-press text-center shadow-md"
                            >
                              Message
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}