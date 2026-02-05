import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const reportSchema = z.object({
  reportedUserId: z.string(),
  reason: z.string().min(1),
  description: z.string().optional(),
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
    const { reportedUserId, reason, description } = reportSchema.parse(body)

    if (reportedUserId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot report yourself' },
        { status: 400 }
      )
    }

    // Check if user already reported this user
    const { data: existingReport } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('reporter_id', session.user.id)
      .eq('reported_user_id', reportedUserId)
      .eq('status', 'pending')
      .single()

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this user' },
        { status: 400 }
      )
    }

    // Create report
    const { data: report, error: insertError } = await supabaseAdmin
      .from('reports')
      .insert({
        reporter_id: session.user.id,
        reported_user_id: reportedUserId,
        reason,
        description: description || null,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Report submitted successfully. Our team will review it.',
        report: {
          id: report.id,
          status: report.status,
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

    console.error('Report submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    )
  }
}
