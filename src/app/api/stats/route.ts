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
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [totalPosts, postsToday, totalUsers, totalReplies] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', todayStart.toISOString()),
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase.from('replies').select('id', { count: 'exact', head: true }),
  ])

  // Posts per day for last 7 days
  const postsPerDay: { date: string, count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const start = new Date(d); start.setHours(0, 0, 0, 0)
    const end = new Date(d); end.setHours(23, 59, 59, 999)
    const { count } = await supabase
      .from('posts').select('id', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
    postsPerDay.push({
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      count: count || 0
    })
  }

  // Top categories
  const { data: catPosts } = await supabase
    .from('posts')
    .select('category_id, categories(name, slug)')
    .eq('is_deleted', false)

  const catCounts: Record<string, { name: string, slug: string, count: number }> = {}
  for (const p of catPosts || []) {
    const cat = p.categories as any
    if (cat?.name) {
      const key = cat.slug || cat.name
      if (!catCounts[key]) catCounts[key] = { name: cat.name, slug: cat.slug || '', count: 0 }
      catCounts[key].count++
    }
  }
  const topCategories = Object.values(catCounts).sort((a, b) => b.count - a.count).slice(0, 5)

  // Active today (distinct users who posted today)
  const { data: todayPosts } = await supabase
    .from('posts').select('user_id')
    .eq('is_deleted', false)
    .gte('created_at', todayStart.toISOString())
  const activeToday = new Set((todayPosts || []).map(p => p.user_id)).size

  return NextResponse.json({
    totalPosts: totalPosts.count || 0,
    postsToday: postsToday.count || 0,
    totalUsers: totalUsers.count || 0,
    totalReplies: totalReplies.count || 0,
    activeToday,
    postsPerDay,
    topCategories,
  })
}
