'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/LanguageProvider'

export default function CreateProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
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
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
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
        setError(data.error || t('profile.createProfileFailed'))
        return
      }

      router.push('/profile')
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('profile.createProfile')}</h1>
          <p className="text-base text-gray-600 mb-6">
            {t('profile.buildProfile')}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={session?.user?.email || ''}
                  disabled
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">{t('profile.registeredEmail')}</p>
              </div>

              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.firstName')} *
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
                  {t('profile.lastName')} *
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
                  {t('profile.age')} *
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
                  {t('profile.gender')} *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                >
                  <option value="">{t('common.select')} {t('profile.gender')}</option>
                  <option value="male">{t('profile.male')}</option>
                  <option value="female">{t('profile.female')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.education')}
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder={t('profile.education')}
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.profession')}
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder={t('profile.profession')}
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder={t('profile.location')}
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('profile.city')} *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder={t('profile.city')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.bio')} / {t('profile.aboutMe')}
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                placeholder={t('profile.tellAboutYourself')}
              />
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('profile.islamicPreferences')} ({t('common.optional')})</h2>
              <p className="text-sm text-gray-600 mb-4">
                {t('profile.preferencesOptional')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sectPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.sectPreference')}
                  </label>
                  <select
                    id="sectPreference"
                    name="sectPreference"
                    value={formData.sectPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">{t('common.select')} {t('profile.preference')} ({t('common.optional')})</option>
                    <option value="sunni">{t('profile.sunni')}</option>
                    <option value="shia">{t('profile.shia')}</option>
                    <option value="no-preference">{t('profile.noPreference')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="prayerPractice" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.prayerPractice')}
                  </label>
                  <select
                    id="prayerPractice"
                    name="prayerPractice"
                    value={formData.prayerPractice}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">{t('common.select')} {t('profile.practice')} ({t('common.optional')})</option>
                    <option value="regular">{t('profile.regular')}</option>
                    <option value="sometimes">{t('profile.sometimes')}</option>
                    <option value="special-occasions">{t('profile.specialOccasions')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="hijabPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.hijabPreference')}
                  </label>
                  <select
                    id="hijabPreference"
                    name="hijabPreference"
                    value={formData.hijabPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">{t('common.select')} {t('profile.preference')} ({t('common.optional')})</option>
                    <option value="required">{t('profile.required')}</option>
                    <option value="preferred">{t('profile.preferred')}</option>
                    <option value="no-preference">{t('profile.noPreference')}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.privacySettings')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="photoPrivacy" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.photoPrivacy')}
                  </label>
                  <select
                    id="photoPrivacy"
                    name="photoPrivacy"
                    value={formData.photoPrivacy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="private">{t('profile.private')}</option>
                    <option value="public">{t('profile.public')}</option>
                    <option value="verified-only">{t('profile.verifiedUsersOnly')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.profileVisibility')}
                  </label>
                  <select
                    id="profileVisibility"
                    name="profileVisibility"
                    value={formData.profileVisibility}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="public">{t('profile.public')}</option>
                    <option value="private">{t('profile.private')}</option>
                    <option value="verified-only">{t('profile.verifiedUsersOnly')}</option>
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
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('profile.createProfile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}