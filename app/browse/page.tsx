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
import { EmptyProfiles } from '@/components/ui/EmptyState'
import { useTranslation } from '@/components/LanguageProvider'
import { PageLayout } from '@/components/layout/PageLayout'
import { useToast } from '@/components/ui/Toast'
import { ProfileCard, ProfileCardSkeleton } from '@/components/profile/ProfileCard'

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
  const { toast } = useToast()
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
  const [sendingRequest, setSendingRequest] = useState(false)
  const [favoritingUserId, setFavoritingUserId] = useState<string | null>(null)

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

    setSendingRequest(true)
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
        toast({ variant: 'success', title: t('messaging.requestSent') })
      } else {
        toast({
          variant: 'error',
          title: t('common.error'),
          description: data.error || t('messaging.failedToSendRequest'),
        })
      }
    } catch (error) {
      toast({
        variant: 'error',
        title: t('common.error'),
        description: t('auth.errorOccurred'),
      })
    } finally {
      setSendingRequest(false)
    }
  }

  const handleFavorite = async (userId: string) => {
    setFavoritingUserId(userId)
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        toast({ variant: 'success', title: t('favorites.addedToFavorites') })
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          variant: 'error',
          title: t('common.error'),
          description: data.error || t('favorites.failedToAdd'),
        })
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
      toast({
        variant: 'error',
        title: t('common.error'),
        description: t('favorites.failedToAdd'),
      })
    } finally {
      setFavoritingUserId(null)
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

  if (status === 'loading') {
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
    <PageLayout>
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        {/* Mobile Back Button */}
        <button
          onClick={() => router.back()}
          className="md:hidden mb-4 flex items-center text-gray-700 hover:text-gray-900 ios-press"
          aria-label={t('common.back')}
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
            aria-expanded={showFilters}
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
          {loading && <ProfileCardSkeleton />}
          {!loading && profiles.length > 0 && (
            <ProfileCard
              profile={profiles[currentIndex]}
              index={currentIndex}
              total={profiles.length}
              onPrev={handlePrevProfile}
              onNext={handleNextProfile}
              onConnect={() => {
                const profile = profiles[currentIndex]
                setSelectedProfile(profile)
                setShowRequestModal(true)
              }}
              onFavorite={() => handleFavorite(profiles[currentIndex].userId)}
              favoriting={favoritingUserId === profiles[currentIndex].userId}
            />
          )}
          {!loading && profiles.length === 0 && <EmptyProfiles />}
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
            aria-label={t('messaging.requestMessage')}
          />
          <div className="flex space-x-4">
            <Button variant="primary" fullWidth onClick={handleSendRequest} loading={sendingRequest}>
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
    </PageLayout>
  )
}
