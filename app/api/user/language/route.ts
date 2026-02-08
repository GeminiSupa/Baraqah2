import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

const validLocales = ['en', 'de', 'it', 'ur', 'ar'] as const
type Locale = typeof validLocales[number]

function isValidLocale(locale: string): locale is Locale {
  return validLocales.includes(locale as Locale)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('preferred_language')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Error fetching user language:', error)
      return NextResponse.json(
        { error: 'Failed to fetch language preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      language: user?.preferred_language || 'en',
    }, { status: 200 })
  } catch (error) {
    console.error('Language fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch language preference' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { language } = body

    if (!language || !isValidLocale(language)) {
      return NextResponse.json(
        { error: 'Invalid language code. Must be one of: en, de, it, ur, ar' },
        { status: 400 }
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ preferred_language: language })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Error updating user language:', updateError)
      return NextResponse.json(
        { error: 'Failed to update language preference' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Language preference updated successfully',
      language,
    }, { status: 200 })
  } catch (error) {
    console.error('Language update error:', error)
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    )
  }
}
