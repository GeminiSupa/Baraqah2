'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

function VerifyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const email = searchParams.get('email') || ''
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email')
  const [otpSent, setOtpSent] = useState(false)
  const [devOtp, setDevOtp] = useState<string | null>(null)

  const sendOTP = useCallback(async () => {
    setSending(true)
    setError('')
    setOtpSent(false)
    setDevOtp(null)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: verificationType }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        return
      }

      setOtpSent(true)
      
      // In development, show OTP in console and UI
      if (data.otp) {
        setDevOtp(data.otp)
        console.log('🔐 OTP Code (Development):', data.otp)
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setSending(false)
    }
  }, [verificationType])

  // Send OTP when page loads or type changes
  useEffect(() => {
    if (status === 'authenticated' && !otpSent) {
      sendOTP()
    }
  }, [status, verificationType, otpSent, sendOTP])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = verificationType === 'email' ? '/api/auth/verify-email' : '/api/auth/verify-phone'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Verification failed')
        return
      }

      // Redirect to ID verification or profile setup
      router.push('/id-verification')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: 'email' | 'phone') => {
    setVerificationType(type)
    setOtpSent(false)
    setOtp('')
    setDevOtp(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify Your Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We&apos;ve sent a verification code to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          {status === 'unauthenticated' && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              Please log in first to verify your account.
            </div>
          )}

          <div className="flex justify-center space-x-4 mb-4">
            <button
              type="button"
              onClick={() => handleTypeChange('email')}
              disabled={sending}
              className={`px-4 py-2 rounded-md ${
                verificationType === 'email'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              } disabled:opacity-50`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('phone')}
              disabled={sending}
              className={`px-4 py-2 rounded-md ${
                verificationType === 'phone'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              } disabled:opacity-50`}
            >
              Phone
            </button>
          </div>

          {!otpSent && !sending && status === 'authenticated' && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
              Click the button below to send verification code.
            </div>
          )}

          {sending && (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded mb-4">
              Sending verification code...
            </div>
          )}

          {otpSent && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
              Verification code sent! Check your {verificationType}.
            </div>
          )}

          {devOtp && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              <strong>Development Mode:</strong> Your OTP is <strong>{devOtp}</strong>
            </div>
          )}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter verification code"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <button 
              type="button" 
              onClick={sendOTP}
              disabled={sending}
              className="text-primary-600 hover:text-primary-500 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  // Email/phone OTP verification has been disabled.
  // Keep this page as a simple redirect so old links don't break.
  if (typeof window !== 'undefined') {
    window.location.href = '/profile/create'
  }
  return null
}