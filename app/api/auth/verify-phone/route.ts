import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { otp } = await req.json()

    if (!otp) {
      return NextResponse.json(
        { error: 'OTP code is required' },
        { status: 400 }
      )
    }

    // Get user's phone
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, phone, phone_verified')
      .eq('id', session.user.id)
      .single()

    if (userError || !user || !user.phone) {
      return NextResponse.json(
        { error: 'User or phone number not found' },
        { status: 404 }
      )
    }

    // Verify OTP
    const { verifyOTP } = await import('@/lib/otp')
    const isValid = verifyOTP(user.phone, otp, 'phone')

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    // OTP verified, update user
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ phone_verified: true })
      .eq('id', session.user.id)
      .select('id, phone, phone_verified')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Phone verification failed' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Phone verified successfully', 
        user: {
          id: updatedUser.id,
          phone: updatedUser.phone,
          phoneVerified: updatedUser.phone_verified,
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Phone verification error:', error)
    return NextResponse.json(
      { error: 'Phone verification failed' },
      { status: 500 }
    )
  }
}