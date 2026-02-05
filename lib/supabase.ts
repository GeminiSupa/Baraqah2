import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Validate environment variables
if (!supabaseUrl) {
  console.error('⚠️ NEXT_PUBLIC_SUPABASE_URL is not set in environment variables')
}

if (!supabaseServiceKey) {
  console.error('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
}

// Server-side client with service role key (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Client-side client with anon key (for user operations)
export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)