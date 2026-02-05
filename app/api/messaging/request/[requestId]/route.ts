import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { requestId } = params
    const body = await req.json()
    const { status, connectionStatus, rejectionReason } = body

    if (status && !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      )
    }

    if (connectionStatus && !['pending', 'accepted', 'questionnaire_sent', 'questionnaire_completed', 'connected', 'rejected'].includes(connectionStatus)) {
      return NextResponse.json(
        { error: 'Invalid connection status' },
        { status: 400 }
      )
    }

    // Check if request exists and user is the receiver (or sender for connection status updates)
    const { data: messageRequest, error: fetchError } = await supabaseAdmin
      .from('message_requests')
      .select('id, receiver_id, sender_id, status, connection_status')
      .eq('id', requestId)
      .single()

    if (fetchError || !messageRequest) {
      return NextResponse.json(
        { error: 'Message request not found' },
        { status: 404 }
      )
    }

    // For status updates (approve/reject), only receiver can do it
    if (status) {
      if (messageRequest.receiver_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to update this request' },
          { status: 403 }
        )
      }

      if (messageRequest.status !== 'pending') {
        return NextResponse.json(
          { error: 'Request has already been processed' },
          { status: 400 }
        )
      }
    }

    // For connection status updates, both parties can update
    if (connectionStatus && !status) {
      if (messageRequest.sender_id !== session.user.id && messageRequest.receiver_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Unauthorized to update this request' },
          { status: 403 }
        )
      }
    }

    // Build update object
    const updateData: any = {}
    if (status) {
      updateData.status = status
      // When approving, also set connection_status to accepted
      if (status === 'approved') {
        updateData.connection_status = connectionStatus || 'accepted'
      } else if (status === 'rejected') {
        updateData.connection_status = connectionStatus || 'rejected'
        if (rejectionReason) {
          updateData.rejection_reason = rejectionReason
        }
      }
    }
    if (connectionStatus) {
      updateData.connection_status = connectionStatus
      if (connectionStatus === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }
    }

    // Update request status
    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('message_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update request' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: status ? `Request ${status}` : 'Request updated', 
        request: {
          id: updatedRequest.id,
          senderId: updatedRequest.sender_id,
          receiverId: updatedRequest.receiver_id,
          status: updatedRequest.status,
          connectionStatus: updatedRequest.connection_status,
          message: updatedRequest.message,
          createdAt: updatedRequest.created_at,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    )
  }
}