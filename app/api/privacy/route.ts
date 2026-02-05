import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private', 'verified-only']).optional(),
  photoPrivacy: z.enum(['public', 'private', 'connections-only']).optional(),
  questionnairePrivacy: z.enum(['public', 'private', 'connections-only']).optional(),
  hideFromSearch: z.boolean().optional(),
  showOnlineStatus: z.boolean().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get privacy settings
    const { data: settings } = await supabaseAdmin
      .from('privacy_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // Get blocked users
    const { data: blocked } = await supabaseAdmin
      .from('blocked_users')
      .select('blocked_id, created_at, blocked_user:users!blocked_users_blocked_id_fkey(id, email, profiles(first_name, last_name))')
      .eq('blocker_id', session.user.id)

    return NextResponse.json({
      settings: settings || {
        profileVisibility: 'public',
        photoPrivacy: 'private',
        questionnairePrivacy: 'private',
        hideFromSearch: false,
        showOnlineStatus: true,
      },
      blockedUsers: (blocked || []).map((b: any) => ({
        id: b.blocked_id,
        blockedAt: b.created_at,
        user: b.blocked_user,
      })),
    }, { status: 200 })
  } catch (error) {
    console.error('Privacy fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = privacySettingsSchema.parse(body)

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.profileVisibility !== undefined) {
      updateData.profile_visibility = data.profileVisibility
    }
    if (data.photoPrivacy !== undefined) {
      updateData.photo_privacy = data.photoPrivacy
    }
    if (data.questionnairePrivacy !== undefined) {
      updateData.questionnaire_privacy = data.questionnairePrivacy
    }
    if (data.hideFromSearch !== undefined) {
      updateData.hide_from_search = data.hideFromSearch
    }
    if (data.showOnlineStatus !== undefined) {
      updateData.show_online_status = data.showOnlineStatus
    }

    // Upsert privacy settings
    const { data: settings, error } = await supabaseAdmin
      .from('privacy_settings')
      .upsert({
        user_id: session.user.id,
        ...updateData,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Update error:', error)
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Privacy settings updated successfully',
      settings,
    }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Privacy update error:', error)
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
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

    const body = await req.json()
    const { action, userId } = body

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'action and userId are required' },
        { status: 400 }
      )
    }

    if (action === 'block') {
      const { error } = await supabaseAdmin
        .from('blocked_users')
        .insert({
          blocker_id: session.user.id,
          blocked_id: userId,
        })

      if (error) {
        console.error('Block error:', error)
        return NextResponse.json(
          { error: 'Failed to block user' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'User blocked successfully' },
        { status: 200 }
      )
    } else if (action === 'unblock') {
      const { error } = await supabaseAdmin
        .from('blocked_users')
        .delete()
        .eq('blocker_id', session.user.id)
        .eq('blocked_id', userId)

      if (error) {
        console.error('Unblock error:', error)
        return NextResponse.json(
          { error: 'Failed to unblock user' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'User unblocked successfully' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Block/unblock error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
