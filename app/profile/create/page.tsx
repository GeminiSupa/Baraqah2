'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CreateProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
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
    // Questionnaire fields
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
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create profile')
        return
      }

      router.push('/profile')
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-6 md:py-10 px-4 sm:px-6 relative">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100/50 p-6 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
          <p className="text-base text-gray-600 mb-6">
            Build your matrimony profile. Photos are optional - you can add them later.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  required
                  min="18"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder="e.g., Bachelor's Degree, Master's"
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  Profession
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder="e.g., Software Engineer, Teacher"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder="Country, Region"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  placeholder="e.g., Berlin, Karachi, London"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio / About Me
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                placeholder="Tell others about yourself..."
              />
            </div>

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
                    <option value="">Select preference</option>
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
                    <option value="">Select practice</option>
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
                    <option value="">Select preference</option>
                    <option value="required">Required</option>
                    <option value="preferred">Preferred</option>
                    <option value="no-preference">No Preference</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Marriage Compatibility Questions</h2>
              <p className="text-sm text-gray-600 mb-6">
                Please answer these questions thoughtfully. Your answers will help potential matches understand your values and expectations.
              </p>
              <div className="space-y-6">
                <div>
                  <label htmlFor="marriageUnderstanding" className="block text-sm font-medium text-gray-700 mb-1">
                    1. What is your understanding of a successful marriage, and what role do you see religion/deen playing in it daily? *
                  </label>
                  <textarea
                    id="marriageUnderstanding"
                    name="marriageUnderstanding"
                    required
                    rows={4}
                    value={formData.marriageUnderstanding}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Discuss salah together, halal lifestyle, supporting each other's ibadah..."
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
                    placeholder="e.g., Building financial stability, pursuing higher studies, helping community, or traveling for Umrah/Hajj..."
                  />
                </div>

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

                <div>
                  <label htmlFor="childrenPreference" className="block text-sm font-medium text-gray-700 mb-1">
                    4. How many children do you ideally want in the future, and what kind of upbringing/religious/moral values do you want to instill in them? *
                  </label>
                  <textarea
                    id="childrenPreference"
                    name="childrenPreference"
                    required
                    rows={4}
                    value={formData.childrenPreference}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., 2–3 kids, focus on Islamic education, good akhlaq, balanced modern + deeni tarbiyat..."
                  />
                </div>

                <div>
                  <label htmlFor="partnerTraits" className="block text-sm font-medium text-gray-700 mb-1">
                    5. What kind of personality traits or character qualities are most important to you in a life partner (beyond basics like education or looks)? *
                  </label>
                  <textarea
                    id="partnerTraits"
                    name="partnerTraits"
                    required
                    rows={4}
                    value={formData.partnerTraits}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Kindness, patience, honesty, sense of humor, ability to communicate openly, supportive nature..."
                  />
                </div>

                <div>
                  <label htmlFor="marriageRoles" className="block text-sm font-medium text-gray-700 mb-1">
                    6. How do you envision the roles and responsibilities in marriage (e.g., household duties, financial decisions, in-laws involvement)? *
                  </label>
                  <textarea
                    id="marriageRoles"
                    name="marriageRoles"
                    required
                    rows={4}
                    value={formData.marriageRoles}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Mutual respect, shared decisions, helping each other, maintaining family ties..."
                  />
                </div>

                <div>
                  <label htmlFor="workLifeBalance" className="block text-sm font-medium text-gray-700 mb-1">
                    7. What are your views on work-life balance after marriage (e.g., if both work, living arrangements, time for family/ibadah)? *
                  </label>
                  <textarea
                    id="workLifeBalance"
                    name="workLifeBalance"
                    required
                    rows={4}
                    value={formData.workLifeBalance}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="Especially relevant if you&apos;re in Germany/Europe — discuss career vs. family priorities..."
                  />
                </div>

                <div>
                  <label htmlFor="conflictResolution" className="block text-sm font-medium text-gray-700 mb-1">
                    8. How do you handle conflicts or differences in a relationship? *
                  </label>
                  <textarea
                    id="conflictResolution"
                    name="conflictResolution"
                    required
                    rows={4}
                    value={formData.conflictResolution}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Through calm discussion, seeking advice from elders/Quran/Sunnah, forgiveness..."
                  />
                </div>

                <div>
                  <label htmlFor="happyHomeVision" className="block text-sm font-medium text-gray-700 mb-1">
                    9. What does a happy, peaceful home look like to you in the long run (daily routines, family time, holidays, etc.)? *
                  </label>
                  <textarea
                    id="happyHomeVision"
                    name="happyHomeVision"
                    required
                    rows={4}
                    value={formData.happyHomeVision}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Family prayers, home-cooked meals, quality time, halal outings..."
                  />
                </div>

                <div>
                  <label htmlFor="dealBreakers" className="block text-sm font-medium text-gray-700 mb-1">
                    10. Are there any non-negotiables or deal-breakers for you in a partner (beyond the form&apos;s filters like sect/caste)? *
                  </label>
                  <textarea
                    id="dealBreakers"
                    name="dealBreakers"
                    required
                    rows={4}
                    value={formData.dealBreakers}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                    placeholder="e.g., Must pray regularly, no interest in lavish lifestyle, values simplicity, open to relocation if needed..."
                  />
                </div>

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

                <div>
                  <label htmlFor="hobbiesInterests" className="block text-sm font-medium text-gray-700 mb-1">
                    12. What hobbies, interests, or ways do you like to spend free time (and how would you include a spouse in them)? *
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

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="photoPrivacy" className="block text-sm font-medium text-gray-700 mb-1">
                    Photo Privacy
                  </label>
                  <select
                    id="photoPrivacy"
                    name="photoPrivacy"
                    value={formData.photoPrivacy}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="private">Private</option>
                    <option value="public">Public</option>
                    <option value="verified-only">Verified Users Only</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="profileVisibility" className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Visibility
                  </label>
                  <select
                    id="profileVisibility"
                    name="profileVisibility"
                    value={formData.profileVisibility}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900 bg-white"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="verified-only">Verified Users Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}