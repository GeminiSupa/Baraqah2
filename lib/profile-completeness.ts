interface Profile {
  firstName?: string
  lastName?: string
  age?: number
  gender?: string
  bio?: string
  education?: string
  profession?: string
  location?: string
  city?: string
  sectPreference?: string
  prayerPractice?: string
  hijabPreference?: string
  photos?: Array<{ url: string }>
  marriageUnderstanding?: string
  lifeGoals?: string
  religiousPracticeImportance?: string
  childrenPreference?: string
  partnerTraits?: string
  marriageRoles?: string
  workLifeBalance?: string
  conflictResolution?: string
  happyHomeVision?: string
  dealBreakers?: string
  spiritualGrowth?: string
  hobbiesInterests?: string
}

export function calculateProfileCompleteness(profile: Profile): {
  percentage: number
  missingFields: string[]
} {
  const requiredFields = [
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'city', label: 'City' },
    { key: 'bio', label: 'Bio' },
    { key: 'education', label: 'Education' },
    { key: 'profession', label: 'Profession' },
    { key: 'photos', label: 'Profile Photo' },
  ]

  const questionnaireFields = [
    { key: 'marriageUnderstanding', label: 'Marriage Understanding' },
    { key: 'lifeGoals', label: 'Life Goals' },
    { key: 'religiousPracticeImportance', label: 'Religious Practice' },
    { key: 'childrenPreference', label: 'Children Preference' },
    { key: 'partnerTraits', label: 'Partner Traits' },
    { key: 'marriageRoles', label: 'Marriage Roles' },
    { key: 'workLifeBalance', label: 'Work-Life Balance' },
    { key: 'conflictResolution', label: 'Conflict Resolution' },
    { key: 'happyHomeVision', label: 'Happy Home Vision' },
    { key: 'dealBreakers', label: 'Deal Breakers' },
    { key: 'spiritualGrowth', label: 'Spiritual Growth' },
    { key: 'hobbiesInterests', label: 'Hobbies & Interests' },
  ]

  const allFields = [...requiredFields, ...questionnaireFields]
  const filledFields = allFields.filter((field) => {
    const value = (profile as any)[field.key]
    if (field.key === 'photos') {
      return value && Array.isArray(value) && value.length > 0
    }
    return value && value.toString().trim().length > 0
  })

  const missingFields = allFields
    .filter((field) => {
      const value = (profile as any)[field.key]
      if (field.key === 'photos') {
        return !value || !Array.isArray(value) || value.length === 0
      }
      return !value || value.toString().trim().length === 0
    })
    .map((field) => field.label)

  const percentage = Math.round((filledFields.length / allFields.length) * 100)

  return {
    percentage,
    missingFields,
  }
}
