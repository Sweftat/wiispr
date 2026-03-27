import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Weekly leaderboard: sum upvotes on posts created in the last 7 days
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: weeklyPosts } = await supabase
    .from('posts')
    .select('user_id, ghost_id, upvotes')
    .eq('is_deleted', false)
    .gte('created_at', oneWeekAgo)

  if (!weeklyPosts || weeklyPosts.length === 0) {
    return NextResponse.json({ leaderboard: [] })
  }

  // Aggregate score per user: sum of upvotes + count of posts * 5
  const userScores: Record<string, { score: number, ghostId: string, userId: string }> = {}
  for (const post of weeklyPosts) {
    const uid = post.user_id
    if (!userScores[uid]) {
      userScores[uid] = { score: 0, ghostId: post.ghost_id, userId: uid }
    }
    userScores[uid].score += (post.upvotes || 0) + 5 // +5 for posting
    userScores[uid].ghostId = post.ghost_id // use latest ghost_id
  }

  const sorted = Object.values(userScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // Get trust levels for these users
  const userIds = sorted.map(s => s.userId)
  const { data: users } = await supabase
    .from('users')
    .select('id, trust_level')
    .in('id', userIds)

  const trustMap: Record<string, string> = {}
  for (const u of users || []) {
    trustMap[u.id] = u.trust_level || 'new'
  }

  const leaderboard = sorted.map((s, i) => ({
    rank: i + 1,
    ghost_id: s.ghostId,
    rep_score: s.score,
    trust_level: trustMap[s.userId] || 'new',
  }))

  return NextResponse.json({ leaderboard })
}
