'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslation } from '@/components/LanguageProvider'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? t('auth.invalidCredentials') : result.error)
      } else {
        // After successful sign-in:
        // - Admins go to admin dashboard
        // - Regular users go straight into the app (no email/SMS/ID gating)
        const sessionResponse = await fetch('/api/auth/session')
        const sessionData = await sessionResponse.json()

        if (sessionData?.user?.isAdmin) {
          router.push('/admin')
        } else if (sessionData?.user?.profileActive) {
          router.push('/browse')
        } else {
          router.push('/profile/create')
        }
        router.refresh()
      }
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative py-12 px-4 sm:px-6 lg:px-8 bg-[#f7f8ff]">
      {/* Background 3D illustration */}
      <Image
        src="/login-3d-bg.png"
        alt=""
        fill
        priority
        className="object-cover pointer-events-none select-none opacity-95"
      />
      <div className="max-w-md w-full space-y-8 relative z-10 bg-white/98 backdrop-blur-ios-lg rounded-ios-2xl p-8 sm:p-10 shadow-ios-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.login')} {t('common.to')} Baraqah
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            A respectful matrimony platform for the Muslim community
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('auth.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.email')}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder={t('auth.password')}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('auth.signIn')}
            </button>
          </div>

          <div className="text-center text-sm">
            <span className="text-gray-600">{t('auth.dontHaveAccount')} </span>
            <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
              {t('auth.register')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}