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

    // Get pending verifications
    const { count: pendingVerifications } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .not('id_document_url', 'is', null)
      .eq('id_verified', false)

    // Get pending profiles (profiles with moderation_status = 'pending')
    const { count: pendingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('moderation_status', 'pending')

    // Get pending reports
    const { count: pendingReports } = await supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get total users
    const { count: totalUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false)

    // Get active users (with active profiles)
    const { count: activeUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('profile_active', true)
      .eq('is_admin', false)

    // Get suspended users
    const { count: suspendedUsers } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_suspended', true)
      .eq('is_admin', false)

    return NextResponse.json({
      stats: {
        pendingVerifications: pendingVerifications || 0,
        pendingProfiles: pendingProfiles || 0,
        pendingReports: pendingReports || 0,
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        suspendedUsers: suspendedUsers || 0,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
