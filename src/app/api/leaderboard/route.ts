import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get top 10 users by rep_score with their most recent ghost ID
  const { data: topUsers } = await supabase
    .from('users')
    .select('id, nickname, rep_score, trust_level')
    .order('rep_score', { ascending: false })
    .limit(10)

  if (!topUsers || topUsers.length === 0) {
    return NextResponse.json({ leaderboard: [] })
  }

  // Get the most recent ghost_id for each user
  const leaderboard = await Promise.all(
    topUsers.map(async (user, index) => {
      const { data: latestPost } = await supabase
        .from('posts')
        .select('ghost_id')
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      return {
        rank: index + 1,
        ghost_id: latestPost?.ghost_id || `Ghost #${String(user.id).slice(0, 4)}`,
        rep_score: user.rep_score || 0,
        trust_level: user.trust_level || 'new',
      }
    })
  )

  return NextResponse.json({ leaderboard })
}
