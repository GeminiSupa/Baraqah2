'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useTranslation } from '@/components/LanguageProvider'

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    bio: '',
    education: '',
    profession: '',
    location: '',
    sectPreference: '',
    prayerPractice: '',
    hijabPreference: '',
    photoPrivacy: 'private',
    profileVisibility: 'public',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        const profile = data.profile
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          age: profile.age?.toString() || '',
          gender: profile.gender || '',
          bio: profile.bio || '',
          education: profile.education || '',
          profession: profile.profession || '',
          location: profile.location || '',
          sectPreference: profile.sectPreference || '',
          prayerPractice: profile.prayerPractice || '',
          hijabPreference: profile.hijabPreference || '',
          photoPrivacy: profile.photoPrivacy || 'private',
          profileVisibility: profile.profileVisibility || 'public',
        })
        setPhotos(profile.photos || [])
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('isPrimary', photos.length === 0 ? 'true' : 'false')
      formData.append('privacy', 'private')

      const response = await fetch('/api/upload/photo', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || data.message || 'Upload failed'
        console.error('Upload error:', errorMessage, data)
        setError(errorMessage + (data.details ? ` (${data.details})` : ''))
        return
      }

      setSuccess('Photo uploaded successfully')
      // Refresh photos list
      await fetchProfile()
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload exception:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSetPrimary = async (photoId: string) => {
    setProcessing(photoId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'set-primary' }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = data.error || 'Failed to set photo as primary'
        console.error('Set primary error:', errorMessage, data)
        setError(errorMessage)
        return
      }

      setSuccess('Photo set as primary successfully')
      // Refresh photos list
      await fetchProfile()
      // Trigger header refresh
      window.dispatchEvent(new Event('profile-photo-updated'))
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Set primary exception:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return
    }

    setProcessing(photoId)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to delete photo')
        return
      }

      setSuccess('Photo deleted successfully')
      // Refresh photos list
      await fetchProfile()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Delete photo error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setProcessing(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('profile.updateProfileFailed'))
        return
      }

      router.push('/profile')
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('profile.editProfile')}</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.photos')}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative h-32 md:h-40 rounded-lg overflow-hidden border-2 border-gray-200 group">
                  <OptimizedImage
                    src={photo.url}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  {photo.isPrimary && (
                    <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-semibold z-10 shadow-md">
                      ✓ {t('profile.primaryPhoto')}
                    </span>
                  )}
                  {/* Action buttons - always visible on mobile, hover on desktop */}
                  <div className="absolute inset-0 bg-black/60 md:bg-black/50 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-10 p-2">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(photo.id)}
                        disabled={processing === photo.id}
                        className="w-full md:w-auto px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                        title={t('profile.setAsPrimary')}
                      >
                        {processing === photo.id ? t('common.loading') : t('profile.setAsPrimary')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={processing === photo.id}
                      className="w-full md:w-auto px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
                      title={t('profile.deletePhoto')}
                    >
                      {processing === photo.id ? t('common.loading') : t('common.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 mb-2">
                {t('profile.uploadPhoto')}
              </label>
              <input
                type="file"
                id="photo-upload"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
              />
              {uploading && <p className="mt-2 text-sm text-gray-600">{t('common.upload')}...</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Same form fields as create page */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio / About Me
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Islamic/Cultural Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sectPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    Sect Preference
                  </label>
                  <select
                    id="sectPreference"
                    name="sectPreference"
                    value={formData.sectPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select preference</option>
                    <option value="sunni">Sunni</option>
                    <option value="shia">Shia</option>
                    <option value="no-preference">No Preference</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prayerPractice" className="block text-sm font-medium text-gray-700 mb-1">
                    Prayer Practice
                  </label>
                  <select
                    id="prayerPractice"
                    name="prayerPractice"
                    value={formData.prayerPractice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select practice</option>
                    <option value="regular">Regular</option>
                    <option value="sometimes">Sometimes</option>
                    <option value="special-occasions">Special Occasions</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hijabPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    Hijab Preference (for matches)
                  </label>
                  <select
                    id="hijabPreference"
                    name="hijabPreference"
                    value={formData.hijabPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select preference</option>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                    <option value="no-preference">No Preference</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="photoPrivacy" className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Privacy
                  </label>
                  <select
                    id="photoPrivacy"
                    name="photoPrivacy"
                    value={formData.photoPrivacy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="verified-only">Verified Users Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    id="profileVisibility"
                    name="profileVisibility"
                    value={formData.profileVisibility}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="verified-only">Verified Users Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}