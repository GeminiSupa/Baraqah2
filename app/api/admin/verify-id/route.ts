import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
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

    const { userId, verified } = await req.json()

    if (!userId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        id_verified: verified,
        profile_active: verified, // Activate profile when ID is verified
      })
      .eq('id', userId)
      .select('id, email, id_verified, profile_active')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update verification status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: `ID verification ${verified ? 'approved' : 'rejected'}`, 
        user: {
          id: user.id,
          email: user.email,
          idVerified: user.id_verified,
          profileActive: user.profile_active,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('ID verification update error:', error)
    return NextResponse.json(
      { error: 'Failed to update verification status' },
      { status: 500 }
    )
  }
}