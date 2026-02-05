import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const notifications: any[] = []

    // 1. Check for unread messages
    const { data: unreadMessages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('receiver_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!messagesError && unreadMessages && unreadMessages.length > 0) {
      // Get sender info
      const senderIds = [...new Set(unreadMessages.map((m: any) => m.sender_id))]
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', senderIds)

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds)

      const usersMap: any = {}
      const profilesMap: any = {}

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = u.email
        })
      }

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = `${p.first_name} ${p.last_name}`
        })
      }

      unreadMessages.forEach((msg: any) => {
        const senderName = profilesMap[msg.sender_id] || usersMap[msg.sender_id] || 'Someone'
        notifications.push({
          id: `message-${msg.id}`,
          type: 'message',
          title: `New message from ${senderName}`,
          message: msg.content.substring(0, 100) + (msg.content.length > 100 ? '...' : ''),
          link: `/messaging/${msg.sender_id}`,
          createdAt: msg.created_at,
        })
      })
    }

    // 2. Check for pending message requests
    const { data: pendingRequests, error: requestsError } = await supabaseAdmin
      .from('message_requests')
      .select('id, sender_id, message, created_at')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!requestsError && pendingRequests && pendingRequests.length > 0) {
      const senderIds = [...new Set(pendingRequests.map((r: any) => r.sender_id))]
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', senderIds)

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds)

      const usersMap: any = {}
      const profilesMap: any = {}

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = u.email
        })
      }

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = `${p.first_name} ${p.last_name}`
        })
      }

      pendingRequests.forEach((req: any) => {
        const senderName = profilesMap[req.sender_id] || usersMap[req.sender_id] || 'Someone'
        notifications.push({
          id: `request-${req.id}`,
          type: 'request',
          title: `New connection request from ${senderName}`,
          message: req.message || 'Wants to connect with you',
          link: `/messaging/request/${req.id}`,
          createdAt: req.created_at,
        })
      })
    }

    // 3. Check for pending questionnaires to answer
    const { data: pendingQuestionnaires, error: questionnaireError } = await supabaseAdmin
      .from('custom_questionnaires')
      .select('id, request_id, sender_id, created_at')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10)

    if (!questionnaireError && pendingQuestionnaires && pendingQuestionnaires.length > 0) {
      const senderIds = [...new Set(pendingQuestionnaires.map((q: any) => q.sender_id))]
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', senderIds)

      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', senderIds)

      const usersMap: any = {}
      const profilesMap: any = {}

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = u.email
        })
      }

      if (profiles) {
        profiles.forEach((p: any) => {
          profilesMap[p.user_id] = `${p.first_name} ${p.last_name}`
        })
      }

      pendingQuestionnaires.forEach((q: any) => {
        const senderName = profilesMap[q.sender_id] || usersMap[q.sender_id] || 'Someone'
        notifications.push({
          id: `questionnaire-${q.id}`,
          type: 'questionnaire',
          title: `Questions from ${senderName}`,
          message: 'You have pending questions to answer',
          link: `/messaging/questionnaire/${q.request_id}`,
          createdAt: q.created_at,
        })
      })
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const unreadCount = notifications.length

    return NextResponse.json({
      notifications: notifications.slice(0, 20), // Limit to 20 most recent
      unreadCount,
    }, { status: 200 })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
