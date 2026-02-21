'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { OptimizedImage } from '@/components/OptimizedImage'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/components/LanguageProvider'

export interface BrowseProfile {
  userId: string
  firstName: string
  lastName: string
  age: number
  gender: string
  bio?: string
  education?: string
  profession?: string
  city?: string
  idVerified?: boolean
  photos: Array<{ url: string; isPrimary: boolean }>
}

interface ProfileCardProps {
  profile: BrowseProfile
  index: number
  total: number
  onPrev: () => void
  onNext: () => void
  onConnect: () => void
  onFavorite: () => void
  connecting?: boolean
  favoriting?: boolean
}

export function ProfileCard({
  profile,
  index,
  total,
  onPrev,
  onNext,
  onConnect,
  onFavorite,
  connecting = false,
  favoriting = false,
}: ProfileCardProps) {
  const { t } = useTranslation()
  const primaryPhoto = profile.photos.find((p) => p.isPrimary) || profile.photos[0]

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
          <span className="text-xs font-medium text-gray-600">
            {t('browse.profile')} {index + 1} {t('browse.of')} {total}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-ios-xl shadow-ios-xl overflow-hidden border border-gray-100/50">
        {primaryPhoto && (
          <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <OptimizedImage
              src={primaryPhoto.url}
              alt={`${profile.firstName} ${profile.lastName}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        )}

        <div className="px-6 py-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {profile.firstName} {profile.lastName}
              </h3>
              {profile.idVerified ? (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <span className="mr-1" aria-hidden="true">
                    ✓
                  </span>{' '}
                  {t('profile.verifiedId')}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-xs font-medium border border-gray-200">
                  {t('profile.notVerified')}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {profile.age} {t('common.years')} {t('common.old')} •{' '}
              {profile.gender === 'male' ? t('profile.male') : t('profile.female')}
              {profile.city && ` • ${profile.city}`}
            </p>
          </div>

          {profile.bio && (
            <p className="text-base text-gray-700 leading-relaxed line-clamp-3">{profile.bio}</p>
          )}

          {(profile.profession || profile.education) && (
            <div className="flex flex-wrap gap-2 pt-2">
              {profile.profession && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                  <span aria-hidden="true" className="mr-1">
                    💼
                  </span>
                  {profile.profession}
                </span>
              )}
              {profile.education && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                  <span aria-hidden="true" className="mr-1">
                    🎓
                  </span>
                  {profile.education}
                </span>
              )}
            </div>
          )}

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onPrev}
                className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 ios-press text-gray-600 transition-all shadow-sm touch-target"
                aria-label={t('browse.previousProfile')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <Button
                variant="secondary"
                size="md"
                onClick={onNext}
                className="flex-1 font-semibold"
              >
                {t('browse.skip')}
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={onConnect}
                loading={connecting}
                className={cn('flex-1 font-semibold min-h-[44px] px-3')}
              >
                <span className="hidden sm:inline">{t('browse.likeAndRequest')}</span>
                <span className="sm:hidden">{t('browse.connect')}</span>
              </Button>

              <button
                type="button"
                onClick={onNext}
                className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 ios-press text-gray-600 transition-all shadow-sm touch-target"
                aria-label={t('browse.nextProfile')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Link
                href={`/profile/view/${profile.userId}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t('browse.viewFullProfile')}
              </Link>

              <button
                type="button"
                onClick={onFavorite}
                disabled={favoriting}
                className={cn(
                  'flex items-center gap-1.5 text-sm font-medium transition-colors touch-target',
                  favoriting ? 'text-iosGray-2' : 'text-gray-600 hover:text-red-500'
                )}
                aria-label={t('browse.addToFavorites')}
                aria-busy={favoriting}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {t('browse.addToFavorites')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProfileCardSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white rounded-ios-xl shadow-ios-xl overflow-hidden border border-gray-100/50">
        <div className="w-full aspect-[4/5] bg-gray-100 animate-pulse" />
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <div className="h-6 w-2/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="h-16 w-full bg-gray-100 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
          </div>
          <div className="pt-4 flex gap-2">
            <div className="h-11 w-11 bg-gray-100 rounded-full animate-pulse" />
            <div className="h-11 flex-1 bg-gray-100 rounded-ios-lg animate-pulse" />
            <div className="h-11 flex-1 bg-gray-100 rounded-ios-lg animate-pulse" />
            <div className="h-11 w-11 bg-gray-100 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

