import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  gender: z.enum(['male', 'female']).optional(),
  age: z.number().int().min(18).max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, phone, password, gender, age } = registerSchema.parse(body)

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    // If table doesn't exist, the error will indicate that
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Check user error:', checkError)
      // PGRST116 is "not found" which is fine
      if (checkError.message?.includes('relation') || checkError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database tables not created. Please run the SQL migration in Supabase.' },
          { status: 500 }
        )
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Check if phone is already taken
    if (phone) {
      const { data: existingPhone, error: phoneCheckError } = await supabaseAdmin
        .from('users')
        .select('id, phone')
        .eq('phone', phone)
        .single()

      // Ignore "not found" errors (PGRST116)
      if (phoneCheckError && phoneCheckError.code !== 'PGRST116') {
        console.error('Check phone error:', phoneCheckError)
      }

      if (existingPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const { data: user, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        phone: phone || null,
        password: hashedPassword,
        gender: gender || null,
        age: age || null,
        email_verified: false,
        phone_verified: false,
        id_verified: false,
        profile_active: false,
      })
      .select('id, email, phone, email_verified, phone_verified, created_at')
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      
      // Check if it's a table missing error
      if (insertError.message?.includes('relation') || insertError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database tables not created. Please run the SQL migration in Supabase Dashboard > SQL Editor.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Registration failed', details: insertError.message },
        { status: 500 }
      )
    }

    // Automatically send OTP for email verification after registration
    try {
      const { generateOTP, storeOTP } = await import('@/lib/otp')
      const { sendOTPEmail } = await import('@/lib/email')
      
      const emailOtp = generateOTP()
      storeOTP(email, emailOtp, 'email')
      await sendOTPEmail(email, emailOtp)
      
      // If phone provided, also send phone OTP
      if (phone) {
        const { sendOTPSMS } = await import('@/lib/sms')
        const phoneOtp = generateOTP()
        storeOTP(phone, phoneOtp, 'phone')
        await sendOTPSMS(phone, phoneOtp)
      }
    } catch (otpError) {
      console.error('Failed to send OTP after registration:', otpError)
      // Don't fail registration if OTP sending fails
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully', 
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          createdAt: user.created_at,
        }
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

    console.error('Registration error:', error)
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    
    return NextResponse.json(
      { 
        error: 'Registration failed',
        message: errorMessage,
        // Only include details in development
        ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
      },
      { status: 500 }
    )
  }
}