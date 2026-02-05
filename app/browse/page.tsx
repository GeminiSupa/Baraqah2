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
  photos: Array<{ url: string; isPrimary: boolean }>
}

export default function BrowsePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
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
      fetchProfiles()
    }
  }, [status, router, fetchProfiles])

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
        alert('Message request sent successfully!')
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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-iosBg-secondary flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading profiles...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-iosBg-secondary py-4 md:py-8 px-4 safe-top safe-bottom pb-20 md:pb-8 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-ios-title1 font-bold text-gray-900">Browse Profiles</h1>
            <p className="text-ios-body text-iosGray-1 mt-2">Find your perfect match</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="mb-6">
            <h2 className="text-ios-title3 font-semibold text-gray-900 mb-4">Advanced Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Gender"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                options={[
                  { value: '', label: 'All' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
              />

              <Input
                label="Min Age"
                type="number"
                min="18"
                max="100"
                value={filters.minAge}
                onChange={(e) => handleFilterChange('minAge', e.target.value)}
                placeholder="18"
              />

              <Input
                label="Max Age"
                type="number"
                min="18"
                max="100"
                value={filters.maxAge}
                onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                placeholder="100"
              />

              <Input
                label="City"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                placeholder="Enter city"
              />

              <Input
                label="Education"
                value={filters.education}
                onChange={(e) => handleFilterChange('education', e.target.value)}
                placeholder="e.g., Bachelor's, Master's"
              />

              <Input
                label="Profession"
                value={filters.profession}
                onChange={(e) => handleFilterChange('profession', e.target.value)}
                placeholder="Enter profession"
              />

              <Select
                label="Prayer Practice"
                value={filters.prayerPractice}
                onChange={(e) => handleFilterChange('prayerPractice', e.target.value)}
                options={[
                  { value: '', label: 'All' },
                  { value: 'regular', label: 'Regular' },
                  { value: 'occasional', label: 'Occasional' },
                  { value: 'rarely', label: 'Rarely' },
                ]}
              />

              <Select
                label="Sect Preference"
                value={filters.sectPreference}
                onChange={(e) => handleFilterChange('sectPreference', e.target.value)}
                options={[
                  { value: '', label: 'All' },
                  { value: 'sunni', label: 'Sunni' },
                  { value: 'shia', label: 'Shia' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button variant="primary" onClick={handleApplyFilters} className="flex-1 sm:flex-none">
                Apply Filters
              </Button>
              <Button variant="ghost" onClick={handleClearFilters} className="flex-1 sm:flex-none">
                Clear All
              </Button>
            </div>
          </Card>
        )}

        {/* Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => {
            const primaryPhoto = profile.photos.find(p => p.isPrimary) || profile.photos[0]
            return (
              <Card key={profile.id} className="overflow-hidden">
                {primaryPhoto && (
                  <div className="relative w-full h-48">
                    <OptimizedImage
                      src={primaryPhoto.url}
                      alt={`${profile.firstName} ${profile.lastName}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-ios-headline font-semibold text-gray-900 mb-2">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-ios-subhead text-iosGray-1 mb-2">
                    {profile.age} years old • {profile.gender}
                    {profile.city && ` • ${profile.city}`}
                  </p>
                  {profile.bio && (
                    <p className="text-ios-body text-gray-700 mb-3 line-clamp-2">{profile.bio}</p>
                  )}
                  {profile.profession && (
                    <p className="text-ios-footnote text-iosGray-1 mb-3">{profile.profession}</p>
                  )}
                  <div className="flex space-x-2">
                    <Link href={`/profile/view/${profile.userId}`} className="flex-1">
                      <Button variant="primary" size="sm" fullWidth>
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProfile(profile)
                        setShowRequestModal(true)
                      }}
                    >
                      Request
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFavorite(profile.userId)}
                    >
                      ♡
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {profiles.length === 0 && !loading && <EmptyProfiles />}
      </div>

      {/* Request Modal */}
      <Modal
        isOpen={showRequestModal}
        onClose={handleCloseModal}
        title="Send Message Request"
        variant="bottom-sheet"
      >
        <div className="space-y-4">
          <p className="text-ios-body text-gray-700">
            Send a message request to {selectedProfile?.firstName} {selectedProfile?.lastName}
          </p>
          <textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Optional: Add a message..."
            rows={4}
            className="w-full px-4 py-3 rounded-ios border border-iosGray-4 focus:outline-none focus:ring-2 focus:ring-iosBlue focus:border-iosBlue"
          />
          <div className="flex space-x-4">
            <Button variant="primary" fullWidth onClick={handleSendRequest}>
              Send Request
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
