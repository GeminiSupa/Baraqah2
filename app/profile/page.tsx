'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { calculateProfileCompleteness } from '@/lib/profile-completeness'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { OptimizedImage } from '@/components/OptimizedImage'
import { useTranslation } from '@/components/LanguageProvider'

interface Profile {
  id: string
  firstName: string
  lastName: string
  age: number
  gender: string
  bio?: string
  education?: string
  profession?: string
  location?: string
  city?: string
  sectPreference?: string
  prayerPractice?: string
  hijabPreference?: string
  photoPrivacy: string
  profileVisibility: string
  photos: Array<{
    id: string
    url: string
    isPrimary: boolean
    privacy: string
  }>
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/profile')
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
      } else if (response.status === 404) {
        // Profile doesn't exist, redirect to create
        router.push('/profile/create')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Prevent admins from accessing user profile pages
      if (session?.user?.isAdmin) {
        router.push('/admin')
        return
      }
      fetchProfile()
    }
  }, [status, session, router, fetchProfile])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-iosBg-secondary flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0]
  const completeness = calculateProfileCompleteness(profile)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-20 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Profile Completeness */}
        {completeness.percentage < 100 && (
          <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.completeness')}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {t('profile.completeYourProfile')}
                </p>
              </div>
              <Badge variant={completeness.percentage >= 80 ? 'success' : completeness.percentage >= 50 ? 'warning' : 'danger'}>
                {completeness.percentage}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${completeness.percentage}%`,
                  backgroundColor: completeness.percentage >= 80 ? '#10b981' : completeness.percentage >= 50 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            {completeness.missingFields.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Missing fields:</p>
                <div className="flex flex-wrap gap-2">
                  {completeness.missingFields.slice(0, 5).map((field) => (
                    <Badge key={field} variant="default" size="sm">
                      {field}
                    </Badge>
                  ))}
                  {completeness.missingFields.length > 5 && (
                    <Badge variant="default" size="sm">
                      +{completeness.missingFields.length - 5} more
                    </Badge>
                  )}
                </div>
                <Link href="/profile/edit" className="mt-4 inline-block">
                  <Button variant="primary" size="sm" className="font-semibold">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        {/* Elegant Profile Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
          {/* Profile header with banner photo */}
          <div className="relative">
            {primaryPhoto && (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <OptimizedImage
                  src={primaryPhoto.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    {session?.user?.idVerified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                        <span className="mr-1">✓</span> {t('profile.verifiedId')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">
                        {t('profile.notVerified')}
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gray-600 font-medium">
                    {profile.age} {t('common.years')} {t('common.old')}
                    {profile.city ? ` • ${profile.city}` : profile.location ? ` • ${profile.location}` : ''}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  {!session?.user?.idVerified && (
                    <Link href="/id-verification" className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        size="md"
                        className="w-full sm:w-auto font-semibold"
                      >
                        {t('profile.verifyMyId')}
                      </Button>
                    </Link>
                  )}
                  <Link href="/profile/edit" className="w-full sm:w-auto">
                    <Button variant="ghost" size="md" className="w-full sm:w-auto font-semibold">
                      {t('profile.editProfile')}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Quick info chips - More Elegant */}
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.profession && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                    💼 {profile.profession}
                  </span>
                )}
                {profile.education && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                    🎓 {profile.education}
                  </span>
                )}
                {profile.sectPreference && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-100">
                    {profile.sectPreference.replace('-', ' ')}
                  </span>
                )}
              </div>

              {/* About */}
              {profile.bio && (
                <div className="mb-6">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">{t('profile.aboutMe')}</h2>
                  <p className="text-base text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                {profile.location && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-base text-gray-900 font-medium">{profile.location}</p>
                  </div>
                )}
                {profile.prayerPractice && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prayer Practice</p>
                    <p className="text-base text-gray-900 font-medium capitalize">
                      {profile.prayerPractice.replace('-', ' ')}
                    </p>
                  </div>
                )}
                {profile.hijabPreference && (
                  <div className="p-4 bg-gray-50 rounded-2xl">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Hijab Preference</p>
                    <p className="text-base text-gray-900 font-medium capitalize">
                      {profile.hijabPreference.replace('-', ' ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-gray-200 flex justify-between items-center gap-3 flex-col sm:flex-row">
                <p className="text-sm text-gray-600">
                  Control who can see your photos and profile details.
                </p>
                <Link href="/settings/privacy">
                  <Button variant="ghost" size="sm" className="font-semibold">
                    Privacy Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}