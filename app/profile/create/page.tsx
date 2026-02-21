'use client'

import { useMemo, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/components/LanguageProvider'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProfileSchema, type ProfileFormValues } from '@/lib/validation/profile'
import { FormField } from '@/components/Form/FormField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedBackground } from '@/components/AnimatedBackground'
import { PageLayout } from '@/components/layout/PageLayout'

export default function CreateProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const schema = useMemo(() => createProfileSchema(t), [t])
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 18,
      gender: 'male',
      bio: '',
      education: '',
      profession: '',
      location: '',
      city: '',
      sectPreference: '',
      prayerPractice: '',
      hijabPreference: '',
      photoPrivacy: 'private',
      profileVisibility: 'public',
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const onSubmit = async (values: ProfileFormValues) => {
    setError('')
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('profile.createProfileFailed'))
        return
      }

      router.push('/profile')
    } catch (error) {
      setError(t('auth.errorOccurred'))
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading')}</div>
  }

  return (
    <PageLayout containerClassName="max-w-4xl">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <Card>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('profile.createProfile')}</h1>
          <p className="text-base text-gray-600 mb-6">{t('profile.buildProfile')}</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-ios mb-4">
              {error}
            </div>
          )}

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-ios-subhead font-medium text-gray-900 mb-2">
                    {t('auth.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={session?.user?.email || ''}
                    disabled
                    readOnly
                    className="w-full px-4 py-3 rounded-ios border border-iosGray-4 bg-iosGray-6 text-iosGray-1 cursor-not-allowed"
                  />
                  <p className="text-xs text-iosGray-1 mt-2">{t('profile.registeredEmail')}</p>
                </div>

                <FormField name="firstName" label={`${t('profile.firstName')}`} required placeholder={t('profile.firstName')} />
                <FormField name="lastName" label={`${t('profile.lastName')}`} required placeholder={t('profile.lastName')} />
                <FormField name="age" type="number" label={`${t('profile.age')}`} required />
                <FormField
                  name="gender"
                  as="select"
                  label={`${t('profile.gender')}`}
                  required
                  options={[
                    { value: 'male', label: t('profile.male') },
                    { value: 'female', label: t('profile.female') },
                  ]}
                />
                <FormField name="education" label={t('profile.education')} placeholder={t('profile.education')} />
                <FormField name="profession" label={t('profile.profession')} placeholder={t('profile.profession')} />
                <FormField name="location" label={t('profile.location')} placeholder={t('profile.location')} />
                <FormField name="city" label={t('profile.city')} required placeholder={t('profile.city')} />
              </div>

              <FormField
                name="bio"
                as="textarea"
                label={`${t('profile.bio')} / ${t('profile.aboutMe')}`}
                placeholder={t('profile.tellAboutYourself')}
              />

              <div className="border-t border-iosGray-5 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('profile.islamicPreferences')} ({t('common.optional')})
                </h2>
                <p className="text-sm text-gray-600 mb-4">{t('profile.preferencesOptional')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="sectPreference"
                    as="select"
                    label={t('profile.sectPreference')}
                    options={[
                      { value: 'sunni', label: t('profile.sunni') },
                      { value: 'shia', label: t('profile.shia') },
                      { value: 'no-preference', label: t('profile.noPreference') },
                    ]}
                  />
                  <FormField
                    name="prayerPractice"
                    as="select"
                    label={t('profile.prayerPractice')}
                    options={[
                      { value: 'regular', label: t('profile.regular') },
                      { value: 'sometimes', label: t('profile.sometimes') },
                      { value: 'special-occasions', label: t('profile.specialOccasions') },
                    ]}
                  />
                  <FormField
                    name="hijabPreference"
                    as="select"
                    label={t('profile.hijabPreference')}
                    options={[
                      { value: 'required', label: t('profile.required') },
                      { value: 'preferred', label: t('profile.preferred') },
                      { value: 'no-preference', label: t('profile.noPreference') },
                    ]}
                  />
                </div>
              </div>

              <div className="border-t border-iosGray-5 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('profile.privacySettings')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="photoPrivacy"
                    as="select"
                    label={t('profile.photoPrivacy')}
                    options={[
                      { value: 'private', label: t('profile.private') },
                      { value: 'public', label: t('profile.public') },
                      { value: 'verified-only', label: t('profile.verifiedUsersOnly') },
                    ]}
                  />
                  <FormField
                    name="profileVisibility"
                    as="select"
                    label={t('profile.profileVisibility')}
                    options={[
                      { value: 'public', label: t('profile.public') },
                      { value: 'private', label: t('profile.private') },
                      { value: 'verified-only', label: t('profile.verifiedUsersOnly') },
                    ]}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => router.push('/profile')} fullWidth>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" type="submit" loading={saving} fullWidth>
                  {t('profile.createProfile')}
                </Button>
              </div>
            </form>
          </FormProvider>
        </Card>
      </div>
    </PageLayout>
  )
}