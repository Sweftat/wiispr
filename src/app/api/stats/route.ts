import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [totalPosts, postsToday, totalUsers, activeGhosts] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', todayStart.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('ghost_id').eq('is_deleted', false).gte('created_at', weekAgo),
  ])

  // Count active ghost IDs and get top 5
  const ghostCounts: Record<string, number> = {}
  for (const p of activeGhosts.data || []) {
    ghostCounts[p.ghost_id] = (ghostCounts[p.ghost_id] || 0) + 1
  }
  const topGhosts = Object.entries(ghostCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([ghost_id, count]) => ({ ghost_id, count }))

  return NextResponse.json({
    totalPosts: totalPosts.count || 0,
    postsToday: postsToday.count || 0,
    totalUsers: totalUsers.count || 0,
    activeGhosts: topGhosts,
  })
}
