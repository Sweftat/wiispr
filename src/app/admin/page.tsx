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

  const { data: postsPerDay } = await supabase
    .rpc('get_posts_per_day', { days_back: 30 })

  const { data: usersPerDay } = await supabase
    .rpc('get_users_per_day', { days_back: 30 })

  const { data: categoryStats } = await supabase
    .from('posts')
    .select('categories(name)')
    .eq('is_deleted', false)

  return (
    <AdminShell
      admin={user}
      flaggedPosts={flaggedPosts || []}
      allUsers={allUsers || []}
      activityLogs={activityLogs || []}
      categories={categories || []}
      recentPosts={recentPosts || []}
      postsPerDay={postsPerDay || []}
      usersPerDay={usersPerDay || []}
      categoryStats={categoryStats || []}
      stats={{ totalPosts: totalPosts || 0, totalUsers: totalUsers || 0, totalReports: totalReports || 0 }}
    />
  )
}