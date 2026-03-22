cat > /tmp/fix_admin_page.py << 'PYEOF'
import os
path = os.path.expanduser('~/wiispr/src/app/admin/page.tsx')
code = """import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav'
import AdminDashboard from '@/components/AdminDashboard'

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

  const { data: recentUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

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

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <AdminDashboard
        flaggedPosts={flaggedPosts || []}
        recentUsers={recentUsers || []}
        stats={{ totalPosts: totalPosts || 0, totalUsers: totalUsers || 0, totalReports: totalReports || 0 }}
      />
    </main>
  )
}
"""
open(path, 'w').write(code)
print('done')
PYEOF
python3 /tmp/fix_admin_page.py