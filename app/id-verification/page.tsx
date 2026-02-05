'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function IDVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [idVerified, setIdVerified] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.idVerified) {
      setIdVerified(true)
    }
  }, [session])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Only PDF, JPG, and PNG are allowed.')
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 5MB limit.')
        return
      }

      setFile(selectedFile)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/id-document', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setSuccess(true)
      setFile(null)
      
      // Reset form
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (idVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">ID Verified</h2>
            <p>Your identity has been verified. You can now create your profile.</p>
            <button
              onClick={() => router.push('/profile/create')}
              className="mt-4 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Identity Verification</h1>
          <p className="text-gray-600 mb-6">
            To ensure the safety and authenticity of our matrimony platform, please upload a
            government-issued ID document (passport, national ID, driver&apos;s license, etc.) for verification.
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              ID document uploaded successfully. Your document is under review and you will be notified once verified.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                Upload ID Document *
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Accepted formats: PDF, JPG, PNG. Maximum file size: 5MB
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
              <strong>Privacy Notice:</strong> Your ID document will be securely stored and only used for
              verification purposes. Once verified, access to the document is restricted to administrators only.
            </div>

            <div>
              <button
                type="submit"
                disabled={uploading || !file}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}