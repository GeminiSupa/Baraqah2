import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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
    photos: (profile.photos || []).map((p: any) => ({
      id: p.id,
      url: p.url,
      isPrimary: p.is_primary,
      privacy: p.privacy,
    })),
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

    const searchParams = req.nextUrl.searchParams
    const gender = searchParams.get('gender')
    const minAge = searchParams.get('minAge')
    const maxAge = searchParams.get('maxAge')
    const location = searchParams.get('location')
    const city = searchParams.get('city')
    const education = searchParams.get('education')
    const profession = searchParams.get('profession')
    const prayerPractice = searchParams.get('prayerPractice')
    const sectPreference = searchParams.get('sectPreference')

    // Start building query - filter by active and verified users, public profiles, approved moderation status, exclude current user
    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        photos(*),
        users!profiles_user_id_fkey(profile_active, id_verified, is_suspended)
      `)
      .eq('profile_visibility', 'public')
      .eq('moderation_status', 'approved') // Only show approved profiles
      .neq('user_id', session.user.id)
      .limit(50)
      .order('created_at', { ascending: false })

    // Filter by gender
    if (gender) {
      query = query.eq('gender', gender)
    }

    // Filter by age range
    if (minAge) {
      query = query.gte('age', parseInt(minAge))
    }
    if (maxAge) {
      query = query.lte('age', parseInt(maxAge))
    }

    // Filter by location (case-insensitive)
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    // Filter by city
    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    // Filter by education
    if (education) {
      query = query.ilike('education', `%${education}%`)
    }

    // Filter by profession
    if (profession) {
      query = query.ilike('profession', `%${profession}%`)
    }

    // Filter by prayer practice
    if (prayerPractice) {
      query = query.eq('prayer_practice', prayerPractice)
    }

    // Filter by sect preference
    if (sectPreference) {
      query = query.eq('sect_preference', sectPreference)
    }

    const { data: profilesData, error } = await query

    if (error) {
      console.error('Browse profiles error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    // Filter profiles to only include those with active and non-suspended users
    // Also filter photos by privacy
    const profiles = (profilesData || [])
      .filter((p: any) => {
        // Get user data - handle both array and object formats
        let user
        if (p.users) {
          user = Array.isArray(p.users) ? p.users[0] : p.users
        } else {
          // If users relation didn't load, be conservative and hide profile
          return false
        }
        if (!user) return false
        if (user.is_suspended) return false
        // Show all active profiles regardless of ID verification status,
        // so the browse page isn't empty in early stages.
        return user.profile_active
      })
      .map((p: any) => {
        const profile = { ...p }
        // Filter photos by privacy
        if (profile.photos) {
          profile.photos = profile.photos.filter((photo: any) => photo.privacy === 'public')
        }
        delete profile.users
        return formatProfile(profile)
      })

    return NextResponse.json({ profiles }, { status: 200 })
  } catch (error) {
    console.error('Browse profiles error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}