'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { OptimizedImage } from '@/components/OptimizedImage'

interface Profile {
  id: string
  userId: string
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
  idVerified?: boolean
  photos: Array<{
    id: string
    url: string
    isPrimary: boolean
    privacy: string
  }>
  // Questionnaire fields
  marriageUnderstanding?: string
  lifeGoals?: string
  religiousPracticeImportance?: string
  childrenPreference?: string
  partnerTraits?: string
  marriageRoles?: string
  workLifeBalance?: string
  conflictResolution?: string
  happyHomeVision?: string
  dealBreakers?: string
  spiritualGrowth?: string
  hobbiesInterests?: string
}

export default function ProfileViewPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const userId = params?.userId as string
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`/api/profile/view/${userId}`)
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfile(data.profile)
      } else {
        setError(data.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('An error occurred while loading the profile')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && userId) {
      fetchProfile()
    }
  }, [status, userId, router, fetchProfile])

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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom relative">
        <div className="max-w-2xl mx-auto">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-iosRed text-5xl mb-4">⚠️</div>
              <h1 className="text-ios-title2 font-bold text-gray-900 mb-2">Unable to Load Profile</h1>
              <p className="text-ios-body text-iosGray-1 mb-6">{error || 'Profile not found'}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="ghost" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button variant="primary" onClick={() => router.push('/browse')}>
                  Browse Profiles
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0]
  const otherPhotos = profile.photos.filter(p => p.id !== primaryPhoto?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-20 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      {/* Header with Back Button */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-ios border-b border-iosGray-4 safe-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-3 p-2 -ml-2 ios-press rounded-ios"
            aria-label="Go back"
          >
            <svg className="w-6 h-6 text-iosGray-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900 flex-1">Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 overflow-hidden">
          {/* Profile Header */}
          <div className="relative">
            {primaryPhoto && (
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                <OptimizedImage
                  src={primaryPhoto.url}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            )}
            <div className="p-6 md:p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    {profile.idVerified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                        <span className="mr-1">✓</span> Verified ID
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-semibold border border-gray-200">
                        Not verified
                      </span>
                    )}
                  </div>
                  <p className="text-base text-gray-600 font-medium">
                    {profile.age} years old{profile.city ? ` • ${profile.city}` : ''}
                  </p>
                </div>
              </div>

              {/* Quick Info Badges */}
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

              {/* Other Photos */}
              {otherPhotos.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-ios-subhead font-medium text-gray-900 mb-3">More Photos</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {otherPhotos.slice(0, 6).map((photo) => (
                      <div key={photo.id} className="aspect-square bg-iosGray-5 rounded-ios overflow-hidden">
                        <OptimizedImage
                          src={photo.url}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="mb-6">
                  <h3 className="text-ios-title3 font-semibold text-gray-900 mb-2">About</h3>
                  <p className="text-ios-body text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Details Grid */}
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
                    <p className="text-ios-body text-gray-900 capitalize">{profile.prayerPractice.replace('-', ' ')}</p>
                  </div>
                )}
                {profile.hijabPreference && (
                  <div>
                    <p className="text-ios-footnote font-medium text-iosGray-1 mb-1">Hijab Preference</p>
                    <p className="text-ios-body text-gray-900 capitalize">{profile.hijabPreference.replace('-', ' ')}</p>
                  </div>
                )}
              </div>

              {/* Questionnaire Section */}
              {(profile.marriageUnderstanding || profile.lifeGoals || profile.partnerTraits) && (
                <div className="border-t border-iosGray-4 pt-6">
                  <h3 className="text-ios-title3 font-semibold text-gray-900 mb-4">Questionnaire Answers</h3>
                  <div className="space-y-6">
                    {profile.marriageUnderstanding && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Marriage Understanding</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.marriageUnderstanding}</p>
                      </div>
                    )}
                    {profile.lifeGoals && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Life Goals</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.lifeGoals}</p>
                      </div>
                    )}
                    {profile.religiousPracticeImportance && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Religious Practice</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.religiousPracticeImportance}</p>
                      </div>
                    )}
                    {profile.childrenPreference && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Children Preference</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.childrenPreference}</p>
                      </div>
                    )}
                    {profile.partnerTraits && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Partner Traits</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.partnerTraits}</p>
                      </div>
                    )}
                    {profile.marriageRoles && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Marriage Roles</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.marriageRoles}</p>
                      </div>
                    )}
                    {profile.workLifeBalance && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Work-Life Balance</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.workLifeBalance}</p>
                      </div>
                    )}
                    {profile.conflictResolution && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Conflict Resolution</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.conflictResolution}</p>
                      </div>
                    )}
                    {profile.happyHomeVision && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Happy Home Vision</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.happyHomeVision}</p>
                      </div>
                    )}
                    {profile.dealBreakers && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Deal Breakers</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.dealBreakers}</p>
                      </div>
                    )}
                    {profile.spiritualGrowth && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Spiritual Growth</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.spiritualGrowth}</p>
                      </div>
                    )}
                    {profile.hobbiesInterests && (
                      <div>
                        <p className="text-ios-footnote font-medium text-iosGray-1 mb-2">Hobbies & Interests</p>
                        <p className="text-ios-body text-gray-700 leading-relaxed">{profile.hobbiesInterests}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
