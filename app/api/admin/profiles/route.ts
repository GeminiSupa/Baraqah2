import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const searchParams = req.nextUrl.searchParams
    const status = searchParams.get('status') || 'pending' // 'pending', 'approved', 'rejected', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('profiles')
      .select(`
        *,
        users!profiles_user_id_fkey(id, email, phone, id_verified, profile_active),
        photos(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('moderation_status', status)
    }

    const { data: profiles, error } = await query

    if (error) {
      console.error('Profiles fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch profiles' },
        { status: 500 }
      )
    }

    // Get total count
    let countQuery = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (status !== 'all') {
      countQuery = countQuery.eq('moderation_status', status)
    }

    const { count: totalCount } = await countQuery

    const formattedProfiles = (profiles || []).map((profile: any) => {
      const user = Array.isArray(profile.users) ? profile.users[0] : profile.users
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
        moderationStatus: profile.moderation_status || 'pending',
        moderationNotes: profile.moderation_notes,
        moderatedAt: profile.moderated_at,
        createdAt: profile.created_at,
        user: user ? {
          id: user.id,
          email: user.email,
          phone: user.phone,
          idVerified: user.id_verified,
          profileActive: user.profile_active,
        } : null,
        photos: (profile.photos || []).map((p: any) => ({
          id: p.id,
          url: p.url,
          isPrimary: p.is_primary,
        })),
      }
    })

    return NextResponse.json({
      profiles: formattedProfiles,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Profiles fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { profileId, action, notes } = body

    if (!profileId || !action) {
      return NextResponse.json(
        { error: 'profileId and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve or reject' },
        { status: 400 }
      )
    }

    const moderationStatus = action === 'approve' ? 'approved' : 'rejected'
    const updateData: any = {
      moderation_status: moderationStatus,
      moderation_notes: notes || null,
      moderated_by: session.user.id,
      moderated_at: new Date().toISOString(),
    }

    // If approving, also activate the user's profile
    if (action === 'approve') {
      // Get user_id from profile
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('user_id')
        .eq('id', profileId)
        .single()

      if (profile) {
        // Activate user profile
        await supabaseAdmin
          .from('users')
          .update({ profile_active: true })
          .eq('id', profile.user_id)
      }
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', profileId)
      .select('id, moderation_status')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update profile status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: `Profile ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
        profile: {
          id: updatedProfile.id,
          moderationStatus: updatedProfile.moderation_status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
