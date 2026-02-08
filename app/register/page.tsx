'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { useTranslation } from '@/components/LanguageProvider'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    age: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [acceptedPolicies, setAcceptedPolicies] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!acceptedPolicies) {
      setError(t('auth.mustAcceptTerms'))
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordsDontMatch'))
      return
    }

    if (formData.password.length < 8) {
      setError(t('auth.passwordTooShort'))
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          gender: formData.gender || undefined,
          age: formData.age ? parseInt(formData.age) : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('auth.registrationFailed'))
        return
      }

      // Automatically log in the user after registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        // If auto-login fails, still redirect to login page
        router.push('/login?email=' + encodeURIComponent(formData.email))
        return
      }

      // No OTP/email/phone verification step – go straight into the app
      router.push('/profile/create')
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8">
      <AnimatedBackground intensity="subtle" />
      <div className="max-w-md w-full space-y-8 relative z-10 bg-white/95 backdrop-blur-ios-lg rounded-ios-xl p-8 shadow-ios-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register')} {t('common.to')} Baraqah
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.createAccount')} {t('common.to')} {t('common.begin')} {t('common.your')} {t('common.journey')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.email')} *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                placeholder={t('auth.email')}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.phone')} ({t('common.optional')})
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                placeholder={t('auth.phone')}
              />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.gender')} ({t('common.optional')})
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
              >
                <option value="">{t('common.select')} {t('profile.gender')} ({t('common.optional')})</option>
                <option value="male">{t('profile.male')}</option>
                <option value="female">{t('profile.female')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                {t('profile.age')} ({t('common.optional')})
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                placeholder={t('profile.age')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.password')} *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                placeholder={t('auth.passwordTooShort')}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                {t('auth.confirmPassword')} *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white"
                placeholder={t('auth.confirmPassword')}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start space-x-2 text-xs text-gray-600">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
                required
              />
              <span>
                {t('auth.acceptTerms')}
              </span>
            </label>

            <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.register')}
            </button>
          </div>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t('auth.alreadyHaveAccount')} </span>
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t('auth.signIn')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}