import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { createNotification, getUserDisplayName } from '@/lib/notifications'
import { z } from 'zod'

const questionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().optional(),
})

const questionnaireSchema = z.object({
  questions: z.array(questionSchema).min(1).max(10), // Allow 1-10 questions
})

export async function GET(
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

    // Verify request exists and user is part of it
    const { data: messageRequest, error: requestError } = await supabaseAdmin
      .from('message_requests')
      .select('id, sender_id, receiver_id, connection_status')
      .eq('id', requestId)
      .single()

    if (requestError || !messageRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (messageRequest.sender_id !== session.user.id && messageRequest.receiver_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if connection is accepted or questionnaire flow has started
    // Allow 'connected' status as users can send custom questions even after skipping compatibility questionnaire
    const allowedStatuses = ['accepted', 'questionnaire_sent', 'questionnaire_completed', 'connected']
    if (!allowedStatuses.includes(messageRequest.connection_status)) {
      return NextResponse.json(
        { error: 'Request must be accepted first' },
        { status: 400 }
      )
    }

    // Fetch questionnaires for this request
    const { data: questionnaires, error } = await supabaseAdmin
      .from('custom_questionnaires')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questionnaires' },
        { status: 500 }
      )
    }

    // Format questionnaires
    const formatted = (questionnaires || []).map((q: any) => ({
      id: q.id,
      requestId: q.request_id,
      senderId: q.sender_id,
      receiverId: q.receiver_id,
      questions: q.questions,
      status: q.status,
      createdAt: q.created_at,
      updatedAt: q.updated_at,
    }))

    return NextResponse.json({ questionnaires: formatted }, { status: 200 })
  } catch (error) {
    console.error('Get questionnaire error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { questions } = questionnaireSchema.parse(body)

    // Verify request exists and user is part of it
    const { data: messageRequest, error: requestError } = await supabaseAdmin
      .from('message_requests')
      .select('id, sender_id, receiver_id, connection_status')
      .eq('id', requestId)
      .single()

    if (requestError || !messageRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    // Determine sender and receiver
    const isSender = messageRequest.sender_id === session.user.id
    const senderId = messageRequest.sender_id
    const receiverId = messageRequest.receiver_id

    if (!isSender && messageRequest.receiver_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if connection is accepted or questionnaire flow has started
    // Allow 'connected' status as users can send custom questions even after skipping compatibility questionnaire
    const allowedStatuses = ['accepted', 'questionnaire_sent', 'questionnaire_completed', 'connected']
    if (!allowedStatuses.includes(messageRequest.connection_status)) {
      return NextResponse.json(
        { error: 'Request must be accepted first' },
        { status: 400 }
      )
    }

    // Check if user already sent a questionnaire
    const { data: existing } = await supabaseAdmin
      .from('custom_questionnaires')
      .select('id')
      .eq('request_id', requestId)
      .eq('sender_id', session.user.id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'You have already sent a questionnaire for this request' },
        { status: 400 }
      )
    }

    // Create questionnaire
    const { data: questionnaire, error: insertError } = await supabaseAdmin
      .from('custom_questionnaires')
      .insert({
        request_id: requestId,
        sender_id: session.user.id,
        receiver_id: isSender ? receiverId : senderId,
        questions: questions.map(q => ({ question: q.question, answer: q.answer || null })),
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create questionnaire' },
        { status: 500 }
      )
    }

    // Update connection status
    await supabaseAdmin
      .from('message_requests')
      .update({ connection_status: 'questionnaire_sent' })
      .eq('id', requestId)

    // Notify receiver that questions arrived
    try {
      const senderName = await getUserDisplayName(session.user.id)
      await createNotification({
        userId: questionnaire.receiver_id,
        type: 'questionnaire',
        title: `Questions from ${senderName}`,
        message: 'You have pending questions to answer.',
        link: `/messaging/questionnaire/${requestId}`,
        metadata: { requestId, questionnaireId: questionnaire.id, senderId: session.user.id },
        dedupeKey: `questionnaire:${questionnaire.id}`,
      })
    } catch (e) {
      console.error('Failed to create questionnaire notification:', e)
    }

    return NextResponse.json(
      {
        message: 'Questionnaire sent successfully',
        questionnaire: {
          id: questionnaire.id,
          requestId: questionnaire.request_id,
          senderId: questionnaire.sender_id,
          receiverId: questionnaire.receiver_id,
          questions: questionnaire.questions,
          status: questionnaire.status,
          createdAt: questionnaire.created_at,
        },
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

    console.error('Create questionnaire error:', error)
    return NextResponse.json(
      { error: 'Failed to create questionnaire' },
      { status: 500 }
    )
  }
}

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
    const { questionnaireId, answers } = body

    if (!questionnaireId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'questionnaireId and answers array are required' },
        { status: 400 }
      )
    }

    // Verify request exists
    const { data: messageRequest, error: requestError } = await supabaseAdmin
      .from('message_requests')
      .select('id, sender_id, receiver_id, connection_status')
      .eq('id', requestId)
      .single()

    if (requestError || !messageRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      )
    }

    if (messageRequest.sender_id !== session.user.id && messageRequest.receiver_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Fetch questionnaire
    const { data: questionnaire, error: fetchError } = await supabaseAdmin
      .from('custom_questionnaires')
      .select('*')
      .eq('id', questionnaireId)
      .eq('request_id', requestId)
      .single()

    if (fetchError || !questionnaire) {
      return NextResponse.json(
        { error: 'Questionnaire not found' },
        { status: 404 }
      )
    }

    // Verify user is the receiver
    if (questionnaire.receiver_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only answer questionnaires sent to you' },
        { status: 403 }
      )
    }

    // Update questions with answers
    const questions = (questionnaire.questions as any[]).map((q, index) => {
      const answer = answers[index]
      return {
        question: q.question,
        answer: answer || q.answer || null,
      }
    })

    // Update questionnaire
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('custom_questionnaires')
      .update({
        questions,
        status: 'answered',
      })
      .eq('id', questionnaireId)
      .select()
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update questionnaire' },
        { status: 500 }
      )
    }

    // Check if both questionnaires are answered
    const { data: allQuestionnaires } = await supabaseAdmin
      .from('custom_questionnaires')
      .select('status')
      .eq('request_id', requestId)

    const allAnswered = allQuestionnaires && allQuestionnaires.length >= 2 && allQuestionnaires.every((q: any) => q.status === 'answered')

    if (allAnswered) {
      // Update connection status to questionnaire_completed (both custom questionnaires answered)
      // Note: This is different from the compatibility questionnaire completion
      const { error: updateError } = await supabaseAdmin
        .from('message_requests')
        .update({ connection_status: 'questionnaire_completed' })
        .eq('id', requestId)
      
      if (updateError) {
        console.error('Error updating connection status:', updateError)
      }
    }

    // Notify sender that answers are ready
    try {
      const receiverName = await getUserDisplayName(session.user.id)
      await createNotification({
        userId: updated.sender_id,
        type: 'questionnaire_answered',
        title: `${receiverName} answered your questions`,
        message: 'View their answers.',
        link: `/messaging/questionnaire/${requestId}`,
        metadata: { requestId, questionnaireId },
        dedupeKey: `questionnaire_answered:${questionnaireId}`,
      })
    } catch (e) {
      console.error('Failed to create questionnaire answered notification:', e)
    }

    return NextResponse.json(
      {
        message: 'Questionnaire answered successfully',
        questionnaire: {
          id: updated.id,
          requestId: updated.request_id,
          senderId: updated.sender_id,
          receiverId: updated.receiver_id,
          questions: updated.questions,
          status: updated.status,
          updatedAt: updated.updated_at,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Answer questionnaire error:', error)
    return NextResponse.json(
      { error: 'Failed to answer questionnaire' },
      { status: 500 }
    )
  }
}
