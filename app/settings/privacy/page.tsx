'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/Switch'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/AnimatedBackground'

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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchSettings()
    }
  }, [status, router])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/privacy')
      const data = await response.json()

      if (response.ok) {
        setSettings(data.settings)
        setBlockedUsers(data.blockedUsers || [])
      } else {
        setError(data.error || 'Failed to load privacy settings')
      }
    } catch (error) {
      setError('Failed to load privacy settings')
    } finally {
      setLoading(false)
    }
  }

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
        setSuccess('Privacy settings saved successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to save privacy settings')
      }
    } catch (error) {
      setError('Failed to save privacy settings')
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
        setSuccess('User unblocked successfully')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to unblock user')
      }
    } catch (error) {
      setError('Failed to unblock user')
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom relative">
      <AnimatedBackground intensity="subtle" />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="mb-8">
          <Link href="/profile" className="text-iosBlue hover:text-iosBlue-dark mb-4 inline-block font-medium">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Privacy Settings</h1>
          <p className="text-base text-gray-600">Control who can see your profile and information</p>
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
        <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Profile Visibility</h2>
          <Select
            label="Who can see your profile?"
            value={settings.profileVisibility}
            onChange={(e) => setSettings({ ...settings, profileVisibility: e.target.value })}
            options={[
              { value: 'public', label: 'Everyone' },
              { value: 'verified-only', label: 'Verified users only' },
              { value: 'private', label: 'Only people I connect with' },
            ]}
          />
        </Card>

        {/* Photo Privacy */}
        <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Photo Privacy</h2>
          <Select
            label="Who can see your photos?"
            value={settings.photoPrivacy}
            onChange={(e) => setSettings({ ...settings, photoPrivacy: e.target.value })}
            options={[
              { value: 'public', label: 'Everyone' },
              { value: 'connections-only', label: 'Only connections' },
              { value: 'private', label: 'Private' },
            ]}
          />
        </Card>

        {/* Questionnaire Privacy */}
        <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Questionnaire Privacy</h2>
          <Select
            label="Who can see your questionnaire answers?"
            value={settings.questionnairePrivacy}
            onChange={(e) => setSettings({ ...settings, questionnairePrivacy: e.target.value })}
            options={[
              { value: 'public', label: 'Everyone' },
              { value: 'connections-only', label: 'Only connections' },
              { value: 'private', label: 'Private' },
            ]}
          />
        </Card>

        {/* Other Settings */}
        <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Other Settings</h2>
          <div className="space-y-4">
            <Switch
              label="Hide from search"
              description="Your profile won&apos;t appear in browse or search results"
              checked={settings.hideFromSearch}
              onChange={(e) => setSettings({ ...settings, hideFromSearch: e.target.checked })}
            />
            <Switch
              label="Show online status"
              description="Let others see when you&apos;re online"
              checked={settings.showOnlineStatus}
              onChange={(e) => setSettings({ ...settings, showOnlineStatus: e.target.checked })}
            />
          </div>
        </Card>

        {/* Blocked Users */}
        <Card className="mb-6 rounded-3xl shadow-xl border border-gray-100/50">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">Blocked Users</h2>
          {blockedUsers.length === 0 ? (
            <p className="text-ios-body text-iosGray-1">No blocked users</p>
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
                      Blocked on {new Date(blocked.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnblock(blocked.id)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Button
          variant="primary"
          fullWidth
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Privacy Settings'}
        </Button>
      </div>
    </div>
  )
}
