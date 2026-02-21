import { z } from 'zod'

type TFn = (key: string, params?: Record<string, string | number>) => string

const optionalTrimmedString = (max: number, message: string) =>
  z.preprocess(
    (v) => {
      if (typeof v !== 'string') return v
      const trimmed = v.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z.string().max(max, message).optional()
  )

export function createProfileSchema(t: TFn) {
  const required = (key: string) => t(key)

  return z.object({
    firstName: z
      .string()
      .trim()
      .min(2, required('validation.firstNameMin')),
    lastName: z
      .string()
      .trim()
      .min(2, required('validation.lastNameMin')),
    age: z.preprocess(
      (v) => {
        if (typeof v === 'number') return v
        if (typeof v !== 'string') return v
        const n = parseInt(v, 10)
        return Number.isFinite(n) ? n : v
      },
      z
        .number({ invalid_type_error: required('validation.ageInvalid') })
        .int(required('validation.ageInvalid'))
        .min(18, required('validation.ageInvalid'))
        .max(100, required('validation.ageInvalid'))
    ),
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: required('validation.genderRequired') }),
    }),
    city: z.string().trim().min(1, required('validation.cityRequired')),
    location: optionalTrimmedString(120, required('validation.locationMax')),
    bio: optionalTrimmedString(1000, required('validation.bioMax')),
    education: optionalTrimmedString(120, required('validation.educationMax')),
    profession: optionalTrimmedString(120, required('validation.professionMax')),

    sectPreference: optionalTrimmedString(80, required('validation.sectPreferenceMax')),
    prayerPractice: optionalTrimmedString(80, required('validation.prayerPracticeMax')),
    hijabPreference: optionalTrimmedString(80, required('validation.hijabPreferenceMax')),

    photoPrivacy: z.enum(['private', 'public', 'verified-only', 'connections-only']).default('private'),
    profileVisibility: z.enum(['public', 'private', 'verified-only']).default('public'),
  })
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>

