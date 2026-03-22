import Nav from '@/components/Nav'
import Feed from '@/components/Feed'
import SidebarCategories from '@/components/SidebarCategories'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  const { data: posts } = await supabase.from('posts').select('*, categories(name, slug), users(trust_level)').eq('is_deleted', false).eq('is_blurred', false).order('created_at', { ascending: false }).limit(20)

  return (
    <main style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '20px' }}>
        <div className="feed-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div>
            <Feed initialPosts={posts || []} categories={categories || []} />
          </div>
          <div className="feed-sidebar">
            <p style={{ fontSize: '.625rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 10 }}>Categories</p>
            <SidebarCategories categories={categories || []} />
          </div>
        </div>
      </div>
    </main>
  )
}