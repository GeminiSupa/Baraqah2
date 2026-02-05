'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function ConnectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const requestId = params.requestId as string
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [connected, setConnected] = useState(false)

  const handleConnect = useCallback(async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/messaging/request/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionStatus: 'connected' }),
      })

      const data = await response.json()

      if (response.ok) {
        setConnected(true)
        // Redirect to messaging after 2 seconds
        setTimeout(() => {
          router.push(`/messaging/${data.request.senderId === session?.user?.id ? data.request.receiverId : data.request.senderId}`)
        }, 2000)
      } else {
        setError(data.error || 'Failed to connect')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(false)
      setLoading(false)
    }
  }, [requestId, router, session?.user?.id])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      handleConnect()
    }
  }, [status, router, handleConnect])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8 text-center">
          {connected ? (
            <>
              <div className="mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connected!</h1>
              <p className="text-gray-600 mb-6">
                You are now connected. Redirecting to messaging...
              </p>
            </>
          ) : error ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connection Failed</h1>
              <p className="text-red-600 mb-6">{error}</p>
              <Link
                href="/messaging"
                className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Back to Messages
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Connecting...</h1>
              <p className="text-gray-600">
                {processing ? 'Establishing connection...' : 'Please wait...'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
