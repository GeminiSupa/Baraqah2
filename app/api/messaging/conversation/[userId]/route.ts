import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

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

    // Verify conversation exists (approved request)
    const { data: approvedRequest } = await supabaseAdmin
      .from('message_requests')
      .select('id')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${userId},status.eq.approved),and(sender_id.eq.${userId},receiver_id.eq.${session.user.id},status.eq.approved)`)
      .single()

    if (!approvedRequest) {
      return NextResponse.json(
        { error: 'Conversation not found or not approved' },
        { status: 404 }
      )
    }

    // Fetch all messages between users (simpler query without foreign keys)
    const { data: messagesData, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${session.user.id})`)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('Messages fetch error:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      )
    }

    // Get unique sender IDs
    const senderIds = [...new Set((messagesData || []).map((msg: any) => msg.sender_id))]
    
    // Fetch users and profiles separately
    let usersMap: any = {}
    let profilesMap: any = {}

    if (senderIds.length > 0) {
      // Fetch users
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, email')
        .in('id', senderIds)

      if (users) {
        users.forEach((u: any) => {
          usersMap[u.id] = { id: u.id, email: u.email }
        })
      }

      // Fetch profiles
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, first_name, last_name')
        .in('user_id', senderIds)

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

    // Format messages
    const messages = (messagesData || []).map((msg: any) => {
      const sender = usersMap[msg.sender_id] || { id: msg.sender_id, email: '' }
      const profile = profilesMap[msg.sender_id] || null
      
      return {
        id: msg.id,
        content: msg.content,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        isRead: msg.is_read,
        createdAt: msg.created_at,
        sender: {
          id: sender.id,
          email: sender.email,
          profile: profile ? {
            firstName: profile.firstName,
            lastName: profile.lastName,
          } : null,
        },
      }
    })

    // Also fetch the other user's profile for the response
    const otherUserId = userId
    let otherUserProfile = null
    
    const { data: otherUser } = await supabaseAdmin
      .from('users')
      .select('id, email, id_verified')
      .eq('id', otherUserId)
      .single()

    if (otherUser) {
      const { data: otherProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, user_id, first_name, last_name')
        .eq('user_id', otherUserId)
        .single()

      if (otherProfile) {
        otherUserProfile = {
          id: otherUser.id,
          email: otherUser.email,
          idVerified: otherUser.id_verified ?? false,
          profile: {
            firstName: otherProfile.first_name,
            lastName: otherProfile.last_name,
          },
        }
      } else {
        otherUserProfile = {
          id: otherUser.id,
          email: otherUser.email,
          idVerified: otherUser.id_verified ?? false,
          profile: null,
        }
      }
    }

    // Mark messages as read
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', session.user.id)
      .eq('sender_id', userId)
      .eq('is_read', false)

    return NextResponse.json({ 
      messages,
      otherUser: otherUserProfile,
    }, { status: 200 })
  } catch (error) {
    console.error('Fetch conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}