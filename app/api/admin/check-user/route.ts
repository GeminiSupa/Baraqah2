import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Helper endpoint to check if a user exists and their status
// This is for troubleshooting - remove or secure in production
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, email_verified, phone_verified, id_verified, profile_active, is_admin, created_at')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'User not found', email: email },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', email: email },
        { status: 404 }
      )
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        idVerified: user.id_verified,
        profileActive: user.profile_active,
        isAdmin: user.is_admin || false,
        createdAt: user.created_at,
      },
    }, { status: 200 })
  } catch (error) {
    console.error('Check user error:', error)
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    )
  }
}
