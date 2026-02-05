import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { generateOTP, storeOTP } from '@/lib/otp'
import { sendOTPEmail } from '@/lib/email'
import { sendOTPSMS } from '@/lib/sms'
import { z } from 'zod'

const otpRequestSchema = z.object({
  type: z.enum(['email', 'phone']),
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
    const { type } = otpRequestSchema.parse(body)

    // Get user's email or phone
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('email, phone')
      .eq('id', session.user.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let identifier: string
    let otp: string

    if (type === 'email') {
      if (!user.email) {
        return NextResponse.json(
          { error: 'Email not found' },
          { status: 400 }
        )
      }
      identifier = user.email
      otp = generateOTP()
      storeOTP(identifier, otp, 'email')
      
      // Send OTP via email
      const sent = await sendOTPEmail(user.email, otp)
      if (!sent) {
        return NextResponse.json(
          { error: 'Failed to send OTP email' },
          { status: 500 }
        )
      }
    } else {
      if (!user.phone) {
        return NextResponse.json(
          { error: 'Phone number not found' },
          { status: 400 }
        )
      }
      identifier = user.phone
      otp = generateOTP()
      storeOTP(identifier, otp, 'phone')
      
      // Send OTP via SMS
      const sent = await sendOTPSMS(user.phone, otp)
      if (!sent) {
        return NextResponse.json(
          { error: 'Failed to send OTP SMS' },
          { status: 500 }
        )
      }
    }

    // In development, also return OTP for testing (remove in production)
    return NextResponse.json(
      {
        message: `OTP sent to your ${type}`,
        ...(process.env.NODE_ENV === 'development' && {
          otp: otp, // Only in development!
          warning: 'This OTP is shown only in development mode',
        }),
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}
