'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { OptimizedImage } from '@/components/OptimizedImage'
import { EmptyProfiles } from '@/components/ui/EmptyState'
import { useTranslation } from '@/components/LanguageProvider'

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
  idVerified?: boolean
  photos: Array<{ url: string; isPrimary: boolean }>
}

export default function BrowsePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
    city: '',
    education: '',
    profession: '',
    prayerPractice: '',
    sectPreference: '',
  })
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [requestMessage, setRequestMessage] = useState('')
  const [showRequestModal, setShowRequestModal] = useState(false)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })

      const response = await fetch(`/api/profile/browse?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Prevent admins from browsing profiles
      if (session?.user?.isAdmin) {
        router.push('/admin')
        return
      }
      fetchProfiles()
    }
  }, [status, session, router, fetchProfiles])

  const handleFilterChange = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  const handleApplyFilters = () => {
    setShowFilters(false)
    fetchProfiles()
  }

  const handleClearFilters = () => {
    setFilters({
      gender: '',
      minAge: '',
      maxAge: '',
      city: '',
      education: '',
      profession: '',
      prayerPractice: '',
      sectPreference: '',
    })
  }

  const handleSendRequest = async () => {
    if (!selectedProfile) return

    try {
      const response = await fetch('/api/messaging/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: selectedProfile.userId,
          message: requestMessage || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowRequestModal(false)
        setRequestMessage('')
        alert(t('messaging.requestSent'))
      } else {
        alert(data.error || 'Failed to send request')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  const handleFavorite = async (userId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        alert('Added to favorites!')
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
    }
  }

  const handleCloseModal = () => {
    setShowRequestModal(false)
    setRequestMessage('')
  }

  const handleNextProfile = () => {
    if (profiles.length === 0) return
    setCurrentIndex((prev) => (prev + 1) % profiles.length)
  }

  const handlePrevProfile = () => {
    if (profiles.length === 0) return
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-iosBg-secondary flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-24 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
          className="md:hidden mb-4 flex items-center text-gray-700 hover:text-gray-900 ios-press"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-base font-medium">{t('common.back')}</span>
        </button>
        
        {/* Header Section - Better Spacing & Alignment */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{t('browse.title')}</h1>
            <p className="text-base text-gray-500 font-medium">{t('browse.subtitle')}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold"
          >
            {showFilters ? t('browse.hideFilters') : t('browse.showFilters')}
          </Button>
        </div>

        {/* Advanced Filters - Better Design */}
        {showFilters && (
          <Card className="mb-8 shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('browse.advancedFilters')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <Select
                label={t('profile.gender')}
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                options={[
                  { value: '', label: t('common.all') },
                  { value: 'male', label: t('profile.male') },
                  { value: 'female', label: t('profile.female') },
                ]}
              />

              <Input
                label={t('browse.minAge')}
                type="number"
                min="18"
                max="100"
                value={filters.minAge}
                onChange={(e) => handleFilterChange('minAge', e.target.value)}
                placeholder="18"
              />

              <Input
                label={t('browse.maxAge')}
                type="number"
                min="18"
                max="100"
                value={filters.maxAge}
                onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                placeholder="100"
              />

              <Input
                label={t('profile.city')}
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder={t('browse.enterCity')}
              />

              <Input
                label={t('profile.education')}
                value={filters.education}
                onChange={(e) => handleFilterChange('education', e.target.value)}
                placeholder={t('profile.education')}
              />

              <Input
                label={t('profile.profession')}
                value={filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
                placeholder={t('profile.profession')}
              />

              <Select
                label={t('profile.prayerPractice')}
                value={filters.prayerPractice}
                onChange={(e) => handleFilterChange('prayerPractice', e.target.value)}
                options={[
                  { value: '', label: t('common.all') },
                  { value: 'regular', label: t('profile.regular') },
                  { value: 'occasional', label: t('browse.occasional') },
                  { value: 'rarely', label: t('browse.rarely') },
                ]}
              />

              <Select
                label={t('profile.sectPreference')}
                value={filters.sectPreference}
                onChange={(e) => handleFilterChange('sectPreference', e.target.value)}
                options={[
                  { value: '', label: t('common.all') },
                  { value: 'sunni', label: t('profile.sunni') },
                  { value: 'shia', label: t('profile.shia') },
                  { value: 'other', label: t('profile.other') },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
              <Button variant="primary" onClick={handleApplyFilters} className="flex-1 sm:flex-none font-semibold">
                {t('browse.applyFilters')}
              </Button>
              <Button variant="ghost" onClick={handleClearFilters} className="flex-1 sm:flex-none font-medium">
                {t('browse.clearFilters')}
              </Button>
            </div>
          </Card>
        )}

        {/* Elegant Profile Card - Redesigned */}
        <div className="flex flex-col items-center justify-center mt-8 md:mt-12">
          {profiles.length > 0 ? (
            (() => {
              const profile = profiles[currentIndex]
              const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0]
              return (
                <div className="w-full max-w-lg mx-auto">
                  {/* Profile Counter - Elegant Top Badge */}
                  <div className="flex justify-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
                      <span className="text-xs font-medium text-gray-600">
                        {t('browse.profile')} {currentIndex + 1} {t('browse.of')} {profiles.length}
                      </span>
                    </div>
                  </div>

                  {/* Main Card - Soft, Elegant Design */}
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100/50">
                    {/* Photo Section - Better Proportions */}
                    {primaryPhoto && (
                      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        <OptimizedImage
                          src={primaryPhoto.url}
                          alt={`${profile.firstName} ${profile.lastName}`}
                          fill
                          className="object-cover"
                        />
                        {/* Gradient Overlay for Better Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* Content Section - Better Spacing & Typography */}
                    <div className="px-6 py-6 space-y-4">
                      {/* Name & Basic Info - Better Hierarchy */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {profile.firstName} {profile.lastName}
                          </h3>
                          {profile.idVerified ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                              <span className="mr-1">✓</span> {t('profile.verifiedId')}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
                              {t('profile.notVerified')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          {profile.age} {t('common.years')} {t('common.old')} • {profile.gender === 'male' ? t('profile.male') : t('profile.female')}
                          {profile.city && ` • ${profile.city}`}
                        </p>
                      </div>

                      {/* Bio - Better Readability */}
                      {profile.bio && (
                        <p className="text-base text-gray-700 leading-relaxed line-clamp-3">
                          {profile.bio}
                        </p>
                      )}

                      {/* Tags - More Elegant Design */}
                      {(profile.profession || profile.education) && (
                        <div className="flex flex-wrap gap-2 pt-2">
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
                        </div>
                      )}

                      {/* Action Buttons - Proportional to Card Width */}
                      <div className="pt-4 space-y-3">
                        {/* Primary Actions - Centered & Balanced */}
                        <div className="flex items-center gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={handlePrevProfile}
                            className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 ios-press text-gray-600 transition-all shadow-sm"
                            aria-label="Previous profile"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          <Button
                            variant="secondary"
                            size="md"
                            onClick={handleNextProfile}
                            className="flex-1 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 font-semibold"
                          >
                            {t('browse.skip')}
                          </Button>
                          
                          <Button
                            variant="primary"
                            size="md"
                            onClick={() => {
                              setSelectedProfile(profile)
                              setShowRequestModal(true)
                            }}
                            className="flex-1 font-semibold shadow-md min-h-[44px] text-xs sm:text-sm md:text-base px-2 sm:px-3 md:px-4"
                          >
                            <span className="hidden sm:inline">{t('browse.likeAndRequest')}</span>
                            <span className="sm:hidden">{t('browse.connect')}</span>
                          </Button>

                          <button
                            type="button"
                            onClick={handleNextProfile}
                            className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 ios-press text-gray-600 transition-all shadow-sm"
                            aria-label="Next profile"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>

                        {/* Secondary Actions - Better Alignment */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <Link 
                            href={`/profile/view/${profile.userId}`} 
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            {t('browse.viewFullProfile')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleFavorite(profile.userId)}
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {t('browse.addToFavorites')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            !loading && <EmptyProfiles />
          )}
        </div>
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={handleCloseModal}
        title={t('messaging.messageRequest')}
        variant="bottom-sheet"
      >
        <div className="space-y-4">
          <p className="text-ios-body text-gray-700">
            {t('messaging.sendRequest')} {selectedProfile?.firstName} {selectedProfile?.lastName}
          </p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder={t('messaging.requestMessage')}
            rows={4}
            className="w-full px-4 py-3 rounded-ios border border-iosGray-4 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue text-gray-900 bg-white"
          />
          <div className="flex space-x-4">
            <Button variant="primary" fullWidth onClick={handleSendRequest}>
              {t('messaging.sendRequest')}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={handleCloseModal}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
