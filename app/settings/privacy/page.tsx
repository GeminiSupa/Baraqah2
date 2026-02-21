'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { useConfirm } from '@/components/ui/Confirm'
import { useToast } from '@/components/ui/Toast'
import { useTranslation } from '@/components/LanguageProvider'
import { PageLayout } from '@/components/layout/PageLayout'

interface PrivacySettings {
  profileVisibility: string
  photoPrivacy: string
  questionnairePrivacy: string
  hideFromSearch: boolean
  showOnlineStatus: boolean
}

interface BlockedUser {
  id: string
  blockedAt: string
  user?: {
    id: string
    email: string
    profiles?: {
      firstName: string
      lastName: string
    }
  }
}

export default function PrivacySettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { confirm } = useConfirm()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    photoPrivacy: 'private',
    questionnairePrivacy: 'private',
    hideFromSearch: false,
    showOnlineStatus: true,
  })
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/privacy')
      const data = await response.json()

      if (response.ok) {
        setSettings(data.settings)
        setBlockedUsers(data.blockedUsers || [])
      } else {
        setError(data.error || t('settings.privacyLoadFailed'))
      }
    } catch (error) {
      setError(t('settings.privacyLoadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status, router, fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/privacy', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(t('settings.privacySaved'))
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || t('settings.privacySaveFailed'))
      }
    } catch (error) {
      setError(t('settings.privacySaveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const handleUnblock = async (userId: string) => {
    try {
      const response = await fetch('/api/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unblock',
          userId,
        }),
      })

      if (response.ok) {
        setBlockedUsers(blockedUsers.filter(u => u.id !== userId))
        setSuccess(t('settings.userUnblocked'))
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(t('settings.unblockFailed'))
      }
    } catch (error) {
      setError(t('settings.unblockFailed'))
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  return (
    <PageLayout containerClassName="max-w-3xl">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <div className="mb-8">
          <Link href="/profile" className="text-iosBlue hover:text-iosBlue-dark mb-4 inline-block font-medium">
            ← {t('common.back')} {t('navigation.profile')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('settings.privacy')}</h1>
          <p className="text-base text-gray-600">{t('settings.privacyDescription')}</p>
        </div>

        {error && (
          <div className="bg-iosRed/10 border border-iosRed/20 text-iosRed px-4 py-3 rounded-ios mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-iosGreen/10 border border-iosGreen/20 text-iosGreen px-4 py-3 rounded-ios mb-6">
            {success}
          </div>
        )}

        {/* Profile Visibility */}
        <Card className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('settings.profileVisibility')}</h2>
          <Select
            label={t('settings.whoCanSeeProfile')}
            value={settings.profileVisibility}
            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
            options={[
              { value: 'public', label: t('settings.everyone') },
              { value: 'verified-only', label: t('settings.verifiedOnly') },
              { value: 'private', label: t('settings.connectionsOnly') },
            ]}
          />
        </Card>

        {/* Photo Privacy */}
        <Card className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('settings.photoPrivacy')}</h2>
          <Select
            label={t('settings.whoCanSeePhotos')}
            value={settings.photoPrivacy}
            onChange={(e) => setSettings({ ...settings, photoPrivacy: e.target.value })}
            options={[
              { value: 'public', label: t('settings.everyone') },
              { value: 'connections-only', label: t('settings.connectionsOnly') },
              { value: 'private', label: t('settings.private') },
            ]}
          />
        </Card>

        {/* Questionnaire Privacy */}
        <Card className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('settings.questionnairePrivacy')}</h2>
          <Select
            label={t('settings.whoCanSeeQuestionnaire')}
            value={settings.questionnairePrivacy}
            onChange={(e) => setSettings({ ...settings, questionnairePrivacy: e.target.value })}
            options={[
              { value: 'public', label: t('settings.everyone') },
              { value: 'connections-only', label: t('settings.connectionsOnly') },
              { value: 'private', label: t('settings.private') },
            ]}
          />
        </Card>

        {/* Other Settings */}
        <Card className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('settings.otherSettings')}</h2>
          <div className="space-y-4">
            <Switch
              label={t('settings.hideFromSearch')}
              description={t('settings.hideFromSearchDescription')}
              checked={settings.hideFromSearch}
              onChange={(e) => setSettings({ ...settings, hideFromSearch: e.target.checked })}
            />
            <Switch
              label={t('settings.showOnlineStatus')}
              description={t('settings.showOnlineStatusDescription')}
              checked={settings.showOnlineStatus}
              onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
            />
          </div>
        </Card>

        {/* Blocked Users */}
        <Card className="mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{t('settings.blockedUsers')}</h2>
          {blockedUsers.length === 0 ? (
            <p className="text-ios-body text-iosGray-1">{t('settings.noBlockedUsers')}</p>
          ) : (
            <div className="space-y-3">
              {blockedUsers.map((blocked) => (
                <div key={blocked.id} className="flex items-center justify-between p-3 bg-iosGray-6 rounded-ios">
                  <div>
                    <p className="text-ios-body font-medium text-gray-900">
                      {blocked.user?.profiles
                        ? `${blocked.user.profiles.firstName} ${blocked.user.profiles.lastName}`
                        : blocked.user?.email || 'Unknown User'}
                    </p>
                    <p className="text-ios-footnote text-iosGray-1">
                      {t('settings.blockedOn')} {new Date(blocked.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(blocked.id)}
                  >
                    {t('settings.unblock')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Delete Account Section */}
        <Card className="mb-6 border border-red-100/50 bg-red-50/30">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">{t('settings.deleteAccount')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            {t('settings.deleteAccountDescription')}
          </p>
          <Button
            variant="danger"
            size="md"
            onClick={async () => {
              const first = await confirm({
                title: t('settings.deleteAccountConfirmTitle'),
                description: t('settings.deleteAccountConfirmDescription'),
                confirmText: t('common.continue'),
                cancelText: t('common.cancel'),
                variant: 'danger',
              })
              if (!first) return

              const second = await confirm({
                title: t('settings.deleteAccountFinalTitle'),
                description: t('settings.deleteAccountFinalDescription'),
                confirmText: t('settings.deleteAccountFinalConfirm'),
                cancelText: t('common.cancel'),
                variant: 'danger',
              })
              if (!second) return

              try {
                setSaving(true)
                setError('')
                const response = await fetch('/api/profile/delete', {
                  method: 'DELETE',
                })

                const data = await response.json()

                if (response.ok) {
                  toast({
                    variant: 'success',
                    title: t('settings.accountDeletedTitle'),
                    description: t('settings.accountDeletedDescription'),
                  })
                  router.push('/')
                  // Sign out will happen automatically on redirect
                } else {
                  setError(data.error || t('settings.deleteAccountFailed'))
                }
              } catch (error) {
                setError(t('auth.errorOccurred'))
              } finally {
                setSaving(false)
              }
            }}
            disabled={saving}
            className="font-semibold"
          >
            {saving ? t('settings.deleting') : t('settings.deleteMyAccount')}
          </Button>
        </Card>

        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t('common.saving') : t('settings.savePrivacySettings')}
        </Button>
      </div>
    </PageLayout>
  )
}
