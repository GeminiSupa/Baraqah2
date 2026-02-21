'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useTranslation } from '@/components/LanguageProvider'
import { useConfirm } from '@/components/ui/Confirm'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfileSchema, type ProfileFormValues } from '@/lib/validation/profile'
import { FormField } from '@/components/Form/FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { PageLayout } from '@/components/layout/PageLayout'

export default function EditProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const { confirm } = useConfirm()
  const schema = useMemo(() => createProfileSchema(t), [t])
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 18,
      gender: 'male',
      bio: '',
      education: '',
      profession: '',
      location: '',
      city: '',
      sectPreference: '',
      prayerPractice: '',
      hijabPreference: '',
      photoPrivacy: 'private',
      profileVisibility: 'public',
    },
    mode: 'onBlur',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [photos, setPhotos] = useState<Array<{ id: string; url: string; isPrimary: boolean }>>([])
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        const profile = data.profile
        form.reset({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age, 10) || 18,
          gender: profile.gender === 'female' ? 'female' : 'male',
          bio: profile.bio || '',
          education: profile.education || '',
          profession: profile.profession || '',
          location: profile.location || '',
          city: profile.city || '',
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
  }, [form])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router, fetchProfile])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError(t('validation.fileSizeExceeded', { max: '5MB' }))
      e.target.value = ''
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')
    const preview = URL.createObjectURL(file)
    setPhotoPreviewUrl(preview)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('isPrimary', photos.length === 0 ? 'true' : 'false')
      formData.append('privacy', form.getValues('photoPrivacy') || 'private')

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

      setSuccess(t('profile.photoUploadSuccess'))
      // Refresh photos list
      await fetchProfile()
      
      // Reset file input
      e.target.value = ''
    } catch (error) {
      console.error('Upload exception:', error)
      setError(error instanceof Error ? error.message : 'An error occurred. Please try again.')
    } finally {
      setUploading(false)
      if (preview) URL.revokeObjectURL(preview)
      setPhotoPreviewUrl(null)
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

      setSuccess(t('profile.photoSetPrimarySuccess'))
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
    const ok = await confirm({
      title: t('profile.deletePhoto'),
      description: t('profile.deletePhotoConfirm'),
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    })
    if (!ok) return

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

      setSuccess(t('profile.photoDeleteSuccess'))
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

  const onSubmit = async (values: ProfileFormValues) => {
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
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
    <PageLayout containerClassName="max-w-4xl">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <Card>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('profile.editProfile')}</h1>
          <p className="text-base text-gray-600 mb-6">{t('profile.updateProfileDescription')}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-ios mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-ios mb-4">
              {success}
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="mb-8 border-b pb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.photos')}</h2>
            {photoPreviewUrl && (
              <div className="mb-4">
                <p className="text-sm text-iosGray-1 mb-2">{t('profile.photoPreview')}</p>
                <div className="relative w-32 h-32 rounded-ios overflow-hidden border border-iosGray-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreviewUrl} alt={t('profile.photoPreview')} className="w-full h-full object-cover" />
                </div>
              </div>
            )}
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

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField name="firstName" label={t('profile.firstName')} required placeholder={t('profile.firstName')} />
                <FormField name="lastName" label={t('profile.lastName')} required placeholder={t('profile.lastName')} />
                <FormField name="age" type="number" label={t('profile.age')} required />
                <FormField
                  name="gender"
                  as="select"
                  label={t('profile.gender')}
                  required
                  options={[
                    { value: 'male', label: t('profile.male') },
                    { value: 'female', label: t('profile.female') },
                  ]}
                />
                <FormField name="education" label={t('profile.education')} placeholder={t('profile.education')} />
                <FormField name="profession" label={t('profile.profession')} placeholder={t('profile.profession')} />
                <FormField name="location" label={t('profile.location')} placeholder={t('profile.location')} />
                <FormField name="city" label={t('profile.city')} required placeholder={t('profile.city')} />
              </div>

              <FormField
                name="bio"
                as="textarea"
                label={`${t('profile.bio')} / ${t('profile.aboutMe')}`}
                placeholder={t('profile.tellAboutYourself')}
              />

              <div className="border-t border-iosGray-5 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.islamicPreferences')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="sectPreference"
                    as="select"
                    label={t('profile.sectPreference')}
                    options={[
                      { value: 'sunni', label: t('profile.sunni') },
                      { value: 'shia', label: t('profile.shia') },
                      { value: 'no-preference', label: t('profile.noPreference') },
                    ]}
                  />
                  <FormField
                    name="prayerPractice"
                    as="select"
                    label={t('profile.prayerPractice')}
                    options={[
                      { value: 'regular', label: t('profile.regular') },
                      { value: 'sometimes', label: t('profile.sometimes') },
                      { value: 'special-occasions', label: t('profile.specialOccasions') },
                    ]}
                  />
                  <FormField
                    name="hijabPreference"
                    as="select"
                    label={t('profile.hijabPreference')}
                    options={[
                      { value: 'required', label: t('profile.required') },
                      { value: 'preferred', label: t('profile.preferred') },
                      { value: 'no-preference', label: t('profile.noPreference') },
                    ]}
                  />
                </div>
              </div>

              <div className="border-t border-iosGray-5 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.privacySettings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="photoPrivacy"
                    as="select"
                    label={t('profile.photoPrivacy')}
                    options={[
                      { value: 'private', label: t('profile.private') },
                      { value: 'public', label: t('profile.public') },
                      { value: 'verified-only', label: t('profile.verifiedUsersOnly') },
                    ]}
                  />
                  <FormField
                    name="profileVisibility"
                    as="select"
                    label={t('profile.profileVisibility')}
                    options={[
                      { value: 'public', label: t('profile.public') },
                      { value: 'private', label: t('profile.private') },
                      { value: 'verified-only', label: t('profile.verifiedUsersOnly') },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => router.push('/profile')} fullWidth>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" type="submit" loading={saving} fullWidth>
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </PageLayout>
  )
}