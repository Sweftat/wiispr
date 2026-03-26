import { SupabaseClient } from '@supabase/supabase-js'

const TRUST_THRESHOLDS: Record<string, { min: number; next: string }> = {
  new:     { min: 10,  next: 'active' },
  active:  { min: 50,  next: 'trusted' },
  trusted: { min: 200, next: 'top' },
}

export async function addRep(supabase: SupabaseClient, userId: string, delta: number) {
  const { data: user } = await supabase
    .from('users')
    .select('rep_score, trust_level')
    .eq('id', userId)
    .single()

  if (!user) return

  const newRep = (user.rep_score || 0) + delta
  const updates: Record<string, any> = { rep_score: newRep }

  const threshold = TRUST_THRESHOLDS[user.trust_level || 'new']
  if (threshold && newRep >= threshold.min) {
    updates.trust_level = threshold.next

    // Notify user of trust level upgrade
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'milestone',
      message: `You've been promoted to ${threshold.next} member! 🎉`,
      is_read: false,
    })
  }

  await supabase.from('users').update(updates).eq('id', userId)
}
