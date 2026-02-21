import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { notificationId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { notificationId } = params

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select('id')
      .single()

    if (error) {
      console.error('Mark read error:', error)
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    console.error('Mark read exception:', error)
    return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 })
  }
}

