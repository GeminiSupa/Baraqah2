import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prevent admin deletion through this endpoint
    if (session.user.isAdmin) {
      return NextResponse.json(
        { error: 'Admins cannot delete their account through this endpoint' },
        { status: 403 }
      )
    }

    const userId = session.user.id

    // Delete user account (cascade will handle related data: profile, photos, messages, etc.)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .eq('is_admin', false) // Safety check

    if (deleteError) {
      console.error('Delete profile error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Profile and account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    )
  }
}
