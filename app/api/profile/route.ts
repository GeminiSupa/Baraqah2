import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const profileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  age: z.number().int().min(18).max(100),
  gender: z.string(),
  bio: z.string().optional(),
  education: z.string().optional(),
  profession: z.string().optional(),
  location: z.string().optional(),
  city: z.string().min(1),
  sectPreference: z.string().optional(),
  prayerPractice: z.string().optional(),
  hijabPreference: z.string().optional(),
  photoPrivacy: z.string().default('private'),
  profileVisibility: z.string().default('public'),
  // Questionnaire fields
  marriageUnderstanding: z.string().min(1),
  lifeGoals: z.string().min(1),
  religiousPracticeImportance: z.string().min(1),
  childrenPreference: z.string().min(1),
  partnerTraits: z.string().min(1),
  marriageRoles: z.string().min(1),
  workLifeBalance: z.string().min(1),
  conflictResolution: z.string().min(1),
  happyHomeVision: z.string().min(1),
  dealBreakers: z.string().min(1),
  spiritualGrowth: z.string().min(1),
  hobbiesInterests: z.string().min(1),
})

// Helper to convert profile from snake_case to camelCase
function formatProfile(profile: any) {
  return {
    id: profile.id,
    userId: profile.user_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    age: profile.age,
    gender: profile.gender,
    bio: profile.bio,
    education: profile.education,
    profession: profile.profession,
    location: profile.location,
    city: profile.city,
    sectPreference: profile.sect_preference,
    prayerPractice: profile.prayer_practice,
    hijabPreference: profile.hijab_preference,
    photoPrivacy: profile.photo_privacy,
    profileVisibility: profile.profile_visibility,
    // Questionnaire fields
    marriageUnderstanding: profile.marriage_understanding,
    lifeGoals: profile.life_goals,
    religiousPracticeImportance: profile.religious_practice_importance,
    childrenPreference: profile.children_preference,
    partnerTraits: profile.partner_traits,
    marriageRoles: profile.marriage_roles,
    workLifeBalance: profile.work_life_balance,
    conflictResolution: profile.conflict_resolution,
    happyHomeVision: profile.happy_home_vision,
    dealBreakers: profile.deal_breakers,
    spiritualGrowth: profile.spiritual_growth,
    hobbiesInterests: profile.hobbies_interests,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
    photos: profile.photos || [],
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, photos(*)')
      .eq('user_id', session.user.id)
      .single()

    if (error) {
      // If it's a "not found" error, return 404
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        )
      }
      console.error('Profile fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: error.message },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile: formatProfile(profile) }, { status: 200 })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is ID verified (admins can bypass this check)
    if (!session.user.idVerified && !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Please verify your identity first' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const data = profileSchema.parse(body)

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      )
    }

    // Convert camelCase to snake_case for database
    const profileData = {
      user_id: session.user.id,
      first_name: data.firstName,
      last_name: data.lastName,
      age: data.age,
      gender: data.gender,
      bio: data.bio || null,
      education: data.education || null,
      profession: data.profession || null,
      location: data.location || null,
      city: data.city,
      sect_preference: data.sectPreference || null,
      prayer_practice: data.prayerPractice || null,
      hijab_preference: data.hijabPreference || null,
      photo_privacy: data.photoPrivacy,
      profile_visibility: data.profileVisibility,
      moderation_status: 'pending', // New profiles need admin approval
      // Questionnaire fields
      marriage_understanding: data.marriageUnderstanding,
      life_goals: data.lifeGoals,
      religious_practice_importance: data.religiousPracticeImportance,
      children_preference: data.childrenPreference,
      partner_traits: data.partnerTraits,
      marriage_roles: data.marriageRoles,
      work_life_balance: data.workLifeBalance,
      conflict_resolution: data.conflictResolution,
      happy_home_vision: data.happyHomeVision,
      deal_breakers: data.dealBreakers,
      spiritual_growth: data.spiritualGrowth,
      hobbies_interests: data.hobbiesInterests,
    }

    const { data: profile, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData)
      .select('*, photos(*)')
      .single()

    if (insertError) {
      console.error('Profile creation error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Profile created successfully', profile: formatProfile(profile) },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = profileSchema.partial().parse(body)

    // Convert camelCase to snake_case for database
    const updateData: any = {}
    if (data.firstName) updateData.first_name = data.firstName
    if (data.lastName) updateData.last_name = data.lastName
    if (data.age !== undefined) updateData.age = data.age
    if (data.gender) updateData.gender = data.gender
    if (data.bio !== undefined) updateData.bio = data.bio
    if (data.education !== undefined) updateData.education = data.education
    if (data.profession !== undefined) updateData.profession = data.profession
    if (data.location !== undefined) updateData.location = data.location
    if (data.city !== undefined) updateData.city = data.city
    if (data.sectPreference !== undefined) updateData.sect_preference = data.sectPreference
    if (data.prayerPractice !== undefined) updateData.prayer_practice = data.prayerPractice
    if (data.hijabPreference !== undefined) updateData.hijab_preference = data.hijabPreference
    if (data.photoPrivacy !== undefined) updateData.photo_privacy = data.photoPrivacy
    if (data.profileVisibility !== undefined) updateData.profile_visibility = data.profileVisibility
    // Questionnaire fields
    if (data.marriageUnderstanding !== undefined) updateData.marriage_understanding = data.marriageUnderstanding
    if (data.lifeGoals !== undefined) updateData.life_goals = data.lifeGoals
    if (data.religiousPracticeImportance !== undefined) updateData.religious_practice_importance = data.religiousPracticeImportance
    if (data.childrenPreference !== undefined) updateData.children_preference = data.childrenPreference
    if (data.partnerTraits !== undefined) updateData.partner_traits = data.partnerTraits
    if (data.marriageRoles !== undefined) updateData.marriage_roles = data.marriageRoles
    if (data.workLifeBalance !== undefined) updateData.work_life_balance = data.workLifeBalance
    if (data.conflictResolution !== undefined) updateData.conflict_resolution = data.conflictResolution
    if (data.happyHomeVision !== undefined) updateData.happy_home_vision = data.happyHomeVision
    if (data.dealBreakers !== undefined) updateData.deal_breakers = data.dealBreakers
    if (data.spiritualGrowth !== undefined) updateData.spiritual_growth = data.spiritualGrowth
    if (data.hobbiesInterests !== undefined) updateData.hobbies_interests = data.hobbiesInterests

    const { data: profile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('user_id', session.user.id)
      .select('*, photos(*)')
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Profile updated successfully', profile: formatProfile(profile) },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}