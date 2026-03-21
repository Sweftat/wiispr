import Nav from '@/components/Nav'
import Feed from '@/components/Feed'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  const { data: categories } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  const { data: posts } = await supabase.from('posts').select('*, categories(name, slug)').eq('is_deleted', false).eq('is_blurred', false).order('created_at', { ascending: false }).limit(20)

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
            <div style={{ background: 'var(--sur)', border: '1px solid var(--bd)', borderRadius: 'var(--rm)', overflow: 'hidden' }}>
              {categories?.map((cat: any, i: number) => (
                <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < categories.length-1 ? '1px solid var(--bd)' : 'none', cursor: 'pointer' }}>
                  <span>{cat.icon}</span>
                  <span style={{ fontSize: '.8375rem', color: 'var(--t2)', fontWeight: 500 }}>{cat.name}</span>
                  {cat.women_only && <span style={{ marginLeft: 'auto', fontSize: '.55rem', fontWeight: 700, color: 'var(--rose)', background: 'var(--rose-d)', padding: '1px 5px', borderRadius: 3 }}>Women</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}