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
    const userId = searchParams.get('userId')
    const type = searchParams.get('type') || 'overview' // 'overview', 'user-detail', 'suspicious-activity'

    if (type === 'user-detail' && userId) {
      // Get detailed monitoring data for a specific user
      const [userData, messagesData, reportsData, requestsData] = await Promise.all([
        // User info
        supabaseAdmin
          .from('users')
          .select('id, email, phone, created_at, profile_active, is_suspended')
          .eq('id', userId)
          .single(),

        // Message statistics
        supabaseAdmin
          .from('messages')
          .select('id, sender_id, receiver_id, content, created_at, is_read')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(100),

        // Reports involving this user
        supabaseAdmin
          .from('reports')
          .select('*')
          .or(`reporter_id.eq.${userId},reported_user_id.eq.${userId}`),

        // Message requests
        supabaseAdmin
          .from('message_requests')
          .select('id, sender_id, receiver_id, status, connection_status, created_at')
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(50),
      ])

      const user = userData.data
      const messages = messagesData.data || []
      const reports = reportsData.data || []
      const requests = requestsData.data || []

      // Calculate statistics
      const messagesSent = messages.filter(m => m.sender_id === userId).length
      const messagesReceived = messages.filter(m => m.receiver_id === userId).length
      const reportsMade = reports.filter(r => r.reporter_id === userId).length
      const reportsReceived = reports.filter(r => r.reported_user_id === userId).length
      const requestsSent = requests.filter(r => r.sender_id === userId).length
      const requestsReceived = requests.filter(r => r.receiver_id === userId).length
      const rejectedRequests = requests.filter(r => r.receiver_id === userId && r.status === 'rejected').length

      // Flag suspicious patterns
      const suspiciousFlags: string[] = []
      if (reportsReceived >= 3) {
        suspiciousFlags.push(`High number of reports received (${reportsReceived})`)
      }
      if (rejectedRequests >= 5) {
        suspiciousFlags.push(`High rejection rate (${rejectedRequests} rejections)`)
      }
      if (messagesSent > 100 && messagesReceived < 10) {
        suspiciousFlags.push('Unusually high message send/receive ratio - possible spam')
      }
      if (requestsSent > 20 && requestsReceived < 2) {
        suspiciousFlags.push('High number of requests sent with low acceptance rate')
      }

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const recentMessages = messages.filter(m => new Date(m.created_at) >= sevenDaysAgo)
      const recentRequests = requests.filter(r => new Date(r.created_at) >= sevenDaysAgo)

      return NextResponse.json({
        user: {
          id: user?.id,
          email: user?.email,
          phone: user?.phone,
          createdAt: user?.created_at,
          profileActive: user?.profile_active,
          isSuspended: user?.is_suspended,
        },
        statistics: {
          messagesSent,
          messagesReceived,
          reportsMade,
          reportsReceived,
          requestsSent,
          requestsReceived,
          rejectedRequests,
          recentActivity: {
            messagesLast7Days: recentMessages.length,
            requestsLast7Days: recentRequests.length,
          },
        },
        suspiciousFlags,
        recentMessages: recentMessages.slice(0, 20).map(m => ({
          id: m.id,
          isSent: m.sender_id === userId,
          content: m.content.substring(0, 100), // Preview only
          createdAt: m.created_at,
          isRead: m.is_read,
        })),
        recentRequests: recentRequests.slice(0, 20),
        allReports: reports.map(r => ({
          id: r.id,
          isReporter: r.reporter_id === userId,
          reason: r.reason,
          status: r.status,
          createdAt: r.created_at,
        })),
      }, { status: 200 })
    }

    if (type === 'suspicious-activity') {
      // Get users with suspicious activity patterns
      const allUsers = await supabaseAdmin
        .from('users')
        .select('id, email, created_at, is_suspended')
        .eq('is_admin', false)
        .limit(1000)

      const suspiciousUsers: any[] = []

      for (const user of (allUsers.data || [])) {
        const [reportsReceived, requestsRejected, messagesData] = await Promise.all([
          supabaseAdmin
            .from('reports')
            .select('id', { count: 'exact', head: true })
            .eq('reported_user_id', user.id),
          
          supabaseAdmin
            .from('message_requests')
            .select('id', { count: 'exact', head: true })
            .eq('receiver_id', user.id)
            .eq('status', 'rejected'),
          
          supabaseAdmin
            .from('messages')
            .select('sender_id, receiver_id')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .limit(100),
        ])

        const reportsCount = reportsReceived.count || 0
        const rejectedCount = requestsRejected.count || 0
        const messages = messagesData.data || []
        const sent = messages.filter(m => m.sender_id === user.id).length
        const received = messages.filter(m => m.receiver_id === user.id).length

        const flags: string[] = []
        if (reportsCount >= 3) flags.push(`${reportsCount} reports received`)
        if (rejectedCount >= 5) flags.push(`${rejectedCount} requests rejected`)
        if (sent > 50 && received < 5) flags.push('High send/receive ratio')

        if (flags.length > 0) {
          suspiciousUsers.push({
            id: user.id,
            email: user.email,
            createdAt: user.created_at,
            isSuspended: user.is_suspended,
            flags,
            reportsCount,
            rejectedCount,
            messageRatio: received > 0 ? (sent / received).toFixed(2) : sent.toString(),
          })
        }
      }

      return NextResponse.json({
        suspiciousUsers: suspiciousUsers.sort((a, b) => b.flags.length - a.flags.length),
      }, { status: 200 })
    }

    // Overview/default: Get platform-wide monitoring stats
    const [totalUsers, activeUsers, suspendedUsers, totalMessages, totalReports, recentReports] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false),
      
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false)
        .eq('profile_active', true)
        .eq('is_suspended', false),
      
      supabaseAdmin
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false)
        .eq('is_suspended', true),
      
      supabaseAdmin
        .from('messages')
        .select('*', { count: 'exact', head: true }),
      
      supabaseAdmin
        .from('reports')
        .select('*', { count: 'exact', head: true }),
      
      supabaseAdmin
        .from('reports')
        .select('id, reported_user_id, reason, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Get users with most reports
    const usersWithReports = await supabaseAdmin
      .from('reports')
      .select('reported_user_id')
      .eq('status', 'pending')

    const reportCounts: Record<string, number> = {}
    usersWithReports.data?.forEach(r => {
      reportCounts[r.reported_user_id] = (reportCounts[r.reported_user_id] || 0) + 1
    })

    const topReportedUsers = Object.entries(reportCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([userId, count]) => ({ userId, count }))

    return NextResponse.json({
      overview: {
        totalUsers: totalUsers.count || 0,
        activeUsers: activeUsers.count || 0,
        suspendedUsers: suspendedUsers.count || 0,
        totalMessages: totalMessages.count || 0,
        totalReports: totalReports.count || 0,
        pendingReports: recentReports.data?.length || 0,
      },
      topReportedUsers,
      recentReports: recentReports.data || [],
    }, { status: 200 })
  } catch (error) {
    console.error('Monitoring fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}
