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
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all' // 'all', 'active', 'suspended'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Build base query - select all user fields (including optional suspension fields)
    let query: any = supabaseAdmin
      .from('users')
      .select('id, email, phone, email_verified, phone_verified, id_verified, profile_active, is_suspended, suspension_reason, created_at')
      .eq('is_admin', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Apply status filter (only if is_suspended field exists)
    if (status === 'suspended') {
      query = query.eq('is_suspended', true)
    } else if (status === 'active') {
      query = query.eq('is_suspended', false).eq('profile_active', true)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Users fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    // Fetch profiles separately for users
    const userIds = (users || []).map((u: any) => u.id)
    let profilesMap: any = {}
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, first_name, last_name')
        .in('user_id', userIds)
      
      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = {
            id: p.id,
            firstName: p.first_name,
            lastName: p.last_name,
          }
        })
      }
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false)

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    if (status === 'suspended') {
      countQuery = countQuery.eq('is_suspended', true)
    } else if (status === 'active') {
      countQuery = countQuery.eq('is_suspended', false).eq('profile_active', true)
    }

    const { count: totalCount } = await countQuery

    const formattedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
      idVerified: user.id_verified,
      profileActive: user.profile_active,
      isSuspended: user.is_suspended || false,
      suspensionReason: user.suspension_reason || null,
      createdAt: user.created_at,
      profile: profilesMap[user.id] || null,
    }))

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const { userId, action, reason } = body

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      )
    }

    if (!['suspend', 'activate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be suspend, activate, or delete' },
        { status: 400 }
      )
    }

    if (action === 'delete') {
      // Delete user (cascade will handle related data)
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId)
        .eq('is_admin', false) // Safety check

      if (deleteError) {
        console.error('Delete error:', deleteError)
        return NextResponse.json(
          { error: 'Failed to delete user' },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { message: 'User deleted successfully' },
        { status: 200 }
      )
    }

    // Suspend or activate
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Only update suspension fields if they exist
    try {
      if (action === 'suspend') {
        updateData.is_suspended = true
        updateData.suspension_reason = reason || 'Suspended by administrator'
        updateData.suspended_by = session.user.id
        updateData.suspended_at = new Date().toISOString()
        updateData.profile_active = false
      } else if (action === 'activate') {
        updateData.is_suspended = false
        updateData.suspension_reason = null
        updateData.suspended_by = null
        updateData.suspended_at = null
      }
    } catch (e) {
      // If suspension fields don't exist, just update profile_active
      if (action === 'suspend') {
        updateData.profile_active = false
      }
    }

    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .eq('is_admin', false) // Safety check
      .select('id, email, is_suspended')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user status', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
        user: {
          id: user.id,
          email: user.email,
          isSuspended: user.is_suspended || false,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('User update error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}
