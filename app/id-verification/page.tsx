'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/LanguageProvider'
import { PageLayout } from '@/components/layout/PageLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AnimatedBackground } from '@/components/AnimatedBackground'

export default function IDVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
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
      // Get file extension as fallback for camera photos
      const fileName = selectedFile.name.toLowerCase()
      const fileExtension = fileName.split('.').pop()
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']
      
      // Validate file type - check both MIME type and extension
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      const isValidType = allowedTypes.includes(selectedFile.type) || 
                         (fileExtension && allowedExtensions.includes(fileExtension))
      
      if (!isValidType) {
        setError(
          t('idVerification.invalidFileType', { type: selectedFile.type || t('common.unknown') })
        )
        return
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (selectedFile.size > maxSize) {
        setError(t('idVerification.fileSizeExceeded', { max: '5MB' }))
        return
      }

      setFile(selectedFile)
      setError('')
      setSuccess(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError(t('idVerification.selectFile'))
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
        const errorMessage = data.error || data.message || 'Upload failed'
        const errorDetails = data.details ? ` Details: ${JSON.stringify(data.details)}` : ''
        console.error('Upload error:', errorMessage, data)
        setError(`${errorMessage}${errorDetails}`)
        return
      }

      setSuccess(true)
      setFile(null)
      setError('')
      
      // Reset form
      const fileInput = document.getElementById('file') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error) {
      console.error('Upload exception:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  if (idVerified) {
    return (
      <PageLayout containerClassName="max-w-md">
        <AnimatedBackground intensity="subtle" />
        <div className="relative z-10 text-center">
          <Card>
            <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-5 rounded-ios">
              <h2 className="text-xl font-semibold mb-2">{t('idVerification.verifiedTitle')}</h2>
              <p className="text-sm text-green-700">{t('idVerification.verifiedDescription')}</p>
              <div className="mt-4">
                <Button onClick={() => router.push('/profile/create')} fullWidth>
                  {t('idVerification.createProfile')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout containerClassName="max-w-2xl">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <Card>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('idVerification.title')}</h1>
          <p className="text-base text-gray-600 mb-6">{t('idVerification.description')}</p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4">
              {t('idVerification.uploadSuccess')}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                {t('idVerification.uploadLabel')} *
              </label>
              <input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png,image/jpg"
                capture="environment"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-iosBlue file:text-white hover:file:bg-iosBlue-dark cursor-pointer"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                {t('idVerification.acceptedFormats')}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
              <strong>{t('idVerification.privacyNoticeTitle')}</strong> {t('idVerification.privacyNoticeBody')}
            </div>

            <div>
              <Button
                type="submit"
                disabled={uploading || !file}
                fullWidth
                loading={uploading}
              >
                {t('idVerification.uploadButton')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  )
}