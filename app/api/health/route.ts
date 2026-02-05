import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Health check endpoint to test Supabase connection
export async function GET() {
  try {
    // Try to query a simple table to check connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      // Check if it's a "table doesn't exist" error
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Database tables not created',
            error: 'Please run the SQL migration in Supabase Dashboard > SQL Editor',
            details: error.message,
          },
          { status: 500 }
        )
      }

      return NextResponse.json(
        {
          status: 'error',
          message: 'Supabase connection error',
          error: error.message,
          code: error.code,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        message: 'Supabase connection successful',
        tablesExist: true,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
