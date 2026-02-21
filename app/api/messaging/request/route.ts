import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createNotification, getUserDisplayName } from '@/lib/notifications'
import { z } from 'zod'

const requestSchema = z.object({
  receiverId: z.string(),
  message: z.string().optional(),
})

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
    const { receiverId, message } = requestSchema.parse(body)

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send request to yourself' },
        { status: 400 }
      )
    }

    // Check if receiver exists and has active profile
    const { data: receiver, error: receiverError } = await supabaseAdmin
      .from('users')
      .select('id, profile_active, id_verified')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiver || !receiver.profile_active || !receiver.id_verified) {
      return NextResponse.json(
        { error: 'User not found or profile not active' },
        { status: 404 }
      )
    }

    // Check if request already exists
    const { data: existingRequest } = await supabaseAdmin
      .from('message_requests')
      .select('id, status, connection_status')
      .eq('sender_id', session.user.id)
      .eq('receiver_id', receiverId)
      .in('status', ['pending', 'approved'])
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Message request already exists' },
        { status: 400 }
      )
    }

    // Create message request
    const { data: messageRequest, error: insertError } = await supabaseAdmin
      .from('message_requests')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        message: message || null,
        status: 'pending',
        connection_status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message request' },
        { status: 500 }
      )
    }

    // Create notification for receiver
    try {
      const senderName = await getUserDisplayName(session.user.id)
      await createNotification({
        userId: receiverId,
        type: 'request',
        title: `New connection request from ${senderName}`,
        message: message || 'Wants to connect with you',
        link: `/messaging/request/${messageRequest.id}`,
        metadata: { requestId: messageRequest.id, senderId: session.user.id },
        dedupeKey: `request:${messageRequest.id}`,
      })
    } catch (e) {
      console.error('Failed to create request notification:', e)
    }

    return NextResponse.json(
      { 
        message: 'Message request sent successfully', 
        request: {
          id: messageRequest.id,
          senderId: messageRequest.sender_id,
          receiverId: messageRequest.receiver_id,
          status: messageRequest.status,
          connectionStatus: messageRequest.connection_status,
          message: messageRequest.message,
          createdAt: messageRequest.created_at,
        }
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Message request error:', error)
    return NextResponse.json(
      { error: 'Failed to send message request' },
      { status: 500 }
    )
  }
}