import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { format, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  try {
    const [totalPosts, totalUsers, totalReplies] = await Promise.all([
      supabase.from('posts').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('replies').select('id', { count: 'exact', head: true }),
    ])

    // Posts per day — last 14 days
    const postsPerDay: { date: string, count: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      const { count } = await supabase
        .from('posts').select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
      postsPerDay.push({ date: format(d, 'MMM d'), count: count || 0 })
    }

    // Top 6 categories
    const { data: catPosts } = await supabase
      .from('posts').select('category_id, categories(name, slug)')
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
    const topCategories = Object.values(catCounts).sort((a, b) => b.count - a.count).slice(0, 6)

    // Active today
    const { data: todayPosts } = await supabase
      .from('posts').select('user_id')
      .eq('is_deleted', false)
      .gte('created_at', todayStart.toISOString())
    const activeToday = new Set((todayPosts || []).map(p => p.user_id)).size

    // Trust distribution
    const { data: trustRows } = await supabase.from('users').select('trust_level')
    const trustCounts: Record<string, number> = { new: 0, active: 0, trusted: 0, top: 0 }
    for (const u of trustRows || []) {
      const level = u.trust_level || 'new'
      trustCounts[level] = (trustCounts[level] || 0) + 1
    }
    const trustDistribution = [
      { name: 'New', value: trustCounts.new },
      { name: 'Active', value: trustCounts.active },
      { name: 'Trusted', value: trustCounts.trusted },
      { name: 'Top', value: trustCounts.top },
    ]

    // Reports per day — last 7 days
    const reportsPerDay: { date: string, count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const start = new Date(d); start.setHours(0, 0, 0, 0)
      const end = new Date(d); end.setHours(23, 59, 59, 999)
      const { count } = await supabase
        .from('reports').select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
      reportsPerDay.push({ date: format(d, 'MMM d'), count: count || 0 })
    }

    // Recent activity — last 10
    const { data: activityRows } = await supabase
      .from('activity_logs')
      .select('id, action, created_at, user_id, users(nickname)')
      .order('created_at', { ascending: false })
      .limit(10)
    const recentActivity = (activityRows || []).map((a: any) => ({
      id: a.id,
      action: a.action,
      created_at: a.created_at,
      nickname: a.users?.nickname || 'Unknown',
    }))

    // Posts today for delta
    const postsToday = todayPosts?.length || 0

    return NextResponse.json({
      totalPosts: totalPosts.count || 0,
      totalUsers: totalUsers.count || 0,
      totalReplies: totalReplies.count || 0,
      activeToday,
      postsToday,
      postsPerDay,
      topCategories,
      trustDistribution,
      reportsPerDay,
      recentActivity,
    })
  } catch (err) {
    return NextResponse.json({
      totalPosts: 0, totalUsers: 0, totalReplies: 0, activeToday: 0, postsToday: 0,
      postsPerDay: [], topCategories: [], trustDistribution: [], reportsPerDay: [], recentActivity: [],
    })
  }
}
