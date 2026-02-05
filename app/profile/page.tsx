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
      fetchProfile()
    }
  }, [status, router, fetchProfile])

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

  const primaryPhoto = profile.photos.find(p => p.isPrimary)
  const completeness = calculateProfileCompleteness(profile)

  return (
    <div className="min-h-screen bg-iosBg-secondary py-4 md:py-8 px-4 safe-top safe-bottom pb-20 md:pb-8 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Profile Completeness */}
        {completeness.percentage < 100 && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-ios-title3 font-semibold text-gray-900">Profile Completeness</h2>
                <p className="text-ios-subhead text-iosGray-1 mt-1">
                  Complete your profile to get better matches
                </p>
              </div>
              <Badge variant={completeness.percentage >= 80 ? 'success' : completeness.percentage >= 50 ? 'warning' : 'danger'}>
                {completeness.percentage}%
              </Badge>
            </div>
            <div className="w-full bg-iosGray-5 rounded-ios-full h-2 mb-4">
              <div
                className="h-2 rounded-ios-full transition-all duration-300"
                style={{
                  width: `${completeness.percentage}%`,
                  backgroundColor: completeness.percentage >= 80 ? '#34C759' : completeness.percentage >= 50 ? '#FF9500' : '#FF3B30',
                }}
              />
            </div>
            {completeness.missingFields.length > 0 && (
              <div>
                <p className="text-ios-footnote text-iosGray-1 mb-2">Missing fields:</p>
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
                  <Button variant="primary" size="sm">
                    Complete Profile
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}

        <Card className="overflow-hidden">
          {/* Profile header with banner photo */}
          <div className="relative">
            {primaryPhoto && (
              <div className="w-full h-56 md:h-64 bg-iosGray-5 relative overflow-hidden">
                <OptimizedImage
                  src={primaryPhoto.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h1 className="text-ios-title1 font-bold text-gray-900 mb-1">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  <p className="text-ios-body text-iosGray-1">
                    {profile.age} years old
                    {profile.city ? ` • ${profile.city}` : profile.location ? ` • ${profile.location}` : ''}
                  </p>
                </div>
                <Link href="/profile/edit" className="w-full sm:w-auto">
                  <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                </Link>
              </div>

              {/* Quick info chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.profession && (
                  <Badge variant="default" size="sm">
                    {profile.profession}
                  </Badge>
                )}
                {profile.education && (
                  <Badge variant="default" size="sm">
                    {profile.education}
                  </Badge>
                )}
                {profile.sectPreference && (
                  <Badge variant="default" size="sm">
                    {profile.sectPreference.replace('-', ' ')}
                  </Badge>
                )}
              </div>

              {/* About */}
              {profile.bio && (
                <div className="mb-6">
                  <h2 className="text-ios-title3 font-semibold text-gray-900 mb-2">About Me</h2>
                  <p className="text-ios-body text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {profile.location && (
                  <div>
                    <p className="text-ios-footnote font-medium text-iosGray-1 mb-1">Location</p>
                    <p className="text-ios-body text-gray-900">{profile.location}</p>
                  </div>
                )}
                {profile.prayerPractice && (
                  <div>
                    <p className="text-ios-footnote font-medium text-iosGray-1 mb-1">Prayer Practice</p>
                    <p className="text-ios-body text-gray-900 capitalize">
                      {profile.prayerPractice.replace('-', ' ')}
                    </p>
                  </div>
                )}
                {profile.hijabPreference && (
                  <div>
                    <p className="text-ios-footnote font-medium text-iosGray-1 mb-1">Hijab Preference</p>
                    <p className="text-ios-body text-gray-900 capitalize">
                      {profile.hijabPreference.replace('-', ' ')}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-iosGray-4 flex justify-between items-center gap-3 flex-col sm:flex-row">
                <p className="text-ios-footnote text-iosGray-1">
                  Control who can see your photos and profile details.
                </p>
                <Link href="/settings/privacy">
                  <Button variant="ghost" size="sm">
                    Privacy Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </div>
  )
}