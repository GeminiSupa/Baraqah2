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
import { useTranslation } from '@/components/LanguageProvider'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'

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
    idVerified?: boolean
  }
  user?: {
    id: string
    email: string
  }
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      // Prevent admins from accessing favorites
      if (session?.user?.isAdmin) {
        router.push('/admin')
        return
      }
      fetchFavorites()
    }
  }, [status, session, router])

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
    const ok = await confirm({
      title: t('favorites.removeFromFavoritesTitle'),
      description: t('favorites.removeFromFavorites'),
      confirmText: t('common.remove'),
      cancelText: t('common.cancel'),
      variant: 'danger',
    })
    if (!ok) return

    setRemoving(userId)
    try {
      const response = await fetch(`/api/favorites?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFavorites(favorites.filter(f => f.userId !== userId))
        toast({ variant: 'success', title: t('favorites.removedFromFavorites') })
      } else {
        const data = await response.json().catch(() => ({}))
        toast({
          variant: 'error',
          title: t('common.error'),
          description: data.error || t('favorites.failedToRemove'),
        })
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast({
        variant: 'error',
        title: t('common.error'),
        description: t('favorites.failedToRemove'),
      })
    } finally {
      setRemoving(null)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('favorites.title')}</h1>
          <p className="text-base text-gray-600">{t('favorites.subtitle')}</p>
        </div>

        {favorites.length === 0 ? (
          <EmptyFavorites />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden rounded-3xl shadow-xl border border-gray-100/50">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-ios-headline font-semibold text-gray-900 truncate">
                        {favorite.profile
                          ? `${favorite.profile.firstName} ${favorite.profile.lastName}`
                          : favorite.user?.email}
                      </h3>
                      {favorite.profile && (
                        favorite.profile.idVerified ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold border border-green-200">
                            ✓ {t('profile.verifiedId')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 text-[11px] font-medium border border-gray-200">
                            {t('profile.notVerified')}
                          </span>
                        )
                      )}
                    </div>
                    {favorite.profile && (
                      <p className="text-ios-subhead text-iosGray-1">
                        {favorite.profile.age} {t('common.years')} • {favorite.profile.gender === 'male' ? t('profile.male') : t('profile.female')}
                        {favorite.profile.city && ` • ${favorite.profile.city}`}
                      </p>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <Link href={`/profile/view/${favorite.userId}`}>
                        <Button variant="ghost" size="sm">{t('common.view')} {t('navigation.profile')}</Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(favorite.userId)}
                        disabled={removing === favorite.userId}
                      >
                        {removing === favorite.userId ? t('common.loading') : t('common.remove')}
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
