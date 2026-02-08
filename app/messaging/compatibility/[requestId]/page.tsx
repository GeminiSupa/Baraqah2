'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { AnimatedBackground } from '@/components/AnimatedBackground'

interface MessageRequest {
  id: string
  status: string
  connectionStatus: string
  sender?: {
    id: string
    profile?: {
      firstName: string
      lastName: string
      religiousBackground?: string
    }
  }
  receiver?: {
    id: string
    profile?: {
      firstName: string
      lastName: string
      religiousBackground?: string
    }
  }
}

export default function CompatibilityQuestionnairePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const requestId = params.requestId as string
  const [request, setRequest] = useState<MessageRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [bothCompleted, setBothCompleted] = useState(false)
  const [step, setStep] = useState<'religious-background' | 'questions'>('religious-background')
  const [religiousBackground, setReligiousBackground] = useState('')
  const [userReligiousBackground, setUserReligiousBackground] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    marriageUnderstanding: '',
    lifeGoals: '',
    religiousPracticeImportance: '',
    childrenPreference: '',
    partnerTraits: '',
    marriageRoles: '',
    workLifeBalance: '',
    conflictResolution: '',
    happyHomeVision: '',
    dealBreakers: '',
    spiritualGrowth: '',
    hobbiesInterests: '',
    // Islamic-specific questions (only shown if Muslim)
    sectPreference: '',
    prayerPractice: '',
    hijabPreference: '',
  })

  const fetchData = useCallback(async () => {
    try {
      // Fetch request info
      const requestResponse = await fetch(`/api/messaging/requests?type=received`)
      const requestData = await requestResponse.json()
      let foundRequest = requestData.requests?.find((r: MessageRequest) => r.id === requestId)
      
      if (!foundRequest) {
        const sentResponse = await fetch(`/api/messaging/requests?type=sent`)
        const sentData = await sentResponse.json()
        foundRequest = sentData.requests?.find((r: MessageRequest) => r.id === requestId)
      }

      if (foundRequest) {
        setRequest(foundRequest)
        
        // Fetch current user's profile to check religious background
        const profileResponse = await fetch('/api/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.profile) {
            const bg = profileData.profile.religiousBackground
            setUserReligiousBackground(bg)
            if (bg) {
              setReligiousBackground(bg)
              setStep('questions')
              // Load existing answers if any
              if (profileData.profile.marriageUnderstanding) {
                setFormData({
                  marriageUnderstanding: profileData.profile.marriageUnderstanding || '',
                  lifeGoals: profileData.profile.lifeGoals || '',
                  religiousPracticeImportance: profileData.profile.religiousPracticeImportance || '',
                  childrenPreference: profileData.profile.childrenPreference || '',
                  partnerTraits: profileData.profile.partnerTraits || '',
                  marriageRoles: profileData.profile.marriageRoles || '',
                  workLifeBalance: profileData.profile.workLifeBalance || '',
                  conflictResolution: profileData.profile.conflictResolution || '',
                  happyHomeVision: profileData.profile.happyHomeVision || '',
                  dealBreakers: profileData.profile.dealBreakers || '',
                  spiritualGrowth: profileData.profile.spiritualGrowth || '',
                  hobbiesInterests: profileData.profile.hobbiesInterests || '',
                  sectPreference: profileData.profile.sectPreference || '',
                  prayerPractice: profileData.profile.prayerPractice || '',
                  hijabPreference: profileData.profile.hijabPreference || '',
                })
              }
            }
          }
        }
      } else {
        setError('Request not found')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [requestId])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router, fetchData])

  const handleReligiousBackgroundSubmit = async () => {
    if (!religiousBackground) {
      setError('Please select your religious background')
      return
    }

    setSaving(true)
    setError('')

    try {
      // Update profile with religious background
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          religiousBackground,
        }),
      })

      if (response.ok) {
        setUserReligiousBackground(religiousBackground)
        setStep('questions')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to save religious background')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Only include Islamic-specific fields if user is Muslim
      const submitData: any = {
        marriageUnderstanding: formData.marriageUnderstanding,
        lifeGoals: formData.lifeGoals,
        childrenPreference: formData.childrenPreference,
        partnerTraits: formData.partnerTraits,
        marriageRoles: formData.marriageRoles,
        workLifeBalance: formData.workLifeBalance,
        conflictResolution: formData.conflictResolution,
        happyHomeVision: formData.happyHomeVision,
        dealBreakers: formData.dealBreakers,
        hobbiesInterests: formData.hobbiesInterests,
        religiousBackground: religiousBackground || userReligiousBackground,
      }

      // Add Islamic-specific fields only if Muslim
      if (isMuslim) {
        submitData.religiousPracticeImportance = formData.religiousPracticeImportance
        submitData.spiritualGrowth = formData.spiritualGrowth
        submitData.sectPreference = formData.sectPreference
        submitData.prayerPractice = formData.prayerPractice
        submitData.hijabPreference = formData.hijabPreference
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (response.ok) {
        // Check if both users have completed their questionnaires
        // Fetch both profiles to check
        const senderProfileResponse = await fetch(`/api/profile/view/${request?.sender?.id}`)
        const receiverProfileResponse = await fetch(`/api/profile/view/${request?.receiver?.id}`)
        
        const senderProfile = senderProfileResponse.ok ? await senderProfileResponse.json() : null
        const receiverProfile = receiverProfileResponse.ok ? await receiverProfileResponse.json() : null
        
        // Improved completion check - verify multiple required fields
        const checkCompletion = (profile: any) => {
          if (!profile?.profile) return false
          const p = profile.profile
          const isMuslim = p.religiousBackground === 'Muslim'
          
          // Common required fields for all users
          const commonFields = p.marriageUnderstanding && p.lifeGoals && p.partnerTraits && p.hobbiesInterests
          
          if (isMuslim) {
            // For Muslim users, also check Islamic-specific fields
            return commonFields && p.spiritualGrowth && p.sectPreference
          } else {
            // For non-Muslim users, check general compatibility fields
            return commonFields && p.childrenPreference && p.conflictResolution
          }
        }
        
        const senderCompleted = checkCompletion(senderProfile)
        const receiverCompleted = checkCompletion(receiverProfile)
        
        // If both have completed, update status and allow messaging
        if (senderCompleted && receiverCompleted) {
          await fetch(`/api/messaging/request/${requestId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ connectionStatus: 'questionnaire_completed' }),
          })
          // Show success and options
          setBothCompleted(true)
          setSuccess(true)
          setError('')
        } else {
          // Update connection status to show progress
          await fetch(`/api/messaging/request/${requestId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ connectionStatus: 'accepted' }),
          })
          // Show message that other user needs to complete
          setSuccess(true)
          setError('')
          // Redirect to messaging page with info after showing message
          setTimeout(() => {
            router.push('/messaging')
          }, 2000)
        }
      } else {
        setError(data.error || 'Failed to save answers')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center safe-top safe-bottom">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-iosBlue mb-4"></div>
          <p className="text-ios-body text-iosGray-1">Loading...</p>
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 safe-top safe-bottom">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-600">{error || 'Request not found'}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 text-primary-600 hover:text-primary-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const otherUser = request.sender?.id === session?.user?.id ? request.receiver : request.sender
  const otherUserName = otherUser?.profile 
    ? `${otherUser.profile.firstName} ${otherUser.profile.lastName}`
    : 'User'

  const isMuslim = (religiousBackground || userReligiousBackground) === 'Muslim'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 safe-top safe-bottom pb-24 md:pb-10 relative">
      <AnimatedBackground intensity="subtle" />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Back Button */}
          <button
            onClick={() => router.back()}
            className="md:hidden mb-4 flex items-center text-gray-700 hover:text-gray-900 ios-press"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-base font-medium">Back</span>
          </button>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Compatibility Questionnaire
            </h1>
            <p className="text-base text-gray-600 mb-6">
              Help {otherUserName} understand your values and expectations
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {success && bothCompleted && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                <p className="font-semibold mb-2">✅ Questionnaire Completed!</p>
                <p className="text-sm mb-4">Both of you have completed the compatibility questionnaire. You can now message each other or send custom questions.</p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => {
                      const otherUserId = request?.sender?.id === session?.user?.id 
                        ? request?.receiver?.id 
                        : request?.sender?.id
                      if (otherUserId) {
                        router.push(`/messaging/${otherUserId}`)
                      }
                    }}
                    className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 font-semibold"
                  >
                    Start Messaging
                  </button>
                  <button
                    onClick={() => router.push(`/messaging/questionnaire/${requestId}`)}
                    className="px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 font-semibold"
                  >
                    Send Custom Questions
                  </button>
                </div>
              </div>
            )}

            {success && !bothCompleted && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                <p className="font-semibold">Your questionnaire has been saved!</p>
                <p className="text-sm mt-1">Waiting for {otherUserName} to complete their questionnaire. You&apos;ll be notified when they&apos;re done.</p>
              </div>
            )}

            {step === 'religious-background' ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="religiousBackground" className="block text-sm font-medium text-gray-700 mb-2">
                    What is your religious background? *
                  </label>
                  <select
                    id="religiousBackground"
                    value={religiousBackground}
                    onChange={(e) => setReligiousBackground(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="">Select your religious background</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Non-religious">Non-religious</option>
                    <option value="Other">Other</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps us show you the most relevant compatibility questions
                  </p>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReligiousBackgroundSubmit}
                    disabled={saving || !religiousBackground}
                    className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Continue'}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Islamic-specific questions - only show if Muslim */}
                {isMuslim && (
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Islamic/Cultural Preferences</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="sectPreference" className="block text-sm font-medium text-gray-700 mb-1">
                          Sect Preference
                        </label>
                        <select
                          id="sectPreference"
                          name="sectPreference"
                          value={formData.sectPreference}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        >
                          <option value="">Select preference (optional)</option>
                          <option value="sunni">Sunni</option>
                          <option value="shia">Shia</option>
                          <option value="no-preference">No Preference</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="prayerPractice" className="block text-sm font-medium text-gray-700 mb-1">
                          Prayer Practice
                        </label>
                        <select
                          id="prayerPractice"
                          name="prayerPractice"
                          value={formData.prayerPractice}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        >
                          <option value="">Select practice (optional)</option>
                          <option value="regular">Regular</option>
                          <option value="sometimes">Sometimes</option>
                          <option value="special-occasions">Special Occasions</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="hijabPreference" className="block text-sm font-medium text-gray-700 mb-1">
                          Hijab Preference (for matches)
                        </label>
                        <select
                          id="hijabPreference"
                          name="hijabPreference"
                          value={formData.hijabPreference}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        >
                          <option value="">Select preference (optional)</option>
                          <option value="required">Required</option>
                          <option value="preferred">Preferred</option>
                          <option value="no-preference">No Preference</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* General Compatibility Questions */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {isMuslim ? 'Marriage Compatibility Questions' : 'Compatibility Questions'}
                  </h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Please answer these questions thoughtfully. Your answers will help {otherUserName} understand your values and expectations.
                  </p>
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="marriageUnderstanding" className="block text-sm font-medium text-gray-700 mb-1">
                        1. What is your understanding of a successful marriage{isMuslim ? ', and what role do you see religion/deen playing in it daily' : ''}? *
                      </label>
                      <textarea
                        id="marriageUnderstanding"
                        name="marriageUnderstanding"
                        required
                        rows={4}
                        value={formData.marriageUnderstanding}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder={isMuslim ? "e.g., Discuss salah together, halal lifestyle, supporting each other's ibadah..." : "e.g., Mutual respect, open communication, shared values..."}
                      />
                    </div>

                    <div>
                      <label htmlFor="lifeGoals" className="block text-sm font-medium text-gray-700 mb-1">
                        2. What are your long-term life goals or ambitions (career, personal growth, or contributions to family/society)? *
                      </label>
                      <textarea
                        id="lifeGoals"
                        name="lifeGoals"
                        required
                        rows={4}
                        value={formData.lifeGoals}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="e.g., Building financial stability, pursuing higher studies, helping community..."
                      />
                    </div>

                    {isMuslim && (
                      <div>
                        <label htmlFor="religiousPracticeImportance" className="block text-sm font-medium text-gray-700 mb-1">
                          3. How important is religious practice to you right now (e.g., frequency of salah, Quran reading, following Sunnah, modesty in daily life)? *
                        </label>
                        <textarea
                          id="religiousPracticeImportance"
                          name="religiousPracticeImportance"
                          required
                          rows={4}
                          value={formData.religiousPracticeImportance}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                          placeholder="Be specific about your level without judging — this shows compatibility in values..."
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="childrenPreference" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '4' : '3'}. How many children do you ideally want in the future, and what kind of upbringing{isMuslim ? '/religious/moral values' : ''} do you want to instill in them? *
                      </label>
                      <textarea
                        id="childrenPreference"
                        name="childrenPreference"
                        required
                        rows={4}
                        value={formData.childrenPreference}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder={isMuslim ? "e.g., 2–3 kids, focus on Islamic education, good akhlaq..." : "e.g., 2–3 kids, focus on good values, education..."}
                      />
                    </div>

                    <div>
                      <label htmlFor="partnerTraits" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '5' : '4'}. What kind of personality traits or character qualities are most important to you in a life partner (beyond basics like education or looks)? *
                      </label>
                      <textarea
                        id="partnerTraits"
                        name="partnerTraits"
                        required
                        rows={4}
                        value={formData.partnerTraits}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="e.g., Kindness, patience, honesty, sense of humor, ability to communicate openly..."
                      />
                    </div>

                    <div>
                      <label htmlFor="marriageRoles" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '6' : '5'}. How do you envision the roles and responsibilities in marriage (e.g., household duties, financial decisions, in-laws involvement)? *
                      </label>
                      <textarea
                        id="marriageRoles"
                        name="marriageRoles"
                        required
                        rows={4}
                        value={formData.marriageRoles}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="e.g., Mutual respect, shared decisions, helping each other..."
                      />
                    </div>

                    <div>
                      <label htmlFor="workLifeBalance" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '7' : '6'}. What are your views on work-life balance after marriage (e.g., if both work, living arrangements, time for family{isMuslim ? '/ibadah' : ''})? *
                      </label>
                      <textarea
                        id="workLifeBalance"
                        name="workLifeBalance"
                        required
                        rows={4}
                        value={formData.workLifeBalance}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="Especially relevant if you're in Germany/Europe — discuss career vs. family priorities..."
                      />
                    </div>

                    <div>
                      <label htmlFor="conflictResolution" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '8' : '7'}. How do you handle conflicts or differences in a relationship? *
                      </label>
                      <textarea
                        id="conflictResolution"
                        name="conflictResolution"
                        required
                        rows={4}
                        value={formData.conflictResolution}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder={isMuslim ? "e.g., Through calm discussion, seeking advice from elders/Quran/Sunnah..." : "e.g., Through calm discussion, seeking advice when needed..."}
                      />
                    </div>

                    <div>
                      <label htmlFor="happyHomeVision" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '9' : '8'}. What does a happy, peaceful home look like to you in the long run (daily routines, family time, holidays, etc.)? *
                      </label>
                      <textarea
                        id="happyHomeVision"
                        name="happyHomeVision"
                        required
                        rows={4}
                        value={formData.happyHomeVision}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder={isMuslim ? "e.g., Family prayers, home-cooked meals, quality time, halal outings..." : "e.g., Home-cooked meals, quality time, family activities..."}
                      />
                    </div>

                    <div>
                      <label htmlFor="dealBreakers" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '10' : '9'}. Are there any non-negotiables or deal-breakers for you in a partner? *
                      </label>
                      <textarea
                        id="dealBreakers"
                        name="dealBreakers"
                        required
                        rows={4}
                        value={formData.dealBreakers}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="e.g., Must be honest, values simplicity, open to relocation if needed..."
                      />
                    </div>

                    {isMuslim && (
                      <div>
                        <label htmlFor="spiritualGrowth" className="block text-sm font-medium text-gray-700 mb-1">
                          11. How do you see this marriage helping both of you grow closer to Allah and achieve Jannah together? *
                        </label>
                        <textarea
                          id="spiritualGrowth"
                          name="spiritualGrowth"
                          required
                          rows={4}
                          value={formData.spiritualGrowth}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                          placeholder="A spiritual angle many appreciate in rishta profiles..."
                        />
                      </div>
                    )}

                    <div>
                      <label htmlFor="hobbiesInterests" className="block text-sm font-medium text-gray-700 mb-1">
                        {isMuslim ? '12' : '10'}. What hobbies, interests, or ways do you like to spend free time (and how would you include a spouse in them)? *
                      </label>
                      <textarea
                        id="hobbiesInterests"
                        name="hobbiesInterests"
                        required
                        rows={4}
                        value={formData.hobbiesInterests}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                        placeholder="Share your interests and how you'd like to share them with your spouse..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={async () => {
                      // Skip questionnaire and go directly to messaging
                      const otherUserId = request?.sender?.id === session?.user?.id 
                        ? request?.receiver?.id 
                        : request?.sender?.id
                      
                      if (otherUserId) {
                        // Update connection status to allow messaging
                        await fetch(`/api/messaging/request/${requestId}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ connectionStatus: 'connected' }),
                        })
                        router.push(`/messaging/${otherUserId}`)
                      }
                    }}
                    className="px-6 py-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Skip & Start Messaging Directly →
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save & Continue'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
