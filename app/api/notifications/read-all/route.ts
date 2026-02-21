import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      console.error('Mark all read error:', error)
      return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OK' }, { status: 200 })
  } catch (error) {
    console.error('Mark all read exception:', error)
    return NextResponse.json({ error: 'Failed to mark notifications as read' }, { status: 500 })
  }
}

