import { supabaseAdmin } from '@/lib/supabase'

export type NotificationType =
  | 'message'
  | 'request'
  | 'request_approved'
  | 'request_rejected'
  | 'questionnaire'
  | 'questionnaire_answered'

export interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  metadata?: Record<string, any>
  dedupeKey?: string
}

export async function createNotification(params: CreateNotificationParams) {
  const payload = {
    user_id: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? null,
    metadata: params.metadata ?? {},
    dedupe_key: params.dedupeKey ?? null,
    is_read: false,
    read_at: null,
  }

  const { data, error } = await supabaseAdmin
    .from('notifications')
    .upsert(payload, params.dedupeKey ? { onConflict: 'user_id,dedupe_key' } : undefined)
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create notification:', error)
    return null
  }

  return data
}

export async function getUserDisplayName(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('first_name,last_name')
    .eq('user_id', userId)
    .single()

  const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : ''
  if (fullName) return fullName

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  return user?.email || 'Someone'
}

