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

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { userId } = params

    // Check if there's a message request between these users
    // This ensures users can only view profiles of people who sent them requests
    // Check if user sent request to this userId
    const { data: sentRequests, error: sentError } = await supabaseAdmin
      .from('message_requests')
      .select('id, status')
      .eq('sender_id', session.user.id)
      .eq('receiver_id', userId)
      .limit(1)

    // Check if this userId sent request to user
    const { data: receivedRequests, error: receivedError } = await supabaseAdmin
      .from('message_requests')
      .select('id, status')
      .eq('sender_id', userId)
      .eq('receiver_id', session.user.id)
      .limit(1)

    const sentRequest = sentRequests && sentRequests.length > 0 ? sentRequests[0] : null
    const receivedRequest = receivedRequests && receivedRequests.length > 0 ? receivedRequests[0] : null
    const request = sentRequest || receivedRequest

    if (!request) {
      return NextResponse.json(
        { error: 'No connection request found' },
        { status: 403 }
      )
    }

    // Fetch profile with related user for ID verification status
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*, photos(*), users!profiles_user_id_fkey(id_verified)')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }
    
    // Extract id_verified from related user (handle array or object)
    let user
    if ((profile as any).users) {
      user = Array.isArray((profile as any).users) ? (profile as any).users[0] : (profile as any).users
    }
    const idVerified = user?.id_verified ?? false
    delete (profile as any).users

    return NextResponse.json(
      { profile: { ...formatProfile(profile), idVerified } },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile view error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
