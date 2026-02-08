import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { filterPersonalInfo } from '@/lib/message-filter'
import { z } from 'zod'

const messageSchema = z.object({
  receiverId: z.string(),
  content: z.string().min(1),
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
    const { receiverId, content } = messageSchema.parse(body)

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    // Check if there's an approved message request with valid connection status
    // Allow messaging if status is approved AND connection_status allows messaging
    const { data: approvedRequest } = await supabaseAdmin
      .from('message_requests')
      .select('id, connection_status')
      .or(`and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId},status.eq.approved),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id},status.eq.approved)`)
      .in('connection_status', ['questionnaire_completed', 'connected'])
      .single()

    if (!approvedRequest) {
      return NextResponse.json(
        { error: 'Message request must be approved and questionnaire completed first. Please complete the compatibility questionnaire.' },
        { status: 403 }
      )
    }

    // Filter personal information from message
    const { filtered, containsBlockedContent, blockedItems } = filterPersonalInfo(content)

    // If blocked content was found, warn user but still send filtered message
    if (containsBlockedContent) {
      console.warn(`Blocked personal info from user ${session.user.id}:`, blockedItems)
    }

    // Create message
    const { data: createdMessage, error: insertError } = await supabaseAdmin
      .from('messages')
      .insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        content: filtered,
        is_read: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Message sent successfully',
        messageData: {
          id: createdMessage.id,
          senderId: createdMessage.sender_id,
          receiverId: createdMessage.receiver_id,
          content: createdMessage.content,
          isRead: createdMessage.is_read,
          createdAt: createdMessage.created_at,
        },
        blockedContent: containsBlockedContent ? blockedItems : undefined,
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

    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}