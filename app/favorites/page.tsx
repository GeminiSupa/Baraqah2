'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { OptimizedImage } from '@/components/OptimizedImage'
import { EmptyFavorites } from '@/components/ui/EmptyState'

interface Favorite {
  id: string
  userId: string
  createdAt: string
  profile?: {
    id: string
    firstName: string
    lastName: string
    age: number
    gender: string
    city?: string
    photo?: string
  }
  user?: {
    id: string
    email: string
  }
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchFavorites()
    }
  }, [status, router])

  const fetchFavorites = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/favorites')
      const data = await response.json()

      if (response.ok) {
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove from favorites?')) return

    setRemoving(userId)
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(favorites.filter(f => f.userId !== userId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    } finally {
      setRemoving(null)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-iosBg-secondary py-8 px-4 safe-top safe-bottom relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-ios-title1 font-bold text-gray-900">Favorites</h1>
          <p className="text-ios-body text-iosGray-1 mt-2">Profiles you&apos;ve saved</p>
        </div>

        {favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden">
                <div className="flex items-start space-x-4">
                  {favorite.profile?.photo ? (
                    <div className="relative w-20 h-20 rounded-ios overflow-hidden">
                      <OptimizedImage
                        src={favorite.profile.photo}
                        alt={`${favorite.profile.firstName} ${favorite.profile.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-ios bg-iosGray-5 flex items-center justify-center">
                      <span className="text-iosGray-2 text-ios-title3">
                        {favorite.profile?.firstName?.[0] || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-ios-headline font-semibold text-gray-900 truncate">
                      {favorite.profile
                        ? `${favorite.profile.firstName} ${favorite.profile.lastName}`
                        : favorite.user?.email}
                    </h3>
                    {favorite.profile && (
                      <p className="text-ios-subhead text-iosGray-1">
                        {favorite.profile.age} years • {favorite.profile.gender}
                        {favorite.profile.city && ` • ${favorite.profile.city}`}
                      </p>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <Link href={`/profile/view/${favorite.userId}`}>
                        <Button variant="ghost" size="sm">View Profile</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(favorite.userId)}
                        disabled={removing === favorite.userId}
                      >
                        {removing === favorite.userId ? 'Removing...' : 'Remove'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
