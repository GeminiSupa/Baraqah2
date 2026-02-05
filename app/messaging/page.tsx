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
    }
  }
  receiver?: {
    id: string
    email: string
    profile?: {
      firstName: string
      lastName: string
      photos: Array<{ url: string }>
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
    <div className="min-h-screen bg-iosBg-secondary py-4 md:py-8 px-4 safe-top safe-bottom pb-20 md:pb-8 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-ios-xl shadow-ios-lg p-6 md:p-8 mb-6">
          <h1 className="text-ios-title1 font-bold text-gray-900 mb-6">Messages</h1>

          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={() => setRequestType('received')}
              className={`px-6 py-3 rounded-ios-lg font-semibold text-ios-body transition-all ios-press ${
                requestType === 'received'
                  ? 'bg-iosBlue text-white shadow-ios'
                  : 'bg-iosGray-6 text-iosGray-1 hover:bg-iosGray-5'
              }`}
            >
              Received Requests
            </button>
            <button
              onClick={() => setRequestType('sent')}
              className={`px-6 py-3 rounded-ios-lg font-semibold text-ios-body transition-all ios-press ${
                requestType === 'sent'
                  ? 'bg-iosBlue text-white shadow-ios'
                  : 'bg-iosGray-6 text-iosGray-1 hover:bg-iosGray-5'
              }`}
            >
              Sent Requests
            </button>
          </div>

          {requestType === 'received' && pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="text-ios-title2 font-semibold text-gray-900 mb-6">Pending Requests</h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-iosBg-secondary border border-iosGray-4 rounded-ios-xl p-5 shadow-ios">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-ios-headline font-semibold text-gray-900 mb-2">
                          {request.sender?.profile?.firstName} {request.sender?.profile?.lastName}
                        </h3>
                        {request.message && (
                          <p className="text-ios-body text-iosGray-1 mt-2 mb-2">{request.message}</p>
                        )}
                        <p className="text-ios-footnote text-iosGray-2">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Link
                          href={`/messaging/request/${request.id}`}
                          className="px-5 py-2.5 bg-iosBlue text-white rounded-ios-lg hover:bg-iosBlue-dark text-ios-body font-medium ios-press text-center"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="px-5 py-2.5 bg-iosGreen text-white rounded-ios-lg hover:bg-iosGreen-dark text-ios-body font-medium ios-press"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="px-5 py-2.5 bg-iosRed text-white rounded-ios-lg hover:bg-iosRed-dark text-ios-body font-medium ios-press"
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
            <h2 className="text-ios-title2 font-semibold text-gray-900 mb-6">
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
                    <div key={request.id} className="bg-iosBg-secondary border border-iosGray-4 rounded-ios-xl p-5 shadow-ios">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-ios-headline font-semibold text-gray-900 mb-2">
                            {otherUser?.profile?.firstName} {otherUser?.profile?.lastName}
                          </h3>
                          <p className="text-ios-subhead text-iosGray-1 mb-1">
                            Status: <span className="font-medium">{request.connectionStatus.replace('_', ' ').toUpperCase()}</span>
                          </p>
                          <p className="text-ios-footnote text-iosGray-2">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {(request.connectionStatus === 'accepted' || 
                            request.connectionStatus === 'questionnaire_sent' ||
                            request.connectionStatus === 'questionnaire_completed') && (
                            <Link
                              href={`/messaging/questionnaire/${request.id}`}
                              className={`px-5 py-2.5 text-white rounded-ios-lg hover:opacity-90 text-ios-body font-medium ios-press text-center ${
                                request.connectionStatus === 'questionnaire_sent' 
                                  ? 'bg-iosOrange animate-pulse shadow-ios' 
                                  : request.connectionStatus === 'questionnaire_completed'
                                  ? 'bg-iosGreen shadow-ios'
                                  : 'bg-iosBlue shadow-ios'
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
                              className="px-5 py-2.5 bg-iosBlue text-white rounded-ios-lg hover:bg-iosBlue-dark text-ios-body font-medium ios-press text-center shadow-ios"
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