import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const setAdminSchema = z.object({
  email: z.string().email(),
  isAdmin: z.boolean(),
})

// This endpoint allows setting admin status
// In production, you might want to restrict this further or use environment variables
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
    
    // For security, you can restrict this to only work in development
    // or require a special admin setup token
    const adminSetupToken = process.env.ADMIN_SETUP_TOKEN
    if (adminSetupToken) {
      const { token } = body
      if (token !== adminSetupToken) {
        return NextResponse.json(
          { error: 'Invalid setup token' },
          { status: 403 }
        )
      }
    }

    const { email, isAdmin } = setAdminSchema.parse(body)

    // Update user admin status
    const { data: user, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ is_admin: isAdmin })
      .eq('email', email)
      .select('id, email, is_admin')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update admin status' },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        message: `Admin status ${isAdmin ? 'granted' : 'revoked'} for ${email}`,
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin,
        },
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

    console.error('Set admin error:', error)
    return NextResponse.json(
      { error: 'Failed to update admin status' },
      { status: 500 }
    )
  }
}
