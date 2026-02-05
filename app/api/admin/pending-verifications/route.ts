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

    // Check if user is admin
    if (!session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, phone, id_document_url, email_verified, phone_verified, created_at')
      .not('id_document_url', 'is', null)
      .eq('id_verified', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch pending verifications' },
        { status: 500 }
      )
    }

    const formattedUsers = (users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      idDocumentUrl: user.id_document_url,
      emailVerified: user.email_verified,
      phoneVerified: user.phone_verified,
      createdAt: user.created_at,
    }))

    return NextResponse.json({ users: formattedUsers }, { status: 200 })
  } catch (error) {
    console.error('Pending verifications fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending verifications' },
      { status: 500 }
    )
  }
}