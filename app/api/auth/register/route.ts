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

    // Get language preference from cookie or default to 'en'
    const cookieHeader = req.headers.get('cookie') || ''
    const languageMatch = cookieHeader.match(/preferred-language=([^;]+)/)
    const preferredLanguage = languageMatch ? languageMatch[1] : 'en'
    
    // Validate language code
    const validLanguages = ['en', 'de', 'it', 'ur', 'ar']
    const userLanguage = validLanguages.includes(preferredLanguage) ? preferredLanguage : 'en'

    // Create user (no email/phone verification required)
    const { data: user, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        phone: phone || null,
        password: hashedPassword,
        gender: gender || null,
        age: age || null,
        email_verified: true,
        phone_verified: true,
        id_verified: false,
        profile_active: false,
        preferred_language: userLanguage,
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