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

    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10) || 20, 50)
    const cursor = searchParams.get('cursor') // created_at ISO string

    let query = supabaseAdmin
      .from('notifications')
      .select('id,type,title,message,link,is_read,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (cursor) {
      query = query.lt('created_at', cursor)
    }

    const { data: rows, error } = await query

    if (error) {
      console.error('Notifications query error:', error)
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
    }

    const { count: unreadCount, error: countError } = await supabaseAdmin
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (countError) {
      console.error('Unread count error:', countError)
    }

    return NextResponse.json(
      {
        notifications: (rows || []).map((n: any) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.is_read,
          createdAt: n.created_at,
        })),
        unreadCount: unreadCount || 0,
        nextCursor: rows && rows.length > 0 ? rows[rows.length - 1].created_at : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}
