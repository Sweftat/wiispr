import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('wiispr_user_id')?.value
  if (!userId) redirect('/')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: user } = await supabase
    .from('users')
    .select('is_admin, nickname')
    .eq('id', userId)
    .single()

  if (!user?.is_admin) redirect('/')

  const { data: flaggedPosts } = await supabase
    .from('posts')
    .select('*, categories(name), reports(id, reason, created_at)')
    .eq('is_blurred', true)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: activityLogs } = await supabase
    .from('activity_logs')
    .select('*, users(nickname)')
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  const { count: totalPosts } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)

  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })

  const { data: recentPosts } = await supabase
    .from('posts')
    .select('*, categories(name)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(7)

  // Posts per day - last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: rawPosts } = await supabase
    .from('posts')
    .select('created_at')
    .eq('is_deleted', false)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const postsByDate: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    postsByDate[d.toISOString().split('T')[0]] = 0
  }
  for (const p of rawPosts || []) {
    const key = p.created_at.split('T')[0]
    if (postsByDate[key] !== undefined) postsByDate[key]++
  }
  const postsPerDay = Object.entries(postsByDate).map(([date, count]) => ({ date, count }))

  // Users per day - last 30 days
  const { data: rawUsers } = await supabase
    .from('users')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const usersByDate: Record<string, number> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    usersByDate[d.toISOString().split('T')[0]] = 0
  }
  for (const u of rawUsers || []) {
    const key = u.created_at.split('T')[0]
    if (usersByDate[key] !== undefined) usersByDate[key]++
  }
  const usersPerDay = Object.entries(usersByDate).map(([date, count]) => ({ date, count }))

  const { data: categoryStats } = await supabase
    .from('posts')
    .select('categories(name)')
    .eq('is_deleted', false)

  // Active today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: activeToday } = await supabase
    .from('activity_logs')
    .select('user_id', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  return (
    <AdminShell
      admin={user}
      flaggedPosts={flaggedPosts || []}
      allUsers={allUsers || []}
      activityLogs={activityLogs || []}
      categories={categories || []}
      recentPosts={recentPosts || []}
      postsPerDay={postsPerDay}
      usersPerDay={usersPerDay}
      categoryStats={categoryStats || []}
      stats={{ totalPosts: totalPosts || 0, totalUsers: totalUsers || 0, totalReports: totalReports || 0, activeToday: activeToday || 0 }}
    />
  )
}