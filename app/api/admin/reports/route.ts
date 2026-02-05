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
    const status = searchParams.get('status') || 'pending' // 'pending', 'reviewed', 'resolved', 'dismissed', 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Fetch reports
    let query = supabaseAdmin
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Reports fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch reports', details: error.message },
        { status: 500 }
      )
    }

    // Fetch related user data separately
    const reporterIds = [...new Set((reports || []).map((r: any) => r.reporter_id))]
    const reportedUserIds = [...new Set((reports || []).map((r: any) => r.reported_user_id))]
    const allUserIds = [...new Set([...reporterIds, ...reportedUserIds])]

    let usersMap: any = {}
    let profilesMap: any = {}

    if (allUserIds.length > 0) {
      // Fetch users
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', allUserIds)

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = { id: u.id, email: u.email }
        })
      }

      // Fetch profiles
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, first_name, last_name')
        .in('user_id', allUserIds)

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

    // Get total count
    let countQuery = supabaseAdmin
      .from('reports')
      .select('*', { count: 'exact', head: true })

    if (status !== 'all') {
      countQuery = countQuery.eq('status', status)
    }

    const { count: totalCount } = await countQuery

    const formattedReports = (reports || []).map((report: any) => {
      const reporter = usersMap[report.reporter_id]
      const reportedUser = usersMap[report.reported_user_id]
      const reporterProfile = profilesMap[report.reporter_id]
      const reportedProfile = profilesMap[report.reported_user_id]

      return {
        id: report.id,
        reporterId: report.reporter_id,
        reportedUserId: report.reported_user_id,
        reason: report.reason,
        description: report.description,
        status: report.status,
        adminNotes: report.admin_notes,
        reviewedBy: report.reviewed_by,
        reviewedAt: report.reviewed_at,
        createdAt: report.created_at,
        reporter: reporter ? {
          id: reporter.id,
          email: reporter.email,
          name: reporterProfile ? `${reporterProfile.firstName} ${reporterProfile.lastName}` : null,
        } : null,
        reportedUser: reportedUser ? {
          id: reportedUser.id,
          email: reportedUser.email,
          name: reportedProfile ? `${reportedProfile.firstName} ${reportedProfile.lastName}` : null,
        } : null,
      }
    })

    return NextResponse.json({
      reports: formattedReports,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit),
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Reports fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
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
    const { reportId, action, adminNotes, suspendUser } = body

    if (!reportId || !action) {
      return NextResponse.json(
        { error: 'reportId and action are required' },
        { status: 400 }
      )
    }

    if (!['reviewed', 'resolved', 'dismissed'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be reviewed, resolved, or dismissed' },
        { status: 400 }
      )
    }

    // Get report details
    const { data: report } = await supabaseAdmin
      .from('reports')
      .select('reported_user_id, reason')
      .eq('id', reportId)
      .single()

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      )
    }

    // Update report status
    const updateData: any = {
      status: action,
      admin_notes: adminNotes || null,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    }

    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
      .select('id, status')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update report status' },
        { status: 500 }
      )
    }

    // If action is to suspend the reported user
    if (suspendUser && action === 'resolved') {
      await supabaseAdmin
        .from('users')
        .update({
          is_suspended: true,
          suspension_reason: `Reported: ${report.reason}. ${adminNotes || ''}`,
          suspended_by: session.user.id,
          suspended_at: new Date().toISOString(),
          profile_active: false,
        })
        .eq('id', report.reported_user_id)
    }

    return NextResponse.json(
      {
        message: `Report ${action} successfully`,
        report: {
          id: updatedReport.id,
          status: updatedReport.status,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Report update error:', error)
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    )
  }
}
